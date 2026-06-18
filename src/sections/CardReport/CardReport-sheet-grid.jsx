import { useCallback, useEffect, useMemo, useState } from 'react';
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


const CardReportGrid = () => {
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
      navigate(paths.dashboard.Production.CardReport.pdf(ReportID));
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
      navigate(paths.dashboard.Production.CardReport.edit(ReportID));
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
    (params) => <div style={{ display: 'flex', gap: '2px' }}>{pdfButtonRenderer(params)}
      {editButtonRenderer(params)}
    
    
     </div>,
    [pdfButtonRenderer, editButtonRenderer]
  );

 
  const fetchProductionRequests = useCallback(async () => {
    try {
      setLoading(true);
      const orgId = userData?.userDetails?.orgId || 1;
      const branchID = userData?.userDetails?.branchID || 6;
      const response = await Get(`GetAllCardingReports?OrgID=${orgId}&BranchID=${branchID}`);
      if (response.status === 200) {
        setReportData(response.data || []);
      } else {
        setReportData([]);
        enqueueSnackbar(response.data?.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load carding reports', { variant: 'error' });
      setReportData([]);
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, userData]);

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

  // Columns for the MASTER grid
  const [columnDefs] = useState([
    {
      field: 'CreatedOn',
      headerName: 'Report Date',
      minWidth: 150,
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => fDate(params.value),
      cellRenderer: 'agGroupCellRenderer',
    },
    {
      field: 'DepartmentName',
      headerName: 'Department',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'SectionName',
      headerName: 'Section',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'Line_No',
      headerName: 'Line No',
      minWidth: 120,
      filter: 'agTextColumnFilter',
    },
    // {
    //   field: 'BlwReportID',
    //   headerName: 'Blowroom Rpt No.',
    //   minWidth: 150,
    //   filter: 'agTextColumnFilter',
    // },
    {
      field: 'CreatedByName',
      headerName: 'Created By',
      minWidth: 150,
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
    {
      field: 'ItemDescription',
      headerName: 'Material Name',
      minWidth: 250,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'TotalWeight',
      headerName: 'Qty',
      minWidth: 120,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => {
        const uom = params.data?.UOMName || '';
        return `${fNumber(params.value)} ${uom}`;
      },
    },
    {
      field: 'SpeedDateTime',
      headerName: 'Speed',
      minWidth: 120,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => fNumber(params.value),
    },
    {
      field: 'GrandYard',
      headerName: 'Grain/Yard',
      minWidth: 120,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => fNumber(params.value),
    },
    // Shift A Efficiency Columns
    {
      field: 'ShiftA_TotalWeight',
      headerName: 'A - Total',
      minWidth: 120,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => {
        const uom = params.data?.UOMName || '';
        return params.value ? `${fNumber(params.value)} ${uom}` : '-';
      },
    },
    {
      field: 'ShiftA_Efficiency',
      headerName: 'A - EFF %',
      minWidth: 120,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => params.value ? `${fNumber(params.value)}` : '-',
    },
    // Shift B Efficiency Columns
    {
      field: 'ShiftB_TotalWeight',
      headerName: 'B - Total',
      minWidth: 120,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => {
        const uom = params.data?.UOMName || '';
        return params.value ? `${fNumber(params.value)} ${uom}` : '-';
      },
    },
    {
      field: 'ShiftB_Efficiency',
      headerName: 'B - EFF %',
      minWidth: 120,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => params.value ? `${fNumber(params.value)}` : '-',
    },
    // Shift C Efficiency Columns
    {
      field: 'ShiftC_TotalWeight',
      headerName: 'C - Total',
      minWidth: 120,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => {
        const uom = params.data?.UOMName || '';
        return params.value ? `${fNumber(params.value)} ${uom}` : '-';
      },
    },
    {
      field: 'ShiftC_Efficiency',
      headerName: 'C - EFF %',
      minWidth: 120,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => params.value ? `${fNumber(params.value)}` : '-',
    },
    {
      field: 'Remarks',
      headerName: 'Remarks',
      minWidth: 200,
      filter: 'agTextColumnFilter',
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
                  const details = params.data.Details || [];
                  const shiftEfficiencies = params.data.ShiftEfficiencies || [];
                  
                  // Enrich each detail with its corresponding shift efficiencies
                  // ShiftEfficiencies are ordered: first 3 (A, B, C) for first detail, next 3 for second detail, etc.
                  const enrichedDetails = details.map((detail, detailIndex) => {
                    // Calculate the starting index for this detail's efficiencies (3 efficiencies per detail)
                    const startIndex = detailIndex * 3;
                    const endIndex = startIndex + 3;
                    
                    // Get the 3 efficiencies for this detail (should be A, B, C in order)
                    const detailEfficiencies = shiftEfficiencies.slice(startIndex, endIndex);
                    
                    // Find each shift by ShiftID
                    const shiftA = detailEfficiencies.find((se) => se.ShiftID === 1);
                    const shiftB = detailEfficiencies.find((se) => se.ShiftID === 2);
                    const shiftC = detailEfficiencies.find((se) => se.ShiftID === 3);
                    
                    return {
                      ...detail,
                      ShiftA_TotalWeight: shiftA?.TotalWeight || null,
                      ShiftA_Efficiency: shiftA?.Efficiency || null,
                      ShiftB_TotalWeight: shiftB?.TotalWeight || null,
                      ShiftB_Efficiency: shiftB?.Efficiency || null,
                      ShiftC_TotalWeight: shiftC?.TotalWeight || null,
                      ShiftC_Efficiency: shiftC?.Efficiency || null,
                    };
                  });
                  
                  params.successCallback(enrichedDetails);
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

export default CardReportGrid;
