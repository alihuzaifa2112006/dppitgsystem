import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import {
  Box,
  Card,
  TextField,
  InputAdornment,
  Tooltip,
  IconButton,
  Stack,
  Tabs,
  Tab,
  alpha,
  Button,
} from '@mui/material';
import { LoadingScreen } from 'src/components/loading-screen';
import Iconify from 'src/components/iconify';
import { Get, Put } from 'src/api/apibasemethods';
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';
import Label from 'src/components/label';
import UploadExcelDialog from './excel-import-dialog';
import PropTypes from 'prop-types';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { enqueueSnackbar } from 'notistack';
import { paths } from 'src/routes/paths';
import { useNavigate } from 'react-router';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

const getClassColor = (className) => {
  const colorMap = {
    'Finished Goods': 'success',
    Waste: 'error',
    // Clips: 'info',
    'Raw Material': 'warning',
    // 'Semi-Finished': 'primary',
    // Add more mappings as needed
  };

  return colorMap[className] || 'default';
};

const ItemListView = ({ uploadOpen, uploadClose, data }) => {
  const gridRef = useRef();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const confirm = useBoolean();
  const navigate = useNavigate();

  const settings = useSettingsContext();
  const [rowData, setRowData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedID, setselectedID] = useState(null);
  const [allClasses, setAllClasses] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    name: '',
  });
  const [columnDefs, setColumnDefs] = useState([]);

  // Get unique class names for tabs
  const classOptions = useMemo(() => {
    const uniqueClasses = [...new Set(rowData.map((item) => item.ClassName))].filter(Boolean);
    return [
      { value: 'all', label: 'All' },
      ...uniqueClasses.map((cls) => ({ value: cls, label: cls })),
    ];
  }, [rowData]);

  const selectedTab = useMemo(
    () =>
      allClasses.find((c) => c.ClassName === filters.status) || {
        ClassName: 'all',
        isColorSensitive: true,
      },
    [allClasses, filters.status]
  );

  const actionButtonsRenderer = (params) => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {editButtonRenderer(params)}
      {deleteButtonRenderer(params)}
    </div>
  );

  const deleteButtonRenderer = (params) => (
    <Tooltip title="Delete" arrow>
      <IconButton
        onClick={() => {
          setselectedID(params.data.ItemID);
          confirm.onTrue();
        }}
        size="small"
        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:trash-bin-trash-bold" width="20" height="20" />
      </IconButton>
    </Tooltip>
  );

  const moveToEditForm = (ItemID) => {
    navigate(paths.dashboard.InventoryManagement.ItemOpenDatabase.edit(ItemID));
  };
  // paths.dashboard.transaction.pi

  const editButtonRenderer = (params) => (
    <Tooltip title="Edit" arrow>
      <IconButton
        onClick={() => moveToEditForm(params.data.ItemID)}
        size="small"
        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:pen-bold" width={18} />
      </IconButton>
    </Tooltip>
  );
  const deleteItem = async () => {
    if (!selectedID) {
      enqueueSnackbar('Item not selected.', { variant: 'error' });
      return;
    }

    const payload = {
      ItemID: selectedID,
      Org_Id: userData?.userDetails?.orgId,
      Branch_Id: userData?.userDetails?.branchID,
      DeletedBy: userData?.userDetails?.userId,
    };

    try {
      const response = await Put('InvItemDBDelete', payload);

      if (response.status === 200) {
        enqueueSnackbar('Item deleted successfully', { variant: 'success' });
        fetchData();
      } else {
        enqueueSnackbar('Failed to delete Item', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting Item:', error);
      enqueueSnackbar(error.response?.data || 'Error deleting Item', { variant: 'error' });
    }
  };
  // Base column definitions
  const baseColDefs = useMemo(
    () => [
      {
        field: 'CreatedByName',
        headerName: 'Created By',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'ItemCode',
        headerName: 'Item Code',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ItemDescription',
        headerName: 'Item Name',
        minWidth: 250,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ClassName',
        headerName: 'Item Type',
        minWidth: 120,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Inv_Cat_Name',
        headerName: 'Category',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
        hide: filters.status === 'Finished Goods',
      },
      {
        field: 'SubCat_Name',
        headerName: 'Sub Category',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
        hide: filters.status === 'Finished Goods',
      },
      {
        field: 'ColorFamilyName',
        headerName: 'Color Comment',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
        hide: !selectedTab?.isColorSensitive || false,
      },
      {
        field: 'ColorName',
        headerName: 'Color',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
        hide: !selectedTab?.isColorSensitive || false,
      },
      {
        field: 'InvSpecsName',
        headerName: 'Specifications',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
        // hide: !selectedTab?.isColorSensitive || false,
      },
      {
        field: 'UOMName',
        headerName: 'UOM',
        minWidth: 80,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ReOrderQty',
        headerName: 'Reorder Qty',
        minWidth: 120,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
        valueFormatter: (params) => `${params.value?.toFixed(2)} ${params.data?.UOMName}` || '0.00',
        filter: 'agNumberColumnFilter',
      },
      // {
      //   field: 'SafetyStockQty',
      //   headerName: 'Safety Stock',
      //   minWidth: 120,
      //   type: 'numericColumn',
      //   cellStyle: { textAlign: 'right' },
      //   valueFormatter: (params) => `${params.value?.toFixed(2)} ${params.data?.UOMName}` || '0.00',
      //   filter: 'agNumberColumnFilter',
      // },
      {
        field: 'actions',
        headerName: '',
        minWidth: 80,
        pinned: 'right',
        sortable: false,
        filter: false,
        resizable: false,
        // suppressSizeToFit: true,
        cellRenderer: actionButtonsRenderer,
        lockPosition: 'right',
        cellStyle: { textAlign: 'center' },
      },
    ],
    // eslint-disable-next-line
    [filters.status]
  );

  // Yarn-related column definitions
  const yarnColDefs = useMemo(
    () => [
      {
        field: 'Yarn_Type',
        headerName: 'Yarn Type',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'Yarn_Count_Name',
        headerName: 'Yarn Count',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'Composition_Name',
        headerName: 'Composition',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
    ],
    []
  );

  // Update column definitions based on filter status
  const updateColumnDefs = useCallback(
    (status) => {
      const showYarnColumns = status === 'all' || status === 'Finished Goods';

      if (showYarnColumns) {
        setColumnDefs([...baseColDefs, ...yarnColDefs]);
      } else {
        setColumnDefs(baseColDefs);
      }
    },
    [baseColDefs, yarnColDefs]
  );

  // Fetch data
  const fetchData = useCallback(async () => {
    // if (rowData?.length === 0) {
    try {
      setIsLoading(true);
      const response = await Get(
        `GetAllItemFrmDB?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      const res = await Get(
        `GetAllClasses?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      setAllClasses(res?.data?.Data || []);

      if (response.status === 200) {
        setRowData(response.data);
        setFilteredData(response.data);
        // Initialize column definitions after data is loaded
        updateColumnDefs(filters.status);
      }
    } catch (error) {
      console.error('Failed to fetch item data:', error);
    } finally {
      setIsLoading(false);
    }
    // }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    filters.status,
    updateColumnDefs,
    // rowData
  ]);

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update column definitions when filter changes
  useEffect(() => {
    updateColumnDefs(filters.status);
  }, [filters.status, updateColumnDefs]);

  // Filter data based on search term and class filter
  useEffect(() => {
    if (!rowData.length) return;

    const term = searchTerm.toLowerCase();
    let filtered = rowData;

    // Apply class filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((item) => item.ClassName === filters.status);
    }

    // Apply search filter
    if (term) {
      filtered = filtered.filter(
        (item) =>
          item.ItemCode.toLowerCase().includes(term) ||
          item.ItemDescription.toLowerCase().includes(term) ||
          (item.ClassName && item.ClassName.toLowerCase().includes(term)) ||
          (item.Inv_Cat_Name && item.Inv_Cat_Name.toLowerCase().includes(term))
      );
    }

    setFilteredData(filtered);
  }, [searchTerm, rowData, filters.status]);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      suppressMovable: false,
    }),
    []
  );

  const onFirstDataRendered = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleFilterStatus = useCallback((event, newValue) => {
    setFilters((prev) => ({ ...prev, status: newValue }));
  }, []);

  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
        <TextField
          label="Search Items"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" width={20} />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
        <Stack direction="row" spacing={1}>
          <Tooltip title="Zoom in" arrow placement="top">
            <IconButton
              color="primary"
              sx={{ border: '1px solid #eee' }}
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 1.5))}
            >
              <Iconify icon="ant-design:zoom-in-outlined" width={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom out" arrow placement="top">
            <IconButton
              color="primary"
              sx={{ border: '1px solid #eee' }}
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.7))}
            >
              <Iconify icon="ant-design:zoom-out-outlined" width={20} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Tabs for filtering by ClassName */}
      <Tabs
        value={filters.status}
        onChange={handleFilterStatus}
        sx={{
          px: 2.5,
          mb: 2,
          boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
        }}
      >
        {classOptions.map((tab) => (
          <Tab
            key={tab.value}
            iconPosition="end"
            value={tab.value}
            label={tab.label}
            icon={
              <Label
                variant={
                  ((tab.value === filters.status || tab.value === 'all') && 'filled') || 'soft'
                }
                color={tab.value === 'all' ? 'primary' : getClassColor(tab.value)}
              >
                {tab.value === 'all'
                  ? rowData.length
                  : rowData.filter((item) => item.ClassName === tab.value).length}
              </Label>
            }
          />
        ))}
      </Tabs>

      <Scrollbar>
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            width: `${100 / zoomLevel}%`,
            height: `${100 / zoomLevel}%`,
          }}
        >
          <AgGridReact
            className="ag-theme-material"
            theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
            ref={gridRef}
            rowData={isLoading ? [] : filteredData} // Empty array during loading
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowHeight={35}
            headerHeight={40}
            animateRows
            pagination
            paginationPageSize={20}
            onFirstDataRendered={onFirstDataRendered}
            domLayout="autoHeight"
            // Skeleton loading configuration
            loading={isLoading}
          // loadingOverlayComponent={SkeletonLoader} // 👈 custom loader
          />
        </div>
      </Scrollbar>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
          setselectedID(null); // Clear selected PIID on close
        }}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              // deleteButtonRenderer();
              deleteItem();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
      <UploadExcelDialog
        uploadOpen={uploadOpen}
        uploadClose={uploadClose}
        FetchUpdatedData={() => {
          fetchData();
        }}
        data={data}
        tableData={rowData}
      />
    </Card>
  );
};

export default ItemListView;

ItemListView.propTypes = {
  uploadOpen: PropTypes.bool,
  uploadClose: PropTypes.func,
  data: PropTypes.object,
};
