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
} from '@mui/material';
import { LoadingScreen } from 'src/components/loading-screen';
import Iconify from 'src/components/iconify';
import { Get } from 'src/api/apibasemethods';
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';
import Label from 'src/components/label';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

const ItemListView = () => {
  const gridRef = useRef();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const settings = useSettingsContext();
  const [rowData, setRowData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    name: '',
  });

  // Get unique class names for tabs
  const classOptions = useMemo(() => {
    const uniqueClasses = [...new Set(rowData.map((item) => item.ClassName))].filter(Boolean);
    return [
      { value: 'all', label: 'All' },
      ...uniqueClasses.map((cls) => ({ value: cls, label: cls })),
    ];
  }, [rowData]);

  // Column definitions
  const itemColDefs = useMemo(
    () => [
      {
        field: 'ItemCode',
        headerName: 'Item Code',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ItemDescription',
        headerName: 'Description',
        minWidth: 250,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ClassName',
        headerName: 'Class',
        minWidth: 120,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Inv_Cat_Name',
        headerName: 'Category',
        minWidth: 120,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'SubCat_Name',
        headerName: 'Sub Category',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ColorName',
        headerName: 'Color',
        minWidth: 120,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Yarn_Type',
        headerName: 'Yarn Type',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Yarn_Count_Name',
        headerName: 'Yarn Count',
        minWidth: 120,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Composition_Name',
        headerName: 'Composition',
        minWidth: 200,
        filter: 'agTextColumnFilter',
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
        valueFormatter: (params) => params.value?.toFixed(2) || '0.00',
        filter: 'agNumberColumnFilter',
      },
      // {
      //   field: 'SafetyStockQty',
      //   headerName: 'Safety Stock',
      //   minWidth: 120,
      //   type: 'numericColumn',
      //   cellStyle: { textAlign: 'right' },
      //   valueFormatter: (params) => params.value?.toFixed(2) || '0.00',
      //   filter: 'agNumberColumnFilter',
      // },
      {
        field: 'isFG',
        headerName: 'Finished Good',
        minWidth: 120,
        cellRenderer: (params) => (params.value ? 'Yes' : 'No'),
        filter: 'agTextColumnFilter',
      },
    ],
    []
  );

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Assuming you have userData available in your context
      const response = await Get(
        `GetAllItemFrmDB?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      if (response.status === 200) {
        setRowData(response.data);
        setFilteredData(response.data);
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
      // floatingFilter: true,
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
      {isLoading ? (
        <LoadingScreen
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh',
          }}
        />
      ) : (
        <>
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
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                    }
                    color="primary"
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
                rowData={filteredData}
                columnDefs={itemColDefs}
                defaultColDef={defaultColDef}
                rowHeight={35}
                headerHeight={40}
                animateRows
                pagination
                paginationPageSize={20}
                onFirstDataRendered={onFirstDataRendered}
                suppressRowClickSelection
                domLayout="autoHeight"
              />
            </div>
          </Scrollbar>
        </>
      )}
    </Card>
  );
};

export default ItemListView;
