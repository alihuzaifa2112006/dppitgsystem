import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get, Put } from 'src/api/apibasemethods';
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
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { Stack } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { paths } from 'src/routes/paths';
import { useNavigate } from 'react-router-dom';
import { fDate } from 'src/utils/format-time';
import Label from 'src/components/label';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

// Status Cell Renderer Component
const StatusCellRendererComponent = ({ data, value, api, setValue, isApprover, onStatusChange, onApprove }) => {
  const [isApproving, setIsApproving] = useState(false);
  const currentStatus = value || data?.Status || 'Pending';
  const approvedByName = data?.ApprovedByName;
  const exportLCID = data?.ExportLCID;

  const handleStatusChangeLocal = async (event) => {
    const newStatus = event.target.value;

    // If status changed to "Approved", call approval API
    if (newStatus === 'Approved' && currentStatus !== 'Approved') {
      setIsApproving(true);
      try {
        if (onApprove) {
          await onApprove(exportLCID);
        }
      } finally {
        setIsApproving(false);
      }
    } else {
      // Just update status locally for other changes
      if (onStatusChange) {
        onStatusChange(exportLCID, newStatus);
      }
      if (setValue) {
        setValue(newStatus);
      }
      if (api?.applyTransaction) {
        api.applyTransaction({ update: [{ ...data, Status: newStatus }] });
      }
    }
  };

  const handleApproveClick = async () => {
    setIsApproving(true);
    try {
      if (onApprove) {
        await onApprove(exportLCID);
      }
    } finally {
      setIsApproving(false);
    }
  };

  // If already approved, show as text label
  if (currentStatus === 'Approved' && approvedByName) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 150, px: 1 }}>
        <Tooltip title={`Approved by: ${approvedByName}`} arrow>
          <Box
            sx={{
              color: '#4caf50',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              textAlign: 'center',
            }}
          >
            Approved
          </Box>
        </Tooltip>
      </Box>
    );
  }

  // Show dropdown for Pending or Approved (not yet approved)
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', minWidth: 150, px: 1 }}>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <Select
          value={currentStatus}
          onChange={handleStatusChangeLocal}
          displayEmpty
          disabled={!isApprover || isApproving}
          sx={{
            height: '32px',
            '& .MuiSelect-select': {
              py: 0.75,
              color: currentStatus === 'Pending' ? '#f44336' : '#4caf50',
              fontWeight: 'bold',
            },
          }}
        >
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Approved">Approved</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

StatusCellRendererComponent.propTypes = {
  data: PropTypes.object,
  value: PropTypes.string,
  api: PropTypes.object,
  setValue: PropTypes.func,
  isApprover: PropTypes.bool,
  onStatusChange: PropTypes.func,
  onApprove: PropTypes.func,
};

const ELCGrid = () => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [zoomLevel, setZoomLevel] = useState(1);

  // State for grid data
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isApprover, setIsApprover] = useState(false);

  // New state for filter tabs
  const [filterTab, setFilterTab] = useState('all');

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lcToDelete, setLcToDelete] = useState(null);

  const navigate = useNavigate();

  const actionButtonsRenderer = useCallback(
    (params) => (
      <div style={{ display: 'flex', gap: '4px' }}>
        {editButtonRenderer(params)}
        {viewButtonRenderer(params)}
        {amendmentButtonRenderer(params)}
        {deleteButtonRenderer(params)}
      </div>
    ),
    // eslint-disable-next-line
    []
  );

  const editButtonRenderer = (params) => (
    <Tooltip title="Edit" arrow>
      <IconButton
        onClick={() => moveToEditForm(params.data.ExportLCID)}
        size="small"
        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:pen-bold" width={18} />
      </IconButton>
    </Tooltip>
  );

  const moveToEditForm = (ExportLCID) => {
    navigate(paths.dashboard.Commercial.export.ExportLC.edit(ExportLCID));
  };

  const viewButtonRenderer = (params) => (
    <Tooltip title="View" arrow>
      <IconButton
        onClick={() => moveToViewForm(params.data.ExportLCID)}
        size="small"
        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:eye-bold" width={18} />
      </IconButton>
    </Tooltip>
  );

  const moveToViewForm = (ExportLCID) => {
    navigate(paths.dashboard.Commercial.export.ExportLC.view(ExportLCID));
  };

  const amendmentButtonRenderer = (params) => (
    <Tooltip title="Amendment" arrow>
      <IconButton
        onClick={() => moveToAmendmentForm(params.data.ExportLCID)}
        size="small"
        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:document-add-bold" width={18} />
      </IconButton>
    </Tooltip>
  );

  const moveToAmendmentForm = (ExportLCID) => {
    navigate(paths.dashboard.Commercial.export.ExportLC.amendment(ExportLCID));
  };

  // Delete button renderer - disabled for approved LCs
  const deleteButtonRenderer = (params) => {
    const isApproved = params.data.Status === 'Approved';

    return (
      <Tooltip title={isApproved ? "Cannot delete approved LC" : "Delete"} arrow>
        <span>
          <IconButton
            onClick={() => openDeleteDialog(params.data.ExportLCID, params.data.ExportLCNo)}
            size="small"
            sx={{ padding: '4px' }}
            disabled={isApproved}
            color="error"
          >
            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
          </IconButton>
        </span>
      </Tooltip>
    );
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (exportLCID, exportLCNo) => {
    setLcToDelete({ id: exportLCID, lcNo: exportLCNo });
    setDeleteDialogOpen(true);
  };

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setLcToDelete(null);
  };

  // Handle Delete LC (called after confirmation)
  const handleDeleteLC = useCallback(async () => {
    if (!lcToDelete) return;

    try {
      const response = await Get(`CommercialModule/DeleteExportLC?ExportLCID=${lcToDelete.id}`);

      if (response.status === 200 || response.data?.Success) {
        enqueueSnackbar('Export L/C deleted successfully!', { variant: 'success' });

        // Remove the deleted row from the grid
        setRowData((prevData) => prevData.filter((item) => item.ExportLCID !== lcToDelete.id));

        // Close dialog
        closeDeleteDialog();
      } else {
        enqueueSnackbar(response.data?.Message || 'Failed to delete Export L/C', { variant: 'error' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      enqueueSnackbar(error.response?.data?.Message || 'Error deleting Export L/C', { variant: 'error' });
    }
  }, [lcToDelete, enqueueSnackbar]);

  // Fetch Export LC Data
  const FetchExportLCData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `CommercialModule/GetExportLCList?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );

      if (response.status === 200) {
        // Set Status to "Pending" by default if not present
        const formattedData = (response.data.Data || []).map((item) => ({
          ...item,
          Status: item.Status || 'Pending',
        }));

        setRowData(formattedData);
      } else {
        setRowData([]);
        enqueueSnackbar(response.data.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load Export L/C data', { variant: 'error' });
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar]);

  // Check if user is an approver for Doc_ID=8
  const CheckApproverStatus = useCallback(async () => {
    try {
      const response = await Get(
        `getDocumentApproverByID?&ApproverID=${userData?.userDetails?.userId}&DocID=8`
      );

      let approverData = response?.data || [];
      if (response?.data?.Data) {
        approverData = response?.data?.Data || [];
      }

      // Check if current user exists in approver list
      const userIsApprover = Array.isArray(approverData)
        ? approverData.some((item) => item.ApproverID === userData?.userDetails?.userId)
        : false;

      setIsApprover(userIsApprover);
    } catch (error) {
      console.error('Error checking approver status:', error);
      setIsApprover(false);
    }
  }, [userData?.userDetails?.userId]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchExportLCData(), CheckApproverStatus()]);
    };
    fetchData();
  }, [FetchExportLCData, CheckApproverStatus]);

  // Get counts for each tab
  const tabCounts = useMemo(() => {
    const allCount = rowData.length;
    const approvedCount = rowData.filter((item) => item.Status === 'Approved').length;
    const pendingCount = rowData.filter((item) => item.Status === 'Pending').length;
    const rejectedCount = rowData.filter((item) => item.Status === 'Rejected').length;

    return {
      all: allCount,
      approved: approvedCount,
      pending: pendingCount,
      rejected: rejectedCount,
    };
  }, [rowData]);

  // Filter data based on search text and status tab
  const filteredData = useMemo(() => {
    let data = rowData;

    // Apply status filter based on selected tab
    if (filterTab === 'approved') {
      data = data.filter((item) => item.Status === 'Approved');
    } else if (filterTab === 'pending') {
      data = data.filter((item) => item.Status === 'Pending');
    } else if (filterTab === 'rejected') {
      data = data.filter((item) => item.Status === 'Rejected');
    }
    // 'all' tab shows all data

    // Apply search filter
    if (!searchText) return data;

    const lowerSearch = searchText.toLowerCase();
    return data.filter((item) =>
      item?.ExportLCNo?.toLowerCase().includes(lowerSearch) ||
      item?.BeneficiaryName?.toLowerCase().includes(lowerSearch) ||
      item?.OpeningBank?.toLowerCase().includes(lowerSearch) ||
      item?.LienBank?.toLowerCase().includes(lowerSearch)
    );
  }, [rowData, searchText, filterTab]);

  // Handle Status Change
  const handleStatusChange = useCallback((exportLCID, newStatus) => {
    setRowData((prevData) =>
      prevData.map((item) =>
        item.ExportLCID === exportLCID
          ? { ...item, Status: newStatus }
          : item
      )
    );
  }, []);

  // Handle Approval
  const handleApprove = useCallback(async (exportLCID) => {
    try {
      const response = await Put(`CommercialModule/ApproveExportLC`, {
        ExportLCID: exportLCID,
        ApprovedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      });

      if (response.status === 200 || response.data?.Success) {
        enqueueSnackbar('Export L/C approved successfully!', { variant: 'success' });

        // Update the row data with approval information from response
        const approvedByName = response.data?.Data?.ApprovedByName ||
          response.data?.ApprovedByName ||
          (response.data?.Success ? 'Approved' : null);

        if (approvedByName) {
          setRowData((prevData) =>
            prevData.map((item) =>
              item.ExportLCID === exportLCID
                ? {
                  ...item,
                  Status: 'Approved',
                  ApprovedByName: approvedByName,
                }
                : item
            )
          );
        }

        // Refresh the data to get the latest from server
        await FetchExportLCData();
      } else {
        enqueueSnackbar(response.data?.Message || 'Failed to approve Export L/C', { variant: 'error' });
      }
    } catch (error) {
      console.error('Approval error:', error);
      enqueueSnackbar(error.response?.data?.Message || 'Error approving Export L/C', { variant: 'error' });
    }
  }, [userData, enqueueSnackbar, FetchExportLCData]);

  const handleTabChange = (event, newValue) => {
    setFilterTab(newValue);
  };

  // Status Cell Renderer wrapper
  const statusCellRenderer = useCallback(
    (params) => (
      <StatusCellRendererComponent
        data={params.data}
        value={params.value}
        api={params.api}
        setValue={params.setValue}
        isApprover={isApprover}
        onStatusChange={handleStatusChange}
        onApprove={handleApprove}
      />
    ),
    [isApprover, handleStatusChange, handleApprove]
  );

  // Function to fetch Export LC Details
  const fetchExportLCDetails = useCallback(async (exportLCID) => {
    try {
      const response = await Get(`CommercialModule/GetExportLCDetails?ExportLCID=${exportLCID}`);
      console.log('Export LC Details API Response:', response);

      // Check different response structures
      if (response?.data) {
        // Check if response has Success field
        if (response.data.Success && response.data.Data) {
          const data = Array.isArray(response.data.Data) ? response.data.Data : [];
          console.log('Fetched details (Success):', data);
          return data;
        }
        // Check if Data is directly in response.data
        if (response.data.Data) {
          const data = Array.isArray(response.data.Data) ? response.data.Data : [];
          console.log('Fetched details (Data):', data);
          return data;
        }
        // Check if data is directly in response.data (array)
        if (Array.isArray(response.data)) {
          console.log('Fetched details (Array):', response.data);
          return response.data;
        }
      }
      console.warn('No valid data found in response');
      return [];
    } catch (error) {
      console.error('Error fetching Export LC details:', error);
      return [];
    }
  }, []);

  // Detail Column Definitions
  const detailColumnDefs = useMemo(
    () => [
      {
        field: 'PINo',
        headerName: 'PI No',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'PIDate',
        headerName: 'PI Date',
        minWidth: 120,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
      },
      {
        field: 'WIC_Name',
        headerName: 'Customer',
        minWidth: 180,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'End_Cust_Name',
        headerName: 'End Customer',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'Item_Code',
        headerName: 'Item Code',
        minWidth: 180,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'ProductDescription',
        headerName: 'Product Description',
        minWidth: 300,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'Yarn_Type',
        headerName: 'Yarn Type',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'Color_and_Code',
        headerName: 'Color & Code',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'Yarn_Count_Name',
        headerName: 'Yarn Count',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'Composition_Name',
        headerName: 'Composition',
        minWidth: 250,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'Quantity',
        headerName: 'Quantity',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => (params.value ? fNumber(params.value) : '-'),
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'UOMName',
        headerName: 'UOM',
        minWidth: 100,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'NoOfCones',
        headerName: 'No of Cones',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => (params.value ? fNumber(params.value) : '-'),
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'UnitPrice',
        headerName: 'Unit Price',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => (params.value ? `$${fNumber(params.value.toFixed(2))}` : '-'),
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'Total_Amount',
        headerName: 'Total Amount',
        minWidth: 140,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => (params.value ? `$${fNumber(params.value.toFixed(2))}` : '-'),
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'DeliveryDueDate',
        headerName: 'Delivery Due Date',
        minWidth: 150,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
      },
      {
        field: 'Remarks',
        headerName: 'Remarks',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
    ],
    []
  );

  // Configure master-detail relationship
  const detailCellRendererParams = useMemo(
    () => ({
      detailGridOptions: {
        columnDefs: detailColumnDefs,
        defaultColDef: {
          flex: 1,
          sortable: true,
          filter: true,
          resizable: true,
        },
        domLayout: 'autoHeight',
      },
      getDetailRowData: async (params) => {
        // Fetch details on demand when row is expanded
        const exportLCID = params.data.ExportLCID;
        console.log('getDetailRowData called for ExportLCID:', exportLCID);
        try {
          const details = await fetchExportLCDetails(exportLCID);
          console.log('Details returned from fetchExportLCDetails:', details);
          console.log('Details length:', details?.length);
          params.successCallback(details || []);
        } catch (error) {
          console.error('Error loading detail data:', error);
          params.successCallback([]);
        }
      },
    }),
    [detailColumnDefs, fetchExportLCDetails]
  );

  // Column Definitions
  const columnDefs = useMemo(
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
      {
        field: 'ExportLCNo',
        headerName: 'Export L/C No.',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'LCDate',
        headerName: 'L/C Date',
        minWidth: 140,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
      },
      {
        field: 'BeneficiaryName',
        headerName: 'Beneficiary',
        minWidth: 160,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'OpeningBank',
        headerName: 'Opening Bank',
        minWidth: 180,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'LienBank',
        headerName: 'Lien Bank',
        minWidth: 180,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'LienDate',
        headerName: 'Lien Date',
        minWidth: 140,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
      },
      {
        field: 'ReceiveThroughBank',
        headerName: 'Receive Through',
        minWidth: 180,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'ExpiryDate',
        headerName: 'Expiry Date',
        minWidth: 140,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
      },
      {
        field: 'ShipDate',
        headerName: 'Ship Date',
        minWidth: 140,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
      },
      {
        field: 'ExportLCAmount',
        headerName: 'L/C Amount',
        minWidth: 150,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? `$${fNumber(params.value)}` : '-'),
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'Status',
        headerName: 'Status',
        minWidth: 180,
        filter: 'agTextColumnFilter',
        cellRenderer: statusCellRenderer,
        cellStyle: { padding: '4px' },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        maxWidth: 180,
        pinned: 'right',
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: actionButtonsRenderer,
        lockPosition: 'right',
        cellStyle: { textAlign: 'center' },
      },
    ],
    [actionButtonsRenderer, statusCellRenderer]
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
      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={filterTab} onChange={handleTabChange} aria-label="status filter tabs">
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
            value="approved"
            label="Approved"
            sx={{ minWidth: 'auto' }}
            icon={
              <Label variant={filterTab === 'approved' ? 'filled' : 'soft'} color="primary">
                {tabCounts.approved}
              </Label>
            }
          />
          <Tab
            value="pending"
            label="Pending"
            sx={{ minWidth: 'auto' }}
            icon={
              <Label variant={filterTab === 'pending' ? 'filled' : 'soft'} color="warning">
                {tabCounts.pending}
              </Label>
            }
          />
          {/* <Tab
            value="rejected"
            label="Rejected"
            sx={{ minWidth: 'auto' }}
            icon={
              <Label variant={filterTab === 'rejected' ? 'filled' : 'soft'} color="error">
                {tabCounts.rejected}
              </Label>
            }
          /> */}
        </Tabs>
      </Box>

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
              suppressRowClickSelection
              rowData={filteredData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              masterDetail
              detailCellRendererParams={detailCellRendererParams}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete Export L/C <strong>{lcToDelete?.lcNo}</strong>?
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteLC} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ELCGrid;
