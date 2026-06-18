import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get } from 'src/api/apibasemethods';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import {
  Box,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
} from '@mui/material';
import { Stack } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import Label from 'src/components/label';

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

const ColorWiseStockReportGrid = () => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [zoomLevel, setZoomLevel] = useState(1);

  // State for grid data
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterTab, setFilterTab] = useState('all');

  // Fetch inventory stock report data
  const fetchColorWiseStockReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `GetInventoryColorWiseStockReportData?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );

      if (response.status === 200 && response.data) {
        setRowData(response.data);
      } else {
        setRowData([]);
        enqueueSnackbar(response.data?.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load stock report', { variant: 'error' });
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar]);

  useEffect(() => {
    fetchColorWiseStockReports();
  }, [fetchColorWiseStockReports]);

  // Get unique class names and their counts
  const tabCounts = useMemo(() => {
    const classNames = {};
    rowData.forEach((item) => {
      const className = item.ClassName || 'Unknown';
      classNames[className] = (classNames[className] || 0) + 1;
    });

    return {
      all: rowData.length,
      classes: classNames,
    };
  }, [rowData]);

  // Get sorted list of class names
  const classNamesList = useMemo(() => Object.keys(tabCounts.classes).sort(), [tabCounts.classes]);

  // Filter data based on search text and className tab
  const filteredData = useMemo(() => {
    let data = rowData;

    // Apply className filter based on selected tab
    if (filterTab !== 'all') {
      data = data.filter((item) => (item.ClassName || 'Unknown') === filterTab);
    }

    // Apply search filter
    if (!searchText) return data;

    const lowerSearch = searchText.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some(
        (val) =>
          val &&
          (typeof val === 'string' || typeof val === 'number') &&
          val.toString().toLowerCase().includes(lowerSearch)
      )
    );
  }, [rowData, searchText, filterTab]);

  const handleTabChange = (event, newValue) => {
    setFilterTab(newValue);
  };

  // Column Definitions for Stock Report
  const columnDefs = useMemo(
    () => [
      {
        field: 'ClassName',
        headerName: 'Inv. Type',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'Inv_Cat_Name',
        headerName: 'Category',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'SubCat_Name',
        headerName: 'Sub Category',
        minWidth: 180,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'ItemCode',
        headerName: 'Item Code',
        minWidth: 180,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'ItemDescription',
        headerName: 'Item Description',
        minWidth: 300,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'Location_Warehouse',
        headerName: 'Warehouse',
        minWidth: 130,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'Storage_Rack',
        headerName: 'Rack',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'ReOrderQty',
        headerName: 'Reorder Qty',
        minWidth: 130,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '-',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'SafetyStockQty',
        headerName: 'Safety Stock',
        minWidth: 130,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '-',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'UOMName',
        headerName: 'Unit',
        minWidth: 100,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'LotNo',
        headerName: 'Lot No',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'BatchNumber',
        headerName: 'Batch Number',
        minWidth: 150,
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
        field: 'Color_Code',
        headerName: 'Color Code',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'Specifications',
        headerName: 'Specifications',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },

      {
        field: 'OpeningStock',
        headerName: 'Opening Stock',
        minWidth: 140,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '-',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'AvgUnitPrice',
        headerName: 'Avg Unit Price',
        minWidth: 150,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => `৳${fNumber(params.value.toFixed(2))}` || '-',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'TotalValueBDT',
        headerName: 'Total Value (BDT)',
        minWidth: 160,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => `৳${fNumber(params.value.toFixed(2))}` || '-',
        cellStyle: { textAlign: 'right', fontWeight: 'bold' },
      },
      {
        field: 'TotalValueUSD',
        headerName: 'Total Value (USD)',
        minWidth: 160,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => `$${fNumber(params.value.toFixed(2))}` || '-',
        cellStyle: { textAlign: 'right', fontWeight: 'bold' },
      },
      {
        field: 'GRNQty',
        headerName: 'GRN Qty',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '-',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'IssuedQty',
        headerName: 'Issued Qty',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '-',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'ReturnedQty',
        headerName: 'Returned Qty',
        minWidth: 130,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '-',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'ProducedQty',
        headerName: 'Produced Qty',
        minWidth: 130,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '-',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'ClosingStock',
        headerName: 'Closing Stock',
        minWidth: 140,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '-',
        cellStyle: (params) => ({
          textAlign: 'right',
          fontWeight: 'bold',
          color: params.value < params.data.SafetyStockQty ? '#f44336' : 'inherit',
        }),
      },
    ],
    []
  );

  // Default column definitions
  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ width: '100%', height: '80vh', p: 2 }}>
      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Search..."
            variant="outlined"
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Zoom out" arrow placement="top">
            <IconButton
              color="primary"
              sx={{ border: '1px solid #eee' }}
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.1))}
            >
              <Iconify icon="si:zoom-out-duotone" width={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset Zoom">
            <Button
              onClick={() => setZoomLevel(1)}
              variant="outlined"
              size="small"
              sx={{ minWidth: 40 }}
            >
              {Math.round(zoomLevel * 100)}%
            </Button>
          </Tooltip>
          <Tooltip title="Zoom in" arrow placement="top">
            <IconButton
              color="primary"
              sx={{ border: '1px solid #eee' }}
              onClick={() => setZoomLevel((prev) => prev + 0.1)}
            >
              <Iconify icon="si:zoom-in-duotone" width={20} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Filter Tabs by ClassName */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={filterTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="class name filter tabs"
        >
          <Tab
            value="all"
            label="All"
            icon={
              <Label variant={filterTab === 'all' ? 'filled' : 'soft'} color="primary">
                {tabCounts.all}
              </Label>
            }
            iconPosition="end"
          />
          {classNamesList.map((className) => (
            <Tab
              key={className}
              value={className}
              label={className}
              icon={
                <Label
                  variant={filterTab === className ? 'filled' : 'soft'}
                  color={getClassColor(className)}
                >
                  {tabCounts.classes[className]}
                </Label>
              }
              iconPosition="end"
            />
          ))}
        </Tabs>
      </Box>

      <Box
        sx={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top left',
          width: `${100 / zoomLevel}%`,
          height: `${100 / zoomLevel}%`,
        }}
      >
        <Scrollbar>
          <div style={{ width: '100%', height: '70vh' }}>
            <AgGridReact
              className="ag-theme-material"
              theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
              rowData={filteredData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowHeight={35}
              headerHeight={40}
              animateRows
              pagination
              paginationPageSize={20}
              domLayout="autoHeight"
            />
          </div>
        </Scrollbar>
      </Box>
    </Box>
  );
};

export default ColorWiseStockReportGrid;
