import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get } from 'src/api/apibasemethods';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { Box, TextField, InputAdornment, Button, IconButton, Tooltip, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Stack } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { fDate, fDateTime } from 'src/utils/format-time';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';

// Themeing for AG Grid
const themeDark = themeBalham.withPart(colorSchemeDarkBlue);


const SupplierGrid = () => {
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
      navigate(paths.dashboard.Onboarding.Supplier.pdf(ReportID));
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

  const moveToEditForm = useCallback(
    (ReportID) => {
      navigate(paths.dashboard.Onboarding.Supplier.edit(ReportID));
    },
    [navigate]
  );
  const editButtonRenderer = useCallback(
    (params) => (
      <Tooltip title="Edit" arrow>
        <IconButton
          onClick={() => moveToEditForm(params.data.ReportID)}
          size="small"
          sx={{ padding: '4px' }}
        >
          <Iconify icon="solar:pen-bold" width={18} />
        </IconButton>
      </Tooltip>
    ),
    [moveToEditForm]
  );

  const actionButtonsRenderer = useCallback(
    (params) => <div style={{ display: 'flex', gap: '2px' }}>{pdfButtonRenderer(params)}{editButtonRenderer(params)}</div>,
    [pdfButtonRenderer, editButtonRenderer]
  );


  const fetchProductionRequests = useCallback(async () => {
    try {
      setLoading(true);
      // ${APP_API}/GetBlowRoomReports?OrgID=1&BranchID=1 
      // GetBlowRoomReports?OrgID=1&BranchID=1
      const response = await Get(`GetBlowRoomReports?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`);
      if (response.status === 200) {

        setReportData(response.data);
      } else {
        setReportData([]);
        enqueueSnackbar(response.data.Message || 'No Reports found', { variant: 'info' });
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
      minWidth: 150,
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => fDate(params.value),
      cellRenderer: 'agGroupCellRenderer',
    },
    // PDONO
    {
      field: 'PDONO',
      headerName: 'Blowroom No',
      minWidth: 120,
      filter: 'agTextColumnFilter',
    },
    {

      field: 'Line_No',
      headerName: 'Line No',
      minWidth: 120,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'OutItemName',
      headerName: 'Produced Item',
      minWidth: 250,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'Total_Bale',
      headerName: 'Total Bale',
      minWidth: 150,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => {
        const uom = params.data?.Details?.[0]?.UOMName || '';
        return params.value ? `${fNumber(params.value)} ${uom}` : '-';
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
        return params.value ? `${fNumber(params.value)} ${uom}` : '-';
      },
    },
    {
      field: 'Total_MC_Running',
      headerName: 'Total MC Running',
      minWidth: 150,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => params.value ? fNumber(params.value) : '-',
    },
    {
      field: 'Total_Production_HR',
      headerName: 'Total Production HR',
      minWidth: 180,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => params.value ? fNumber(params.value) : '-',
    },
    {
      field: 'Total_Time',
      headerName: 'Total Time',
      minWidth: 200,
      filter: 'agTextColumnFilter',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => {
        if (!params.value) return '-';
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
    // { 
    //   field: 'Line_No', 
    //   headerName: 'Line No', 
    //   minWidth: 100,
    //   cellRenderer: 'agGroupCellRenderer',
    // },
    // { field: 'ShiftName', headerName: 'Shift', minWidth: 100 },
    {
      field: 'ChallanNo',
      headerName: 'Req No/Transfer No',
      minWidth: 120,
      valueGetter: (params) => {
        // Logic: If ReqNo/ReqCode exists, show it, otherwise show TransNo/TransferNo
        const reqNo = params.data?.ReqNo || params.data?.ReqCode || '';
        const transNo = params.data?.TransNo || params.data?.TransferNo || '';
        return reqNo || transNo || params.data?.ChallanNo || '-';
      }
    },
    // { field: 'InvTypeName', headerName: 'Inv Type', minWidth: 120 },
    // { field: 'CatName', headerName: 'Category', minWidth: 150 },
    // { field: 'SubCatName', headerName: 'Sub Category', minWidth: 150 },
    // { field: 'ColorName', headerName: 'Color', minWidth: 120 },
    // { field: 'SpAreaName', headerName: 'Spare', minWidth: 150 },
    { field: 'InItemName', headerName: 'Received Item', minWidth: 250 },
    // {
    //   field: 'TotalBale',
    //   headerName: 'Total Bale',
    //   minWidth: 130,
    //   type: 'numericColumn',
    //   cellStyle: { textAlign: 'right' },
    //   valueFormatter: (params) => {
    //     if (!params.value) return '-';
    //     return `${fNumber(params.value)} ${params.data?.UOMName || ''}`;
    //   },
    // },
    // // UOMName
    // {
    //   field: 'UOMName',
    //   headerName: 'Unit',
    //   minWidth: 120,
    //   filter: 'agTextColumnFilter',
    // },


  ];

  // Define columns for the WASTE DETAILS grid
  const wasteDetailColumnDefs = [
    // { field: 'WasteCategoryName', headerName: 'Waste Category', minWidth: 180 },
    { field: 'WasteSubCatName', headerName: 'Waste Sub Category', minWidth: 200 },
    { field: 'WasteItemName', headerName: 'Waste Item Name', minWidth: 300 },
    {
      field: 'WasteQty',
      headerName: 'Waste Qty',
      minWidth: 130,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => params.value ? fNumber(params.value) : '-',
    },
    // {
    //   field: 'WastePercent',
    //   headerName: 'Waste %',
    //   minWidth: 120,
    //   type: 'numericColumn',
    //   cellStyle: { textAlign: 'right' },
    //   valueFormatter: (params) => params.value ? `${fNumber(params.value)}%` : '-',
    // },
  ];

  // Custom Detail Cell Renderer Component
  const DetailCellRenderer = ({ data, settings: settingsProp }) => {
    const detailGridRef = useRef(null);
    const wasteGridRef = useRef(null);
    const [detailExpanded, setDetailExpanded] = useState(false);
    const [wasteExpanded, setWasteExpanded] = useState(false);

    useEffect(() => {
      if (detailExpanded && detailGridRef.current?.api) {
        detailGridRef.current.api.sizeColumnsToFit();
      }
      if (wasteExpanded && wasteGridRef.current?.api) {
        wasteGridRef.current.api.sizeColumnsToFit();
      }
    }, [detailExpanded, wasteExpanded]);

    const handleDetailChange = (e, isExpanded) => {
      setDetailExpanded(isExpanded);
      if (isExpanded) {
        setWasteExpanded(false);
      }
    };

    const handleWasteChange = (e, isExpanded) => {
      setWasteExpanded(isExpanded);
      if (isExpanded) {
        setDetailExpanded(false);
      }
    };

    return (
      <Box sx={{ p: 1, width: '100%' }}>
        <Stack spacing={1}>
          {/* Details Grid Accordion */}
          <Accordion
            expanded={detailExpanded}
            onChange={handleDetailChange}
            sx={{ boxShadow: 1 }}
          >
            <AccordionSummary
              expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" width={16} />}
              sx={{
                minHeight: 32,
                '& .MuiAccordionSummary-content': {
                  margin: '8px 0',
                }
              }}
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Iconify
                  icon={detailExpanded ? "eva:arrow-ios-downward-fill" : "eva:arrow-ios-forward-fill"}
                  width={14}
                  sx={{ color: 'primary.main' }}
                />
                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                  Received Items
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 1 }}>
              <div style={{ width: '100%', height: '120px' }}>
                <AgGridReact
                  ref={detailGridRef}
                  className="ag-theme-material"
                  theme={settingsProp.themeMode === 'dark' ? themeDark : themeBalham}
                  rowData={data.Details || []}
                  columnDefs={detailColumnDefs}
                  defaultColDef={{
                    flex: 1,
                    sortable: true,
                    filter: true,
                    resizable: true,
                  }}
                  rowHeight={26}
                  headerHeight={30}
                  animateRows
                  domLayout="normal"
                />
              </div>
            </AccordionDetails>
          </Accordion>

          {/* Waste Details Grid Accordion */}
          <Accordion
            expanded={wasteExpanded}
            onChange={handleWasteChange}
            sx={{ boxShadow: 1 }}
          >
            <AccordionSummary
              expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" width={16} />}
              sx={{
                minHeight: 32,
                '& .MuiAccordionSummary-content': {
                  margin: '8px 0',
                }
              }}
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Iconify
                  icon={wasteExpanded ? "eva:arrow-ios-downward-fill" : "eva:arrow-ios-forward-fill"}
                  width={14}
                  sx={{ color: 'primary.main' }}
                />
                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                  Item Waste
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 1 }}>
              <div style={{ width: '100%', height: '120px' }}>
                <AgGridReact
                  ref={wasteGridRef}
                  className="ag-theme-material"
                  theme={settingsProp.themeMode === 'dark' ? themeDark : themeBalham}
                  rowData={data.WasteDetails || []}
                  columnDefs={wasteDetailColumnDefs}
                  defaultColDef={{
                    flex: 1,
                    sortable: true,
                    filter: true,
                    resizable: true,
                  }}
                  rowHeight={26}
                  headerHeight={30}
                  animateRows
                  domLayout="normal"
                />
              </div>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Box>
    );
  };

  DetailCellRenderer.propTypes = {
    data: PropTypes.shape({
      Details: PropTypes.array,
      WasteDetails: PropTypes.array,
    }),
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
              detailCellRendererParams={{
                settings,
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

export default SupplierGrid;
