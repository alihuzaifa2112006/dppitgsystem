import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get } from 'src/api/apibasemethods';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { Box, TextField, InputAdornment, IconButton, Tooltip } from '@mui/material';
import { Stack } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { fDate, fDateTime } from 'src/utils/format-time';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';

// Themeing for AG Grid
const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

const RTReportGrid = () => {
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
      navigate(paths.dashboard.Production.RTReport.pdf(ReportID));
    },
    [navigate]
  );

  const pdfButtonRenderer = useCallback(
    (params) => (
      <Tooltip title="View PDF" arrow>
        <IconButton
          onClick={() => moveToPDFView(params.data?.ReportID)}
          size="small"
          sx={{ padding: '4px' }}
        >
          <Iconify icon="mdi:file-pdf-box" width="20" height="20" />
        </IconButton>
      </Tooltip>
    ),
    [moveToPDFView]
  );

  const actionButtonsRenderer = useCallback(
    (params) => <div style={{ display: 'flex', gap: '2px' }}>{pdfButtonRenderer(params)}</div>,
    [pdfButtonRenderer]
  );

  const fetchProductionRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `GetAllRagTearingReports?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      if (response.status === 200) {
        const data = Array.isArray(response.data) ? response.data : response.data?.Data ?? [];
        setReportData(Array.isArray(data) ? data : []);
      } else {
        setReportData([]);
        enqueueSnackbar(response.data?.Message || 'No Reports found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to Load Data ', { variant: 'error' });
      setReportData([]);
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    fetchProductionRequests();
  }, [fetchProductionRequests]);

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

  const [columnDefs] = useState([
    {
      field: 'RptDate',
      headerName: 'Report Date',
      minWidth: 130,
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      cellRenderer: 'agGroupCellRenderer',
    },
    {
      field: 'ReportID',
      headerName: 'Report ID',
      minWidth: 100,
      filter: 'agNumberColumnFilter',
      hide: true,
    },
    {
      field: 'PDONO',
      headerName: 'RT Report No',
      minWidth: 140,
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => params.value || '-',
    },
    {
      field: 'Line_No',
      headerName: 'Line No',
      minWidth: 100,
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => params.value ?? '-',
    },
    {
      field: 'ShiftName',
      headerName: 'Shift',
      minWidth: 100,
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => params.value || '-',
    },
    {
      field: 'InvTypeName',
      headerName: 'Inv Type',
      minWidth: 120,
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => params.value || '-',
    },
    {
      field: 'CatName',
      headerName: 'Category',
      minWidth: 120,
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => params.value || '-',
    },
    {
      field: 'SubCatName',
      headerName: 'Sub Category',
      minWidth: 140,
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
      field: 'SFGItemCode',
      headerName: 'Produced Item Code',
      minWidth: 160,
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => params.value || '-',
    },
    {
      field: 'SFGItemDescription',
      headerName: 'Produced Item',
      minWidth: 280,
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => params.value || '-',
    },
    {
      field: 'Bale',
      headerName: 'Bale',
      minWidth: 100,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => (params.value != null ? fNumber(params.value) : '-'),
    },
    {
      field: 'Total_Bale',
      headerName: 'Total Bale',
      minWidth: 110,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => (params.value != null ? fNumber(params.value) : '-'),
    },
    {
      field: 'Production',
      headerName: 'Production',
      minWidth: 120,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => {
        const uom = params.data?.UOMName || '';
        return params.value != null ? `${fNumber(params.value)} ${uom}` : '-';
      },
    },
    {
      field: 'Total_Weight',
      headerName: 'Total Weight',
      minWidth: 120,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => {
        const uom = params.data?.UOMName || '';
        return params.value != null ? `${fNumber(params.value)} ${uom}` : '-';
      },
    },
    {
      field: 'Total_MC_Running',
      headerName: 'MC Running',
      minWidth: 110,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => (params.value != null ? fNumber(params.value) : '-'),
    },
    {
      field: 'Total_Production_HR',
      headerName: 'Production HR',
      minWidth: 120,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => (params.value != null ? fNumber(params.value) : '-'),
    },
    {
      field: 'Total_Time',
      headerName: 'Total Time',
      minWidth: 160,
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => (params.value ? fDateTime(params.value) : '-'),
    },
    {
      field: 'Remarks',
      headerName: 'Remarks',
      minWidth: 180,
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => params.value || '-',
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
      cellRenderer: actionButtonsRenderer,
      lockPosition: 'right',
      cellStyle: { textAlign: 'right' },
    },
  ]);


  // Define columns for the REPORT DETAILS (requisition/transfer lines) grid
  const reportDetailsColumnDefs = [
    { field: 'ChallanNo', headerName: 'Challan / Req No', minWidth: 160 },
    {
      field: 'ReqCode',
      headerName: 'Req Code',
      minWidth: 140,
      valueFormatter: (p) => p.value || p.data?.TransferNo || '-',
    },
    { field: 'TransferNo', headerName: 'Transfer No', minWidth: 140 },
    { field: 'SortedItemCode', headerName: 'Sorted Item Code', minWidth: 160 },
    { field: 'SortedItemDescription', headerName: 'Sorted Item', minWidth: 260 },
    {
      field: 'TotalBale',
      headerName: 'Bale',
      minWidth: 90,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (p) => (p.value != null ? fNumber(p.value) : '-'),
    },
    {
      field: 'TotalWeight',
      headerName: 'Weight',
      minWidth: 100,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (p) => (p.value != null ? fNumber(p.value) : '-'),
    },
    {
      field: 'Detail_MC_Running',
      headerName: 'MC Running',
      minWidth: 100,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (p) => (p.value != null ? fNumber(p.value) : '-'),
    },
    {
      field: 'Detail_Production_HR',
      headerName: 'Production HR',
      minWidth: 110,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (p) => (p.value != null ? fNumber(p.value) : '-'),
    },
  ];

  // Define columns for the WASTE DETAILS grid
  const wasteDetailColumnDefs = [
    { field: 'WasteSubCatName', headerName: 'Waste Sub Category', minWidth: 200 },
    { field: 'WasteItemCode', headerName: 'Item Code', minWidth: 200 },
    { field: 'WasteItemDescription', headerName: 'Item', minWidth: 300 },
    {
      field: 'WasteQty',
      headerName: 'Waste Qty',
      minWidth: 130,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) =>
        params.value ? `${fNumber(params.value)} ${params.data?.WasteUOMName || ''}` : '-',
    },
  ];

  // Custom Detail Cell Renderer: shows Details (input lines) + WasteDetails
  // AG Grid passes params; row data may be at params.data - accept full params and normalize
  const DetailCellRenderer = (props) => {
    const wasteGridRef = useRef(null);
    const detailsGridRef = useRef(null);
    const data = props?.data ?? props?.node?.data ?? props;
    const settingsProp = props?.settings ?? settings;

    useEffect(() => {
      detailsGridRef.current?.api?.sizeColumnsToFit();
      wasteGridRef.current?.api?.sizeColumnsToFit();
    }, []);

    const details = (data && Array.isArray(data.Details) ? data.Details : []) || [];
    const wasteDetails = (data && Array.isArray(data.WasteDetails) ? data.WasteDetails : []) || [];

    return (
      <Box sx={{ p: 1.5, width: '100%', minHeight: 280 }}>
        {details.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.875rem' }}>
              Details (Requisition / Transfer)
            </Box>
            <div style={{ width: '100%', height: 120 }}>
              <AgGridReact
                ref={detailsGridRef}
                className="ag-theme-material"
                theme={settingsProp?.themeMode === 'dark' ? themeDark : themeBalham}
                rowData={details}
                columnDefs={reportDetailsColumnDefs}
                defaultColDef={{ flex: 1, sortable: true, filter: true, resizable: true }}
                rowHeight={28}
                headerHeight={32}
                animateRows
                domLayout="normal"
              />
            </div>
          </Box>
        )}
        {wasteDetails.length > 0 && (
          <Box>
            <Box sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.875rem' }}>Waste Details</Box>
            <div style={{ width: '100%', height: 120 }}>
              <AgGridReact
                ref={wasteGridRef}
                className="ag-theme-material"
                theme={settingsProp?.themeMode === 'dark' ? themeDark : themeBalham}
                rowData={wasteDetails}
                columnDefs={wasteDetailColumnDefs}
                defaultColDef={{ flex: 1, sortable: true, filter: true, resizable: true }}
                rowHeight={26}
                headerHeight={30}
                animateRows
                domLayout="normal"
              />
            </div>
          </Box>
        )}
        {details.length === 0 && wasteDetails.length === 0 && (
          <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>No details</Box>
        )}
      </Box>
    );
  };

  DetailCellRenderer.propTypes = {
    data: PropTypes.object,
    node: PropTypes.object,
    settings: PropTypes.shape({
      themeMode: PropTypes.string,
    }),
  };

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
              detailCellRenderer={DetailCellRenderer}
              detailCellRendererParams={(params) => ({
                settings,
                data: params?.data,
                node: params?.node,
              })}
              detailRowHeight={320}
              suppressRowClickSelection
              domLayout="autoHeight"
            />
          </div>
        </Scrollbar>
      </Box>
    </Box>
  );
};

export default RTReportGrid;
