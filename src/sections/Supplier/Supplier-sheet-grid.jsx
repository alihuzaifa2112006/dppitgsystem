import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import PropTypes from 'prop-types';
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
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
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

  // Navigate to Add Form
  const moveToAddForm = useCallback(() => {
    navigate(paths.dashboard.Onboarding.Supplier.new);
  }, [navigate]);

  // Navigate to PDF View
  const moveToPDFView = useCallback(
    (ReportID) => {
      navigate(paths.dashboard.Onboarding.Supplier.pdf(ReportID));
    },
    [navigate]
  );

  // Navigate to Edit Form
  const moveToEditForm = useCallback(
    (ReportID) => {
      navigate(paths.dashboard.Onboarding.Supplier.edit(ReportID));
    },
    [navigate]
  );

  // PDF Button Renderer


  // Edit Button Renderer
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

  // Action Buttons Renderer
  const actionButtonsRenderer = useCallback(
    (params) => (
      <div style={{ display: 'flex', gap: '2px' }}>

        {editButtonRenderer(params)}
      </div>
    ),
    [editButtonRenderer]
  );

  // Fetch Data from API - AllPreBoard
  const fetchAllPreBoardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(`AllPreBoard?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`);

      if (response.status === 200) {
        setReportData(response.data || []);
      } else {
        setReportData([]);
        enqueueSnackbar(response.data?.Message || 'No records found', { variant: 'info' });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      enqueueSnackbar('Failed to Load Data', { variant: 'error' });
      setReportData([]);
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    fetchAllPreBoardData();
  }, [fetchAllPreBoardData]);

  // Filter Data based on search
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

  // Column Definitions
  const [columnDefs] = useState([
    {
      field: 'ReportID',
      headerName: 'ID',
      minWidth: 80,
      filter: 'agNumberColumnFilter',
    },
    {
      field: 'SupName',
      headerName: 'Supplier Name',
      minWidth: 200,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'City',
      headerName: 'City',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'CountryName',
      headerName: 'Country',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'Email',
      headerName: 'Email',
      minWidth: 200,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'CreatedDate',
      headerName: 'Created Date',
      minWidth: 180,
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => params.value ? fDateTime(params.value) : '-',
    },
    {
      field: 'Status',
      headerName: 'Status',
      minWidth: 120,
      filter: 'agTextColumnFilter',
      cellRenderer: (params) => {
        const status = params.value;
        const color = status === 'Active' ? '#22c55e' : '#ef4444';
        return (
          <Box
            sx={{
              display: 'inline-block',
              backgroundColor: color,
              color: 'white',
              padding: '2px 12px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {status || 'Active'}
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 100,
      maxWidth: 100,
      pinned: 'right',
      sortable: false,
      type: 'actions',
      filter: false,
      resizable: false,
      cellRenderer: actionButtonsRenderer,
      lockPosition: 'right',
      cellStyle: { textAlign: 'center' },
    },
  ]);

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

  // Zoom Handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ width: '100%', height: '80vh', p: 2 }}>
      {/* Header with Search and Add Button */}
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

      {/* AG Grid */}
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
              rowHeight={40}
              headerHeight={45}
              animateRows
              pagination
              paginationPageSize={20}
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