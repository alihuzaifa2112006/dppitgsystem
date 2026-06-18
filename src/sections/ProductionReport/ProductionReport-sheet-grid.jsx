import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get, Delete } from 'src/api/apibasemethods';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { Box, TextField, InputAdornment, IconButton, Tooltip, Typography, Button } from '@mui/material';
import { Stack } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';
import { fNumber } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
import PropTypes from 'prop-types';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

const PrRequestGrid = () => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [zoomLevel, setZoomLevel] = useState(1);
  const navigate = useNavigate();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const confirm = useBoolean();
  const [selectedReportID, setSelectedReportID] = useState(null);

  const fetchSortingReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `GetSortingReports?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );

      if (response.status === 200) {
        setReportData(response.data || []);
      } else {
        setReportData([]);
        enqueueSnackbar(response.data.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load sorting reports', { variant: 'error' });
      setReportData([]);
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar]);

  useEffect(() => {
    fetchSortingReports();
  }, [fetchSortingReports]);

  const moveToPDFView = useCallback(
    (ReportID) => {
      navigate(paths.dashboard.Production.ProductionReport.pdf(ReportID));
    },
    [navigate]
  );

  const pdfButtonRenderer = useCallback(
    (params) => (
      <Tooltip title="View PDF" arrow>
        <IconButton
          onClick={() => moveToPDFView(params.data.ReportID)}
          size="small"
          sx={{ padding: '4px' }}
        >
          <Iconify icon="mdi:file-pdf-box" width="20" height="20" />
        </IconButton>
      </Tooltip>
    ),
    [moveToPDFView]
  );

  const moveToEditForm = useCallback(
    (ReportID) => {
      navigate(paths.dashboard.Production.ProductionReport.edit(ReportID));
    },
    [navigate]
  );

  const editButtonRenderer = useCallback(
    (params) => (
      <Tooltip title="Edit" arrow>
        <IconButton onClick={() => moveToEditForm(params.data.ReportID)} size="small" sx={{ padding: '4px' }}>
          <Iconify icon="solar:pen-bold" width={18} />
        </IconButton>
      </Tooltip>
    ),
    [moveToEditForm]
  );


  const deleteReport = useCallback(async () => {
    if (!selectedReportID) {
      enqueueSnackbar('Report ID not selected.', { variant: 'error' });
      return;
    }
    try {
      const response = await Delete(
        `DeleteSortingReport/${selectedReportID}/${userData?.userDetails?.userId}`
      );
      if (response.status === 200) {
        enqueueSnackbar('Report deleted successfully', { variant: 'success' });
        fetchSortingReports();
        confirm.onFalse();
        setSelectedReportID(null);
      } else {
        enqueueSnackbar(response.data?.Message || 'Failed to delete report', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      enqueueSnackbar('Error deleting report', { variant: 'error' });
    }
  }, [selectedReportID, userData, enqueueSnackbar, confirm, fetchSortingReports]);

  const handleDeleteClick = useCallback(
    (ReportID) => {
      setSelectedReportID(ReportID);
      confirm.onTrue();
    },
    [confirm]
  );



  const deleteButtonRenderer = useCallback(
    (params) => (
      <Tooltip title="Delete" arrow>
        <IconButton onClick={() => handleDeleteClick(params.data.ReportID)} size="small" sx={{ padding: '4px' }}>
          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
        </IconButton>
      </Tooltip>
    ),
    [handleDeleteClick]
  );


  const actionButtonsRenderer = useCallback(
    (params) => <div style={{ display: 'flex', gap: '4px' }}>{pdfButtonRenderer(params)}
      {editButtonRenderer(params)}
       {/* {deleteButtonRenderer(params)} */}
    </div>,
    [pdfButtonRenderer, editButtonRenderer]
  );

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
      pinned: 'left',

      cellStyle: { textAlign: 'center' },
    },
    {
      field: 'ReportDate',
      headerName: 'Report Date',
      minWidth: 80,
      filter: 'agDateColumnFilter',
      // valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
      valueFormatter: (params) => fDate(params.value),
    },
    // PDONO 
    {
      field: "PDONO",
      headerName: 'Production No',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'SupervisorName',
      headerName: 'Supervisor',
      minWidth: 180,
      filter: 'agTextColumnFilter',
    },

    {
      field: 'ShiftName',
      headerName: 'Shift',
      minWidth: 100,
      filter: 'agTextColumnFilter',
    },
    // {
    //   field: 'TransferTo',
    //   headerName: 'Transfer Location',
    //   minWidth: 200,

    //   valueFormatter: (params) => {
    //     switch (params.value) {
    //       case 1:
    //         return 'Transfer to Store';
    //       case 2:
    //         return 'Sorted Clips Storage Location';
    //       case 3:
    //         return 'Transfer To Margasa Section';
    //       default:
    //         return params.value || '';
    //     }
    //   },
    // },
    // {
    //   field: 'ReqCode',
    //   headerName: 'Requisition Code',
    //   minWidth: 150,
    //   filter: 'agTextColumnFilter',
    // },

    {
      field: 'InvTypeName',
      headerName: 'Inventory Type',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'InvCatName',
      headerName: 'Category Name',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'InvSubCatName',
      headerName: 'Sub Category Name',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'SortedItem',
      headerName: 'Item Name',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'ColorName',
      headerName: 'Color Name',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    // SortedItemID

    {
      field: 'SpareName',
      headerName: 'Spare Name',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    // {
    //   field: 'IssueConfQty',
    //   headerName: 'Issued Qty',
    //   minWidth: 120,
    //   type: 'numericColumn',
    //   cellClass: 'ag-right-aligned-cell',
    //   valueFormatter: (params) => `${fNumber(params.value) || 0} ${params.data.UOMName || ''}`,
    // },
    {
      field: 'SortedQty',
      headerName: 'Sorted Qty',
      minWidth: 120,
      type: 'numericColumn',
      cellClass: 'ag-right-aligned-cell',
      valueFormatter: (params) => `${fNumber(params.value) || 0} ${params.data.UOMName || ''}`,
    },
    {
      field: 'SortedRemQty',
      headerName: 'Remaining Qty',
      minWidth: 120,
      type: 'numericColumn',
      cellClass: 'ag-right-aligned-cell',
      valueFormatter: (params) => `${fNumber(params.value) || 0} ${params.data.UOMName || ''}`,
    },
    {
      field: 'ReasonOfRejec',
      headerName: 'Rejection Reason',
      minWidth: 180,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'Remarks',
      headerName: 'Remarks',
      minWidth: 200,
      filter: 'agTextColumnFilter',
    },

    {
      field: 'actions',
      headerName: 'Action',
      minWidth: 120,
      maxWidth: 120,
      pinned: 'right',
      sortable: false,
      filter: false,
      resizable: false,
      cellRenderer: actionButtonsRenderer,
      lockPosition: 'right',
      cellStyle: { textAlign: 'center' },
    },
  ]);

  const [requestedItemColumnDefs] = useState([
    {
      field: 'ReqCode',
      headerName: 'Requisition Code',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'IssueItemCode',
      headerName: 'Issue Item Code',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'IssueItemDescription',
      headerName: 'Issue Item Description',
      minWidth: 250,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'IssueConfQty',
      headerName: 'Issued Qty',
      minWidth: 120,
      type: 'numericColumn',
      cellClass: 'ag-right-aligned-cell',
      valueFormatter: (params) => `${fNumber(params.value) || 0} ${params.data.UOMName || ''}`,
    },
    {
      field: 'UOMName',
      headerName: 'UOM',
      minWidth: 80,
      filter: 'agTextColumnFilter',
    },
  ]);

  const [wasteColumnDefs] = useState([
    {
      field: 'CategoryName',
      headerName: 'Category',
      minWidth: 180,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'ItemName',
      headerName: 'Item Name',
      minWidth: 220,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'WasteQty',
      headerName: 'Waste Qty',
      minWidth: 100,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => `${fNumber(params.value) || 0}`,
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

  const RequestedItemDetailsRenderer = (props) => {
    // eslint-disable-next-line
    const requestedItems = props.data.Details || [];
    const showScroll = requestedItems.length > 3;

    return (
      <Box sx={{ p: 0 }}>
        <div
          className="ag-theme-material"
          style={{
            height: showScroll ? '150px' : `${Math.max(150, requestedItems.length * 35 + 40)}px`,
            width: '100%',
            overflowY: showScroll ? 'auto' : 'hidden',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#888 #f1f1f1',
          }}
        >
          <AgGridReact
            rowData={requestedItems}
            columnDefs={requestedItemColumnDefs}
            defaultColDef={defaultColDef}
            headerHeight={30}
            rowHeight={25}
          />
        </div>
      </Box>
    );
  };

  RequestedItemDetailsRenderer.propTypes = {
    data: PropTypes.object,
  };

  // Waste Rejection Component
  const WasteRejectionRenderer = (props) => {
    // eslint-disable-next-line
    const wasteRejections = props.data.WasteRejections || [];
    const showScroll = wasteRejections.length > 3;

    return (
      <Box sx={{ p: 0 }}>
        <div
          className="ag-theme-material"
          style={{
            height: showScroll ? '150px' : `${Math.max(150, wasteRejections.length * 35 + 40)}px`,
            width: '100%',
            overflowY: showScroll ? 'auto' : 'hidden',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#888 #f1f1f1',
          }}
        >
          <AgGridReact
            rowData={wasteRejections}
            columnDefs={wasteColumnDefs}
            defaultColDef={defaultColDef}
            headerHeight={30}
            rowHeight={25}
          />
        </div>
      </Box>
    );
  };

  WasteRejectionRenderer.propTypes = {
    data: PropTypes.object,
  };

  // Main Detail Cell Renderer with nested expandable rows
  const DetailCellRenderer = (props) => {
    // eslint-disable-next-line
    const master = props.data;
    const [expandedSection, setExpandedSection] = useState(null);

    const toggleSection = (section) => {
      setExpandedSection((prev) => (prev === section ? null : section));
    };

    return (
      <Box sx={{ p: 1 }}>
        {/* Requested Item Details Section */}
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
            onClick={() => toggleSection('requestedItems')}
          >
            <Iconify
              icon={expandedSection === 'requestedItems' ? 'ep:arrow-down' : 'ep:arrow-right'}
              width={16}
              sx={{ mr: 1, color: '#666' }}
            />
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#424242' }}
            >
              Requested Item Details
            </Typography>
          </Box>
          {expandedSection === 'requestedItems' && <RequestedItemDetailsRenderer data={master} />}
        </Box>

        {/* Waste Rejection Section */}
        <Box>
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
            onClick={() => toggleSection('waste')}
          >
            <Iconify
              icon={expandedSection === 'waste' ? 'ep:arrow-down' : 'ep:arrow-right'}
              width={16}
              sx={{ mr: 1, color: '#666' }}
            />
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#424242' }}
            >
              Waste Rejection Quantity
            </Typography>
          </Box>
          {expandedSection === 'waste' && <WasteRejectionRenderer data={master} />}
        </Box>
      </Box>
    );
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

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure you want to delete this report?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={deleteReport}
          >
            Delete
          </Button>
        }
      />
    </Box>
  );
};

export default PrRequestGrid;