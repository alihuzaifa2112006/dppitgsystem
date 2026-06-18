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
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { LoadingScreen } from 'src/components/loading-screen';
import Iconify from 'src/components/iconify';
import { Delete, Get } from 'src/api/apibasemethods';
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';
import Label from 'src/components/label';
import UploadExcelDialog from './excel-import-dialog';
import PropTypes from 'prop-types';
import { paths } from 'src/routes/paths';
import { useNavigate } from 'react-router';
import { enqueueSnackbar } from 'notistack';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

const getClassColor = (className) => {
  const colorMap = {
    'Finished Goods': 'success',
    Waste: 'error',
    'Raw Material': 'warning',
  };
  return colorMap[className] || 'default';
};

const ItemOpenSheetGrid = ({ uploadOpen, uploadClose, data }) => {
  const gridRef = useRef();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const settings = useSettingsContext();
  const navigate = useNavigate();

  const [rowData, setRowData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    name: '',
  });

  const confirm = useBoolean();
  const [deleteId, setDeleteId] = useState(null);

  const moveToEditForm = (ItemID) => {
    navigate(paths.dashboard.InventoryManagement.ItemOpen.edit(ItemID));
  };
  // paths.dashboard.transaction.pi

  const editButtonRenderer = (params) => (
    <Tooltip title="Edit" arrow>
      <IconButton
        onClick={() => moveToEditForm(params.data.ItemOpenID)}
        size="small"
        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:pen-bold" width={18} />
      </IconButton>
    </Tooltip>
  );

  const deleteItem = async () => {
    try {
      const res = await Delete(
        `InvItemOpeningDelete?ItemOpenID=${deleteId}&Org_Id=${userData?.userDetails?.orgId}&Branch_Id=${userData?.userDetails?.branchId}&DeletedBy=${userData?.userDetails?.userId}`
      );
      if (res?.status === 200) {
        enqueueSnackbar('Item deleted successfully', { variant: 'success' });
        fetchData();
        confirm.onFalse();
      }
    } catch (error) {
      console.error('Delete Error:', error);
      enqueueSnackbar('Failed to delete item', { variant: 'error' });
    }
  };

  const deleteButtonRenderer = (params) => (
    <Tooltip title="Delete" arrow>
      <IconButton
        onClick={() => {
          setDeleteId(params.data.ItemOpenID);
          confirm.onTrue();
        }}
        size="small"
        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:trash-bin-trash-bold" width={18} />
      </IconButton>
    </Tooltip>
  );
  const actionButtonsRenderer = useCallback((params) => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {editButtonRenderer(params)}
      {deleteButtonRenderer(params)}
    </div>
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ), []);

  // Master grid column definitions (Vendors)
  const masterColumnDefs = useMemo(
    () => [
      {
        field: 'expand',
        maxWidth: 50,
        headerName: '',
        minWidth: 35,
        filter: false,
        autosize: true,
        sortable: false,
        resizable: false,
        lockPosition: 'left',
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
          suppressCount: true,
          innerRenderer: (params) => (params.value ? params.value : ''),
        },
        cellStyle: { marginTop: '2px' },
      },
      {
        field: 'VendorName',
        headerName: 'Vendor Name',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'VendorType',
        headerName: 'Vendor Type',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Total Items',
        minWidth: 100,
        valueGetter: (params) => params.data.Items?.length || 0,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
      },
    ],
    []
  );

  // Detail grid column definitions (Items)
  const detailColumnDefs = useMemo(
    () => [
      {
        field: 'expand',
        maxWidth: 50,
        headerName: '',
        minWidth: 35,
        filter: false,
        autosize: true,
        sortable: false,
        resizable: false,
        lockPosition: 'left',
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
          suppressCount: true,
          innerRenderer: (params) => (params.value ? params.value : ''),
        },
        cellStyle: { marginTop: '2px' },
      },
      {
        field: 'ItemCode',
        headerName: 'Item Code',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ItemDescription',
        headerName: 'Item Description',
        minWidth: 250,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ColorFamilyName',
        headerName: 'Color Family',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'ColorName',
        headerName: 'Color',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        headerName: 'Total Openings',
        minWidth: 120,
        valueGetter: (params) => params.data.ItemOpenings?.length || 0,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'actions',
        headerName: '',
        minWidth: 80,
        maxWidth: 80,
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
    [actionButtonsRenderer]
  );

  // Sub-detail grid column definitions (Item Openings)
  const subDetailColumnDefs = useMemo(
    () => [
      {
        field: 'StoreName',
        headerName: 'Store',
        minWidth: 120,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'LocationName',
        headerName: 'Storage Location',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'OpenStockQty',
        headerName: 'Opening Stock Qty',
        minWidth: 150,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
        valueFormatter: (params) => `${params.value} ${params.data.UOMName}`,
        filter: 'agNumberColumnFilter',
      },
      {
        field: 'AveragePrice',
        headerName: 'Average Price',
        minWidth: 120,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
        // eslint-disable-next-line
        valueFormatter: (params) => (params.data.CurrencyID === 8 ? '৳' : '$' + params.value),
        filter: 'agNumberColumnFilter',
      },
      {
        field: 'TotalPriceinUSD',
        headerName: 'Total Price (USD)',
        minWidth: 150,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
        valueFormatter: (params) => `$${params.value}`,
        filter: 'agNumberColumnFilter',
      },
      {
        field: 'TotalPriceinBDT',
        headerName: 'Total Price (BDT)',
        minWidth: 150,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
        valueFormatter: (params) => `৳${params.value}`,
        filter: 'agNumberColumnFilter',
      },
      // {
      //   field: 'UOMName',
      //   headerName: 'UOM',
      //   minWidth: 80,
      //   filter: 'agTextColumnFilter',
      // },
      {
        field: 'CurrencyName',
        headerName: 'Currency',
        minWidth: 100,
        filter: 'agTextColumnFilter',
      },
    ],
    []
  );

  // Detail cell renderer component for items
  // eslint-disable-next-line
  const DetailCellRenderer = ({ data }) => {
    const detailGridRef = useRef();

    const onFirstDetailDataRendered = useCallback((params) => {
      params.api.sizeColumnsToFit();
    }, []);

    return (
      <div style={{ padding: '10px', backgroundColor: '#f9f9f9' }}>
        <AgGridReact
          ref={detailGridRef}
          className="ag-theme-material"
          theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
          rowData={data.Items || []}
          columnDefs={detailColumnDefs}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
          }}
          detailCellRenderer={SubDetailCellRenderer}
          detailRowHeight={200}
          masterDetail
          onFirstDataRendered={onFirstDetailDataRendered}
          domLayout="autoHeight"
        />
      </div>
    );
  };

  DetailCellRenderer.propTypes = {
    data: PropTypes.object,
  };

  // Sub-detail cell renderer component for item openings
  // eslint-disable-next-line
  const SubDetailCellRenderer = ({ data }) => (
    <div style={{ padding: '10px', backgroundColor: '#f5f5f5' }}>
      <AgGridReact
        rowData={data.ItemOpenings || []}
        columnDefs={subDetailColumnDefs}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
        }}
        domLayout="autoHeight"
        className="ag-theme-material"
        theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
      />
    </div>
  );

  SubDetailCellRenderer.propTypes = {
    data: PropTypes.object,
  };

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await Get(
        `GetItemOpeningByVendor?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      if (response.status === 200) {
        setRowData(response.data.Data);
        setFilteredData(response.data.Data);
      }
    } catch (error) {
      console.error('Failed to fetch item data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter data based on search term
  useEffect(() => {
    if (!rowData.length) return;

    const term = searchTerm.toLowerCase();
    let filtered = rowData;

    // Apply search filter
    if (term) {
      filtered = filtered.filter(
        (vendor) =>
          vendor.VendorName.toLowerCase().includes(term) ||
          vendor.VendorType.toLowerCase().includes(term) ||
          vendor.Items?.some(
            (item) =>
              item.ItemCode.toLowerCase().includes(term) ||
              item.ItemDescription.toLowerCase().includes(term)
          )
      );
    }

    setFilteredData(filtered);
  }, [searchTerm, rowData]);

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

  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
        <TextField
          label="Search Vendors/Items"
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
            rowData={isLoading ? [] : filteredData}
            columnDefs={masterColumnDefs}
            defaultColDef={defaultColDef}
            rowHeight={35}
            headerHeight={40}
            animateRows
            pagination
            paginationPageSize={20}
            onFirstDataRendered={onFirstDataRendered}
            domLayout="autoHeight"
            loading={isLoading}
            // Master-detail configuration
            masterDetail
            detailCellRenderer={DetailCellRenderer}
            detailRowHeight={300}
            // Enable detail row expansion by default
            detailRowAutoHeight
          />
        </div>
      </Scrollbar>

      <UploadExcelDialog
        uploadOpen={uploadOpen}
        uploadClose={uploadClose}
        FetchUpdatedData={() => {
          fetchData();
        }}
        data={data}
        tableData={rowData}
      />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={deleteItem}>
            Delete
          </Button>
        }
      />
    </Card>
  );
};

export default ItemOpenSheetGrid;

ItemOpenSheetGrid.propTypes = {
  uploadOpen: PropTypes.bool,
  uploadClose: PropTypes.func,
  data: PropTypes.object,
};
