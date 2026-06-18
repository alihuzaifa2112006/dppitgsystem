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
import Label from 'src/components/label';
import { fDate, fDateTime } from 'src/utils/format-time';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

const MachineMaintenanceGrid = () => {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [zoomLevel, setZoomLevel] = useState(1);

  // State for grid data
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterTab, setFilterTab] = useState('all');

  // Fetch Machine Maintenance Schedules
  const fetchMachineSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `GetAllMachineSchedules?orgId=${userData?.userDetails?.orgId || 1}&branchId=${
          userData?.userDetails?.branchID || 6
        }`
      );

      if (response.status === 200 && response.data) {
        // Handle both array and object response structures
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.data
            ? response.data.data
            : [];
        setRowData(data);
      } else {
        setRowData([]);
        enqueueSnackbar(response.data?.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load machine schedules', { variant: 'error' });
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar]);

  useEffect(() => {
    fetchMachineSchedules();
  }, [fetchMachineSchedules]);

  // Get counts for each tab - with safe array check
  const tabCounts = useMemo(() => {
    const dataArray = Array.isArray(rowData) ? rowData : [];
    const allCount = dataArray.length;
    const managementCount = dataArray.filter((item) => item.DepartmentName === 'Management').length;
    const merchandisingCount = dataArray.filter(
      (item) => item.DepartmentName === 'Merchandising'
    ).length;

    return {
      all: allCount,
      management: managementCount,
      merchandising: merchandisingCount,
    };
  }, [rowData]);

  // Filter data based on search text and department tab - with safe array check
  const filteredData = useMemo(() => {
    const dataArray = Array.isArray(rowData) ? rowData : [];
    let data = dataArray;

    // Apply department filter based on selected tab
    if (filterTab === 'management') {
      data = data.filter((item) => item.DepartmentName === 'Management');
    } else if (filterTab === 'merchandising') {
      data = data.filter((item) => item.DepartmentName === 'Merchandising');
    }
    // 'all' tab shows all data

    // Apply search filter
    if (!searchText) return data;

    const lowerSearch = searchText.toLowerCase();
    return data.filter(
      (item) =>
        item &&
        Object.values(item).some(
          (val) =>
            val &&
            (typeof val === 'string' || typeof val === 'number') &&
            val.toString().toLowerCase().includes(lowerSearch)
        )
    );
  }, [rowData, searchText, filterTab]);

  // Color indicator renderer
  const colorIndicatorRenderer = (params) => {
    if (!params.value) return null;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            width: '16px',
            height: '16px',
            backgroundColor: params.value,
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}
        />
        <span>{params.value}</span>
      </div>
    );
  };

  // All Day status renderer
  const allDayRenderer = (params) => (
    <div
      style={{
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: params.value ? '#4CAF5020' : '#FF980020',
        color: params.value ? '#4CAF50' : '#FF9800',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '12px',
      }}
    >
      {params.value ? 'All Day' : 'Time Slot'}
    </div>
  );

  // Schedule count renderer
  const scheduleCountRenderer = (params) => {
    const count = params.data?.Schedules?.length || 0;
    return <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{count}</div>;
  };

  // Duration calculator
  const calculateDuration = (start, end) => {
    if (!start || !end) return '-';

    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffMs = endDate - startDate;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
      }
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return '-';
    }
  };

  // Action buttons renderer
  const actionButtonsRenderer = useCallback(
    (params) => (
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
        {/* <Tooltip title="View Details" arrow>
          <IconButton
            size="small"
            onClick={() => console.log('View schedule:', params.data?.ScheduleMst_ID)}
            sx={{ padding: '4px' }}
          >
            <Iconify icon="mdi:eye-outline" width={18} />
          </IconButton>
        </Tooltip> */}
        <Tooltip title="Edit Schedule" arrow>
          <IconButton
            size="small"
            onClick={() =>
              navigate(
                `${paths.dashboard.Production.maintenance.schedule.new}?scheduleMstID=${params.data?.ScheduleMst_ID}`
              )
            }
            sx={{ padding: '4px' }}
          >
            <Iconify icon="solar:pen-bold" width={18} />
          </IconButton>
        </Tooltip>
        {/* <Tooltip title="Delete Schedule" arrow>
          <IconButton
            size="small"
            color="error"
            onClick={() => console.log('Delete schedule:', params.data?.ScheduleMst_ID)}
            sx={{ padding: '4px' }}
          >
            <Iconify icon="mdi:delete-outline" width={18} />
          </IconButton>
        </Tooltip> */}
      </div>
    ),
    [navigate]
  );

  // Master Column Definitions
  const masterColumnDefs = useMemo(
    () => [
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
      // {
      //   field: 'ScheduleMst_ID',
      //   headerName: 'Schedule ID',
      //   minWidth: 120,
      //   filter: 'agNumberColumnFilter',
      //   type: 'numericColumn',
      // },
      {
        field: 'DepartmentName',
        headerName: 'Department',
        minWidth: 150,
        filter: 'agSetColumnFilter',
        // cellStyle: { fontWeight: 'bold' },
      },
      {
        field: 'SectionName',
        headerName: 'Section',
        minWidth: 180,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'Line_No',
        headerName: 'Line No',
        minWidth: 100,
        filter: 'agTextColumnFilter',
      },
      // {
      //   field: 'Comments',
      //   headerName: 'Comments',
      //   minWidth: 200,
      //   filter: 'agTextColumnFilter',
      //   valueFormatter: (params) => params.value || '-',
      // },
      // {
      //   field: 'Remarks',
      //   headerName: 'Remarks',
      //   minWidth: 150,
      //   filter: 'agTextColumnFilter',
      //   valueFormatter: (params) => params.value || '-',
      // },
      {
        field: 'CreatedByName',
        headerName: 'Created By',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Schedules Count',
        minWidth: 120,
        valueGetter: (params) => params.data?.Schedules?.length || 0,
        cellRenderer: scheduleCountRenderer,
        type: 'numericColumn',
        cellStyle: { textAlign: 'center' },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        maxWidth: 120,
        pinned: 'right',
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: actionButtonsRenderer,
        lockPosition: 'right',
        cellStyle: { textAlign: 'center' },
      },
    ],
    [actionButtonsRenderer]
  );

  // Detail Column Definitions
  const detailColumnDefs = useMemo(
    () => [
      {
        field: 'MachineCode',
        headerName: 'Machine Code',
        minWidth: 130,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'MachineName',
        headerName: 'Machine Name',
        minWidth: 180,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Color',
        headerName: 'Color Code',
        minWidth: 140,
        cellRenderer: colorIndicatorRenderer,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'AllDay',
        headerName: 'Schedule Type',
        minWidth: 130,
        cellRenderer: allDayRenderer,
        filter: 'agSetColumnFilter',
        valueFormatter: (params) => (params.value ? 'All Day' : 'Time Slot'),
      },
      {
        field: 'Start',
        headerName: 'Start Date/Time',
        minWidth: 180,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) =>
          params.value ? fDateTime(new Date(params.value)) : '-',
      },
      {
        field: 'End',
        headerName: 'End Date/Time',
        minWidth: 180,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) =>
          params.value ? fDateTime(new Date(params.value)) : '-',
      },
      {
        headerName: 'Duration',
        minWidth: 120,
        valueGetter: (params) => calculateDuration(params.data?.Start, params.data?.End),
        filter: 'agTextColumnFilter',
        cellStyle: { textAlign: 'center', fontWeight: 'bold' },
      },
      // {
      //   field: 'Comments',
      //   headerName: 'Comments',
      //   minWidth: 200,
      //   filter: 'agTextColumnFilter',
      //   valueFormatter: (params) => params.value || '-',
      // },
      // {
      //   field: 'Remarks',
      //   headerName: 'Remarks',
      //   minWidth: 150,
      //   filter: 'agTextColumnFilter',
      //   valueFormatter: (params) => params.value || '-',
      // },
      {
        field: 'CreatedByName',
        headerName: 'Scheduled By',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      // {
      //   field: 'ScheduleDtl_ID',
      //   headerName: 'Detail ID',
      //   minWidth: 100,
      //   filter: 'agNumberColumnFilter',
      //   type: 'numericColumn',
      // },
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

  // Detail grid configuration
  const detailCellRendererParams = useMemo(
    () => ({
      detailGridOptions: {
        columnDefs: detailColumnDefs,
        defaultColDef: {
          flex: 1,
          sortable: true,
          filter: true,
        },
        domLayout: 'autoHeight',
      },
      getDetailRowData: (params) => {
        params.successCallback(params.data?.Schedules || []);
      },
    }),
    [detailColumnDefs]
  );

  const handleTabChange = (event, newValue) => {
    setFilterTab(newValue);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ width: '100%', height: '80vh', p: 2 }}>
      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={filterTab} onChange={handleTabChange} aria-label="department filter tabs">
          <Tab
            value="all"
            label="All"
            sx={{ minWidth: 'auto' }}
            icon={
              <Label variant={filterTab === 'all' ? 'filled' : 'soft'} color="default">
                {tabCounts.all}
              </Label>
            }
          />
          <Tab
            value="management"
            label="Management"
            sx={{ minWidth: 'auto' }}
            icon={
              <Label variant={filterTab === 'management' ? 'filled' : 'soft'} color="primary">
                {tabCounts.management}
              </Label>
            }
          />
          <Tab
            value="merchandising"
            label="Merchandising"
            sx={{ minWidth: 'auto' }}
            icon={
              <Label variant={filterTab === 'merchandising' ? 'filled' : 'soft'} color="secondary">
                {tabCounts.merchandising}
              </Label>
            }
          />
        </Tabs>
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Search Schedules..."
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
            sx={{ width: { xs: '100%', sm: '300px' } }}
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

export default MachineMaintenanceGrid;
