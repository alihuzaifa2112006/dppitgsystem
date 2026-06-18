import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get, Put } from 'src/api/apibasemethods';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { useTheme } from '@mui/system';
import Iconify from 'src/components/iconify';
import {
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Card,
  Stack,
  Box,
  MenuItem,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Scrollbar from 'src/components/scrollbar';
import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';
import { DatePicker } from '@mui/x-date-pickers';
import Label from 'src/components/label';
import ItemReturnAcknowledgementPDFView from 'src/sections/ItemReturnAcknowledgement/view/ItemReturnAcknowledgement-pdf-view';

const ItemReturnAcknowledgementListView = () => {
  const settings = useSettingsContext();
  const theme = useTheme();

  const themeDark = themeBalham.withPart(colorSchemeDarkBlue);
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // State for grid data
  const [rowData, setRowData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchParams, setSearchParams] = useState({
    TransferNo: '',
    ToDeptName: '',
  });

  // New state for filter tabs
  const [filterTab, setFilterTab] = useState('All');

  // PDF Dialog state
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  // Approval date dialog state (shown when saving)
  const [approvalDateDialogOpen, setApprovalDateDialogOpen] = useState(false);
  const [approvalDate, setApprovalDate] = useState(new Date());

  const containerStyle = useMemo(() => ({ width: '100%', height: '500px' }), []);

  // Fetch Acknowledgement data
  const fetchAcknowledgements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `TransferAcknowledgement/GetAll?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );

      if (response.status === 200) {
        const formattedData = response.data.map((item) => ({
          // Map API fields
          ...item,
          TransferID: item.TransferID,
          TransferNo: item.TransferNo,
          TransferDate: item.TransferDate,
          TransferDetailID: item.TransferDetailID,
          VoucherQty: item.VoucherQty,
          ToDeptID: item.ToDeptID,
          ToDeptName: item.ToDeptName,
          ToLocationID: item.ToLocationID,
          ToLocationName: item.ToLocationName,
          TransferModeID: item.TransferModeID,
          TransferModeName: item.TransferModeName,
          VID: item.VID,
          PDODTLID: item.PDODTLID,
          ORGID: item.ORGID,
          BRNCHID: item.BRNCHID,
          CreatedOn: item.CreatedOn,
          CreatedBy: item.CreatedBy,
          UpdatedOn: item.UpdatedOn,
          UpdatedBy: item.UpdatedBy,
          IsActive: item.IsActive,
          IsDelete: item.IsDelete,
          DetailCreatedOn: item.DetailCreatedOn,
          DetailCreatedBy: item.DetailCreatedBy,
          DetailIsActive: item.DetailIsActive,
          DetailIsDelete: item.DetailIsDelete,
          // Acknowledgement fields (initialize as false if not present in API)
          isAcknowledge:
            item.IsAcknowledge !== undefined ? item.IsAcknowledge : item.isAcknowledge || false,
          AcknowledgeDate: item.AcknowledgeDate || null,
          AcknowledgeBy: item.AcknowledgeBy || null,
          // Track changes
          originalIsAcknowledge:
            item.IsAcknowledge !== undefined ? item.IsAcknowledge : item.isAcknowledge || false,
          hasChanges: false,
          Types: item.Types || null,
          isReturned: item.Types === 'Input' || false,
        }));
        setRowData(formattedData);
        setOriginalData(formattedData);
      } else {
        setRowData([]);
        setOriginalData([]);
        enqueueSnackbar('No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load acknowledgement data', { variant: 'error' });
      setRowData([]);
      setOriginalData([]);
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, userData]);

  useEffect(() => {
    fetchAcknowledgements();
  }, [fetchAcknowledgements]);

  // Filter data based on search parameters and status tab
  const filteredData = useMemo(() => {
    let data = rowData.filter(
      (item) =>
        (item.TransferNo || '').toLowerCase().includes(searchParams.TransferNo.toLowerCase()) &&
        (item.ToDeptName || '').toLowerCase().includes(searchParams.ToDeptName.toLowerCase())
    );

    // Apply status filter based on selected tab
    if (filterTab === 'Pending') {
      data = data.filter((item) => !item.isAcknowledge);
    } else if (filterTab === 'Acknowledged') {
      data = data.filter((item) => item.isAcknowledge);
    }
    // 'all' tab shows all data

    return data;
  }, [rowData, searchParams, filterTab]);

  // Get counts for each tab
  const tabCounts = useMemo(() => {
    const allCount = rowData.length;
    const pendingCount = rowData.filter((item) => !item.isAcknowledge).length;
    const acknowledgedCount = rowData.filter((item) => item.isAcknowledge).length;

    return {
      all: allCount,
      pending: pendingCount,
      acknowledged: acknowledgedCount,
    };
  }, [rowData]);

  // Get changed rows
  const getChangedRows = useCallback(() => rowData.filter((item) => item.hasChanges), [rowData]);

  // Check if there are changes to submit
  const hasChanges = useMemo(() => getChangedRows().length > 0, [getChangedRows]);

  const handleAcknowledgementChange = useCallback(
    async (params) => {
      try {
        const newIsAcknowledge = params.newValue;
        const updatedData = {
          ...params.data,
          isAcknowledge: newIsAcknowledge,
          hasChanges: newIsAcknowledge !== params.data.originalIsAcknowledge,
        };

        // Update local state immediately
        setRowData((prev) =>
          prev.map((item) =>
            item.TransferDetailID === updatedData.TransferDetailID ? updatedData : item
          )
        );

        return true;
      } catch (error) {
        console.error('Error updating acknowledgement status:', error);
        enqueueSnackbar('Error updating acknowledgement status', { variant: 'error' });
        return false;
      }
    },
    [enqueueSnackbar]
  );

  // Open approval date dialog when user clicks Save
  const handleBulkSubmitClick = useCallback(() => {
    const changedRows = getChangedRows();
    if (changedRows.length === 0) {
      enqueueSnackbar('No changes to submit', { variant: 'warning' });
      return;
    }
    setApprovalDate(new Date());
    setApprovalDateDialogOpen(true);
  }, [getChangedRows, enqueueSnackbar]);

  // Perform actual submission with chosen approval date
  const handleBulkSubmitWithApprovalDate = useCallback(async () => {
    try {
      const changedRows = getChangedRows();
      if (changedRows.length === 0) {
        setApprovalDateDialogOpen(false);
        return;
      }

      const approvalDateStr = approvalDate ? new Date(approvalDate).toISOString().slice(0, 19) : null;

      const payload = changedRows.map((item) => ({
        TransferDetailID: item.TransferDetailID,
        IsAcknowledge: item.isAcknowledge,
        AcknowledgeDate: item.isAcknowledge ? approvalDateStr : null,
        AcknowledgeBy: item.isAcknowledge ? userData?.userDetails?.userId || 1 : 0,
      }));

      const result = await Put('TransferAcknowledgement/Update', payload);

      if (result.status === 200) {
        enqueueSnackbar(`Successfully updated ${changedRows.length} acknowledgement(s)`, {
          variant: 'success',
        });
        setApprovalDateDialogOpen(false);
        fetchAcknowledgements();
      } else {
        enqueueSnackbar('Some updates failed', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error updating acknowledgements:', error);
      enqueueSnackbar('Error updating acknowledgements', { variant: 'error' });
    }
  }, [
    getChangedRows,
    userData,
    enqueueSnackbar,
    fetchAcknowledgements,
    approvalDate,
  ]);

  const handleApprovalDateDialogClose = useCallback(() => {
    setApprovalDateDialogOpen(false);
  }, []);

  // Status display renderer with color coding
  const statusDisplayRenderer = (params) => {
    const isAcknowledged =
      params.value === true || params.value === 'true' || params.data?.isAcknowledge === true;

    if (isAcknowledged) {
      return (
        <div
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: '#4CAF5020',
            color: '#4CAF50',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          Acknowledged
        </div>
      );
      // eslint-disable-next-line
    } else {
      return (
        <div
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: '#FFA00020',
            color: '#FFA000',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          Pending
        </div>
      );
    }
  };

  const handlePdfIconClick = useCallback((row) => {
    setSelectedRowData(row);
    setPdfDialogOpen(true);
  }, []);

  const handlePdfDialogClose = useCallback(() => {
    setPdfDialogOpen(false);
    setSelectedRowData(null);
  }, []);

  const pdfButtonRenderer = useCallback(
    (params) => (
      <Tooltip title="View PDF" arrow>
        <IconButton
          onClick={() => handlePdfIconClick(params.data)}
          size="small"
          sx={{ padding: '4px' }}
        >
          <Iconify icon="mdi:file-pdf-box" width="20" height="20" />
        </IconButton>
      </Tooltip>
    ),
    [handlePdfIconClick]
  );

  const actionButtonsRenderer = useCallback(
    (params) => <div style={{ display: 'flex', gap: '4px' }}>{pdfButtonRenderer(params)}</div>,
    [pdfButtonRenderer]
  );

  // Column definitions
  const columnDefs = useMemo(
    () => [
      {
        field: 'isAcknowledge',
        headerName: 'Status',
        minWidth: 150,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: [false, true], // Use actual boolean values
        },
        cellRenderer: (params) => {
          // Custom cell renderer that combines display and edit functionality
          if (params.node.editing) {
            // When editing, show the dropdown
            const handleChange = (event) => {
              const newValue = event.target.value === 'true';
              const updatedParams = {
                ...params,
                newValue,
              };
              handleAcknowledgementChange(updatedParams);
              params.api.stopEditing();
            };

            return (
              <TextField
                select
                value={params.value ? 'true' : 'false'}
                onChange={handleChange}
                variant="outlined"
                size="small"
                fullWidth
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '32px',
                    fontSize: '0.875rem',
                  },
                  '& .MuiSelect-select': {
                    padding: '6px 32px 6px 12px',
                  },
                }}
              >
                <MenuItem value="false" sx={{ color: '#FFA000', fontWeight: 'bold' }}>
                  Pending
                </MenuItem>
                <MenuItem value="true" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  Acknowledged
                </MenuItem>
              </TextField>
            );
            // eslint-disable-next-line
          } else {
            // When not editing, show the status display
            return statusDisplayRenderer(params);
          }
        },
        valueFormatter: (params) => (params.value ? 'Acknowledged' : 'Pending'),
        onCellValueChanged: (params) => {
          // This will be called when the cell value changes via AG Grid
          if (params.oldValue !== params.newValue) {
            handleAcknowledgementChange(params);
          }
        },
        cellStyle: (params) => ({
          backgroundColor: params.data.hasChanges ? '#63913a20' : 'transparent',
          border: params.data.hasChanges ? '2px solid #63913a' : 'none',
        }),
      },
      {
        field: 'TransferNo',
        headerName: 'Transfer No',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },

      {
        field: 'isReturned',
        headerName: 'Type',
        minWidth: 100,
        filter: 'agTextColumnFilter',
        type: 'textColumn',
        cellStyle: (params) => {
          if (params.value === true) {
            return { color: '#c62828' };
            // eslint-disable-next-line
          } else if (params.value === false) {
            return { color: '#2e7d32' };
            // eslint-disable-next-line
          }
          return null;
        },
        // valueFormatter: (params) => (params.value ? 'Returned' : 'Produced'),
        cellRenderer: (params) => {
          if (params.value === true) {
            return 'Returned';
            // eslint-disable-next-line
          } else if (params.value === false) {
            return 'Produced';
            // eslint-disable-next-line
          }
          return null;
        },
      },
      {
        field: 'ItemCode',
        headerName: 'Item Code',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'ItemDescription',
        headerName: 'Item Description',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'TransferDate',
        headerName: 'Transfer Date',
        minWidth: 120,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
      },
      {
        field: 'ToDeptName',
        headerName: 'To Department',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'ToLocationName',
        headerName: 'To Location',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'TransferModeName',
        headerName: 'Transfer Mode',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'VoucherQty',
        headerName: 'Voucher Qty',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '0.00',
      },

      {
        field: 'AcknowledgeByName',
        headerName: 'Acknowledge By Name ',
        minWidth: 220,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },

      {
        field: 'AcknowledgeDate',
        headerName: 'Acknowledge Date',
        minWidth: 150,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
      },
      {
        field: 'Action',
        headerName: '',
        minWidth: 80,
        maxWidth: 80,
        pinned: 'right',
        filter: false,
        cellRenderer: actionButtonsRenderer,
      },
    ],
    [handleAcknowledgementChange, actionButtonsRenderer]
  );

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
      editable: false, // Make all columns non-editable by default
    }),
    []
  );

  const onFirstDataRendered = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  const handleSearchChange = (field) => (event) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleTabChange = (event, newValue) => {
    setFilterTab(newValue);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div style={containerStyle}>
      {/* Header Section with Controls */}
      <Card sx={{ p: 2 }}>
        {/* Filter Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={filterTab} onChange={handleTabChange} aria-label="status filter tabs">
            <Tab
              value="All"
              label="All"
              sx={{ minWidth: 'auto' }}
              icon={
                <Label variant="filled" color="default">
                  {tabCounts.all}
                </Label>
              }
            />
            <Tab
              value="Pending"
              label="Pending"
              sx={{ minWidth: 'auto' }}
              icon={
                <Label variant={filterTab === 'Pending' ? 'filled' : 'soft'} color="warning">
                  {tabCounts.pending}
                </Label>
              }
            />
            <Tab
              value="Acknowledged"
              label="Acknowledged"
              sx={{ minWidth: 'auto' }}
              icon={
                <Label variant={filterTab === 'Acknowledged' ? 'filled' : 'soft'} color="success">
                  {tabCounts.acknowledged}
                </Label>
              }
            />
          </Tabs>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
          justifyContent="end"
          mb={2}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Button
              variant="contained"
              color="primary"
              onClick={handleBulkSubmitClick}
              disabled={!hasChanges}
              startIcon={<Iconify icon="eva:save-fill" />}
            >
              {`Save Changes (${getChangedRows().length})`}
            </Button>
          </Stack>
        </Stack>

        {/* Search and Zoom Controls */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Search Transfer No"
              variant="outlined"
              size="small"
              value={searchParams.TransferNo}
              onChange={handleSearchChange('TransferNo')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" width={20} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Search Department"
              variant="outlined"
              size="small"
              value={searchParams.ToDeptName}
              onChange={handleSearchChange('ToDeptName')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" width={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
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
      </Card>

      {/* Data Grid */}
      <Box
        sx={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top left',
          width: `${100 / zoomLevel}%`,
          // height: `${100 / zoomLevel}%`,
          mt: 2,
        }}
      >
        <Scrollbar>
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
            suppressRowClickSelection
            singleClickEdit
            onFirstDataRendered={onFirstDataRendered}
          />
        </Scrollbar>
      </Box>

      {/* Approval date dialog - shown when saving */}
      <Dialog open={approvalDateDialogOpen} onClose={handleApprovalDateDialogClose} maxWidth="xs" fullWidth>
        <DialogTitle>Approval Date</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <DatePicker
              label="Approval Date"
              format="dd MMM yyyy"
              value={approvalDate}
              onChange={(newValue) => setApprovalDate(newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleApprovalDateDialogClose} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleBulkSubmitWithApprovalDate}>
            Confirm & Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* PDF Dialog - opens with row data via props */}
      <Dialog
        open={pdfDialogOpen}
        onClose={handlePdfDialogClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { height: '90vh' } }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Stock Acknowledgement PDF</span>
          <Tooltip title="Close" arrow>
            <IconButton
              aria-label="close"
              onClick={handlePdfDialogClose}
              sx={{
                color: (t) => t.palette.grey[500],
                '&:hover': { color: (t) => t.palette.grey[700] },
              }}
            >
              <Iconify icon="eva:close-fill" width={24} height={24} />
            </IconButton>
          </Tooltip>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRowData && (
            <ItemReturnAcknowledgementPDFView rowData={selectedRowData} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ItemReturnAcknowledgementListView;
