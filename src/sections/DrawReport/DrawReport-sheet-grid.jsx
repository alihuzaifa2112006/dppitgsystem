import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get } from 'src/api/apibasemethods';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { Box, TextField, InputAdornment, Button, IconButton, Tooltip } from '@mui/material';
import { maxWidth, Stack } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { fDate, fDateTime } from 'src/utils/format-time';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';

// Themeing for AG Grid
const themeDark = themeBalham.withPart(colorSchemeDarkBlue);


const DrawReportGrid = () => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  const moveToPDFView = useCallback(
    (ReportID) => {
      navigate(paths.dashboard.Production.DrawReport.pdf(ReportID));
    },
    [navigate]
  );

  const pdfButtonRenderer = useCallback(
    (params) => {
      console.log(params);
      return (
        <Tooltip title="View PDF" arrow>
          <IconButton
            onClick={() => moveToPDFView(params.data.ReportID)}
            size="small"
            sx={{ padding: '4px' }}
          >
            <Iconify icon="mdi:file-pdf-box" width="20" height="20" />
          </IconButton>
        </Tooltip>
      );
    },
    [moveToPDFView]
  );

  const actionButtonsRenderer = useCallback(
    (params) => <div style={{ display: 'flex', gap: '2px' }}>{pdfButtonRenderer(params)}</div>,
    [pdfButtonRenderer]
  );

  // Fetch production reports and keep the nested structure
  const fetchProductionRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get('GetAllRagTearingReports');
      if (response.status === 200) {
        // Set data directly without flattening it
        setReportData(response.data);
      } else {
        setReportData([]);
        enqueueSnackbar(response.data.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load production requests', { variant: 'error' });
      setReportData([]);
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchProductionRequests();
  }, [fetchProductionRequests]);

  // Filter master data based on search text
  const filteredData = useMemo(() => {
    if (!searchText) return reportData;

    const lowerSearch = searchText.toLowerCase();
    return reportData.filter((item) =>
      Object.values(item).some(
        (val) =>
          val &&
          (typeof val === 'string' || typeof val === 'number') &&
          val.toString().toLowerCase().includes(lowerSearch)
      )
    );
  }, [reportData, searchText]);

  // Columns for the MASTER grid
  const [columnDefs] = useState([
    {
      field: 'RptDate',
      headerName: 'Report Date',
      minWidth: 150,
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => fDate(params.value),
      cellRenderer: 'agGroupCellRenderer',
    },
    // ReqID
    {
      field: 'ReqCode',
      headerName: 'Req Code',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    // SortedItemCode
    {
      field: 'SortedItemCode',
      headerName: 'Sorted Item Code',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    // SortedItemDescription
    {
      field: 'SortedItemDescription',
      headerName: 'Sorted Item Description',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    // Total_MC_Running
  

    {
      field: 'Total_Bale',
      headerName: 'Total Bale',
      minWidth: 150,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => {
        const uom = params.data?.Details?.[0]?.UOMName || '';
        return `${fNumber(params.value)} ${uom}`;
      },
    },
    {
      field: 'Total_Weight',
      headerName: 'Total Weight',
      minWidth: 150,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => {
        const uom = params.data?.Details?.[0]?.UOMName || '';
        return `${fNumber(params.value)} ${uom}`;
      },
    },
    {
      field: 'Total_MC_Running',
      headerName: 'Total MC Running',
      minWidth: 150,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => `${fNumber(params.value)} ${params.data?.UOMName || ''}`,
    },
    // Total_Production_HR
    {
      field: 'Total_Production_HR',
      headerName: 'Total Production HR',
      minWidth: 150,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => `${fNumber(params.value)} ${params.data?.UOMName || ''}`,
    },
    {
      field: 'Total_Time',
      headerName: 'Total Time',
      minWidth: 200,
      filter: 'agTextColumnFilter',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => {
        if (!params.value) return '';
        return fDateTime(params.value);
      },
    },
    {
      field: 'Remarks',
      headerName: 'Remarks',
      minWidth: 200,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'actions',
      headerName: '',
      minWidth: 80,
      maxWidth: 80,
      pinned: 'right',
      sortable: false,
      type: 'actions',
      filter: false,
      resizable: false,
      cellRenderer: actionButtonsRenderer,
      lockPosition: 'right',
      cellStyle: { textAlign: 'right' },
    },
  ]);

  // Define columns for the DETAIL grid
  const detailColumnDefs = [
    // Line_No
    { field: 'Line_No', headerName: 'Line No' },
 
    { field: 'ShiftName', headerName: 'Shift' },
    // InvTypeName
    { field: 'InvTypeName', headerName: 'Inv Type' },
    // CategoryName
    { field: 'CatName', headerName: 'Category' },
    // SubCatName
    { field: 'SubCatName', headerName: 'Sub Category' },
    // ColorName
    { field: 'ColorName', headerName: 'Color' },
    // SpareName
    { field: 'SpAreaName', headerName: 'Spare' },
    // ItemName
    { field: 'SFGItemName', headerName: 'Item' },

    {
      field: 'TotalBale',
      headerName: 'Total Bale',
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => `${fNumber(params.value)} ${params.data?.UOMName || ''}`,
    },
    {
      field: 'TotalWeight',
      headerName: 'Total Weight',
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => `${fNumber(params.value)} ${params.data?.UOMName || ''}`,
    },
    {
      field: 'DustWeight',
      headerName: 'Dust Weight',
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => `${fNumber(params.value)} ${params.data?.UOMName || ''}`,
    },
    {
      field: 'Total_MC_Running',
      headerName: 'Total MC Running',
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => `${fNumber(params.value)} ${params.data?.UOMName || ''}`,
    },
    {
      field: 'Total_Production_HR',
      headerName: 'Total Production HR',
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => `${fNumber(params.value)} ${params.data?.UOMName || ''}`,
    },
  
  ];

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

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  const handleZoomReset = () => setZoomLevel(1);

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
          <Tooltip title="Zoom Out">
            <IconButton
              onClick={handleZoomOut}
              color="primary"
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <Iconify icon="si:zoom-out-duotone" width={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Zoom In">
            <IconButton
              onClick={handleZoomIn}
              color="primary"
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <Iconify icon="si:zoom-in-duotone" width={20} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

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
              masterDetail
              detailCellRendererParams={{
                detailGridOptions: {
                  columnDefs: detailColumnDefs,
                  defaultColDef: {
                    flex: 1,
                  },
                },

                getDetailRowData: (params) => {
                  params.successCallback(params.data.Details);
                },
              }}
              suppressRowClickSelection
              domLayout="autoHeight"
            />
          </div>
        </Scrollbar>
      </Box>
    </Box>
  );
};

export default DrawReportGrid;
