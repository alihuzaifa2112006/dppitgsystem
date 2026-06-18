import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get } from 'src/api/apibasemethods';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { Box, TextField, InputAdornment, IconButton, Tooltip, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';
import { fNumber } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
import PropTypes from 'prop-types';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

const PrRequestGrid = () => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [zoomLevel, setZoomLevel] = useState(1);
  const navigate = useNavigate();
  const [checklistData, setChecklistData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const fetchChecklists = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `GetAllMachinePartsChecklist?orgID=${userData?.userDetails?.orgId}&branchID=${userData?.userDetails?.branchID}`
      );

      if (response.status === 200) {
        setChecklistData(response.data.Data || []);
      } else {
        setChecklistData([]);
        enqueueSnackbar(response.data.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load machine parts checklist', { variant: 'error' });
      setChecklistData([]);
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar]);

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  const moveToPDFView = useCallback(
    (ChecklistID) => {
      navigate(paths.dashboard.Production.maintenance.MCheckList.pdf(ChecklistID));
    },
    [navigate]
  );

  const pdfButtonRenderer = useCallback(
    (params) => (
      <Tooltip title="View PDF" arrow>
        <IconButton
          onClick={() => moveToPDFView(params.data.ChecklistID)}
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
    (params) => <div style={{ display: 'flex', gap: '4px' }}>{pdfButtonRenderer(params)}</div>,
    [pdfButtonRenderer]
  );

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'G': return 'Good';
      case 'B': return 'Bad';
      case 'C': return 'Change';
      case 'NA': return 'Not Applicable';
      default: return status || 'Not Checked';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'G': return 'green';
      case 'B': return 'orange';
      case 'C': return 'red';
      case 'NA': return 'gray';
      default: return 'gray';
    }
  };

  const filteredData = useMemo(() => {
    if (!searchText) return checklistData;

    const lowerSearch = searchText.toLowerCase();
    return checklistData.filter((item) =>
      Object.values(item).some(
        (val) =>
          val &&
          (typeof val === 'string' || typeof val === 'number') &&
          val.toString().toLowerCase().includes(lowerSearch)
      )
    );
  }, [checklistData, searchText]);

  const [masterColumnDefs] = useState([
    {
      field: 'expand',
      headerName: '',
      maxWidth: 50,
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: {
        suppressCount: true,
      },
      sortable: false,
      filter: false,
      resizable: false,
      lockPosition: 'left',
    },
    {
      field: 'Checklist_Date',
      headerName: 'Checklist Date',
      minWidth: 150,
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => fDate(params.value),
    },
    {
      field: 'MachineName',
      headerName: 'Machine Name',
      minWidth: 180,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'MachineCode',
      headerName: 'Machine Code',
      minWidth: 120,
      filter: 'agTextColumnFilter',
    },
      {
      field: 'DeptName',
      headerName: 'Department',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'SectionName',
      headerName: 'Section',
      minWidth: 120,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'LineName',
      headerName: 'Line',
      minWidth: 100,
      filter: 'agTextColumnFilter',
    },
  
   
    {
      field: 'Remarks',
      headerName: 'Remarks',
      minWidth: 200,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'Created_By_Name',
      headerName: 'Created By',
      minWidth: 120,
          filter: 'agTextColumnFilter',
      // type: 'numericColumn',
      // cellClass: 'ag-right-aligned-cell',
      // valueFormatter: (params) => `${fNumber(params.value) || ''}`,
    },
    {
      field: 'actions',
      headerName: 'Action',
      minWidth: 80,
      maxWidth: 150,
      pinned: 'right',
      sortable: false,
      filter: false,
      resizable: false,
      cellRenderer: actionButtonsRenderer,
      lockPosition: 'right',
      cellStyle: { textAlign: 'center' },
    },
  ]);

  const [partsColumnDefs] = useState([
    {
      field: 'PartName',
      headerName: 'Part Name',
      minWidth: 200,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'Status',
      headerName: 'Status',
      minWidth: 120,
      cellRenderer: (params) => (
        <span
          style={{
            color: getStatusColor(params.value),
            fontWeight: 'bold',
            fontSize: '0.875rem',
          }}
        >
          {getStatusDisplay(params.value)}
        </span>
      ),
      filter: 'agTextColumnFilter',
    },
    {
      field: 'WorkToBeCarriedOut',
      headerName: 'Work To Be CarriedOut',
      minWidth: 250,
      filter: 'agTextColumnFilter',
      cellStyle: { whiteSpace: 'normal', lineHeight: '1.4' },
      autoHeight: true,
    },
  ]);

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  const PartsListRenderer = ({ data }) => {
  const parts = data.PartsList || [];
  const showScroll = parts.length > 3;

  return (
    <Box sx={{ p: 0 }}>
      <div
        className="ag-theme-material"
        style={{
          height: showScroll ? '150px' : `${Math.max(150, parts.length * 35 + 40)}px`,
          width: '100%',
          overflowY: showScroll ? 'auto' : 'hidden',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#888 #f1f1f1',
        }}
      >
        <AgGridReact
          rowData={parts}
          columnDefs={partsColumnDefs}
          defaultColDef={defaultColDef}
          headerHeight={30}
          rowHeight={25}
        />
      </div>
    </Box>
  );
};

PartsListRenderer.propTypes = {
  data: PropTypes.object,
};

  PartsListRenderer.propTypes = {
    data: PropTypes.object,
  };

  // Main Detail Cell Renderer with nested expandable rows
  // Main Detail Cell Renderer with nested expandable rows
const DetailCellRenderer = ({ data: master }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* Parts List Section */}
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '6px 8px',
            borderRadius: '4px',
            border: '1px solid #e0e0e0',
            backgroundColor: '#fafafa',
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}
          onClick={() => toggleSection('parts')}
        >
          <Iconify
            icon={expandedSection === 'parts' ? 'ep:arrow-down' : 'ep:arrow-right'}
            width={16}
            sx={{ mr: 1, color: '#666' }}
          />
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#424242' }}
          >
            Parts Checklist 
          </Typography>
        </Box>
        {expandedSection === 'parts' && <PartsListRenderer data={master} />}
      </Box>
    </Box>
  );
};

DetailCellRenderer.propTypes = {
  data: PropTypes.object,
};

  DetailCellRenderer.propTypes = {
    data: PropTypes.object,
  };

  const detailCellRendererParams = useMemo(
    () => ({
      detailGridOptions: {
        detailCellRenderer: DetailCellRenderer,
      },
    }),
    []
  );

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
  };

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

          <Tooltip title="Reset Zoom">
            <IconButton
              onClick={handleZoomReset}
              color="primary"
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <Iconify icon="mdi:refresh" width={20} />
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
              columnDefs={masterColumnDefs}
              defaultColDef={defaultColDef}
              masterDetail
              detailCellRenderer={DetailCellRenderer}
              detailCellRendererParams={detailCellRendererParams}
              rowHeight={35}
              headerHeight={40}
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

export default PrRequestGrid;