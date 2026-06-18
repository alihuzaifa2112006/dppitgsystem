import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get, Put, Delete } from 'src/api/apibasemethods';
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
import { fNumber } from 'src/utils/format-number';
import { paths } from 'src/routes/paths';
import { useNavigate } from 'react-router';
import { fDate } from 'src/utils/format-time';
import Label from 'src/components/label';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

const PurchaseRequestGrid = () => {
  const settings = useSettingsContext();
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [zoomLevel, setZoomLevel] = useState(1);

  // State for grid data
  const [masterData, setMasterData] = useState([]);
  const [detailData, setDetailData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [changedRows, setChangedRows] = useState([]);
  const [filterTab, setFilterTab] = useState('all');
  const [isApprover, setIsApprover] = useState(false);
  const [selectedReqID, setSelectedReqID] = useState(null);
  const deleteConfirmDialog = useBoolean();

  const handleDeleteClick = (ReqID) => {
    setSelectedReqID(ReqID);
    deleteConfirmDialog.onTrue();
  };

  const deleteButtonRenderer = (params) => {
    const isEditable =
      isApprover || (params.data.isApproved !== 'Approved' && userData?.userDetails?.userId === params.data.CreatedBy);

    return (
      <Tooltip title={isEditable ? 'Delete' : 'Cannot delete approved request'} arrow>
        <IconButton
          onClick={() => handleDeleteClick(params.data.ReqID)}
          size="small"
          disabled={!isEditable}
          sx={{ padding: '4px', color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
        </IconButton>
      </Tooltip>
    )
  }

  const actionButtonsRenderer = useCallback(
    (params) => (
      <div style={{ display: 'flex', gap: '4px' }}>
        {/* {viewButtonRenderer(params)} */}

        {editButtonRenderer(params)}
        {pdfButtonRenderer(params)}
        {deleteButtonRenderer(params)}
      </div>
    ),
    // eslint-disable-next-line
    []
  );

  const viewButtonRenderer = (params) => (
    <Tooltip title="View Details" arrow>
      <IconButton
        onClick={() => moveToViewForm(params.data.ReqID)}
        size="small"
        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:eye-bold" width={18} />
      </IconButton>
    </Tooltip>
  );

  const moveToViewForm = (ReqID) => {
    navigate(paths.dashboard.procurement.request.view(ReqID));
  };

  const pdfButtonRenderer = (params) => (
    <Tooltip title="View PDF" arrow>
      <IconButton onClick={() => moveToPDF(params.data.ReqID)} size="small" sx={{ padding: '4px' }}>
        <Iconify icon="mdi:file-pdf-box" width={18} />
      </IconButton>
    </Tooltip>
  );

  const moveToPDF = (ReqID) => {
    navigate(paths.dashboard.Production.ProductRequest.pdf(ReqID));
  };

  const moveToEditForm = useCallback((ReqID) => {
    navigate(paths.dashboard.Production.ProductRequest.edit(ReqID));
  }, [navigate]);

  const editButtonRenderer = useCallback(
    (params) => {
      // Check if status is Approved
      // const isApproved = params.data.isApproved === 'Approved';

      const isEditable =
        isApprover || (params.data.isApproved !== 'Approved' && userData?.userDetails?.userId === params.data.CreatedBy);

      // const canEdit = isApprover || !isApproved;

      return (
        <Tooltip title={isEditable ? 'Edit' : 'Cannot edit approved request'} arrow>
          <IconButton
            onClick={() => moveToEditForm(params.data.ReqID)}
            size="small"
            sx={{ padding: '4px' }}
            disabled={!isEditable}
          >
            <Iconify icon="solar:pen-bold" width={18} />
          </IconButton>
        </Tooltip>
      );
    },
    [isApprover, moveToEditForm, userData?.userDetails?.userId]
  );

  // Check if user is an approver for DocID=9
  const checkApproverStatus = useCallback(async () => {
    try {
      const response = await Get(
        `getDocumentApproverByID?ApproverID=${userData?.userDetails?.userId}&DocID=9`
      );

      let approverData = response?.data || [];
      if (response?.data?.Data) {
        approverData = response?.data?.Data || [];
      }

      // Check if current user exists in approver list
      const userIsApprover = Array.isArray(approverData) && approverData.length > 0;
      setIsApprover(userIsApprover);
      return userIsApprover;
    } catch (error) {
      console.error('Error checking approver status:', error);
      setIsApprover(false);
      return false;
    }
  }, [userData?.userDetails?.userId]);

  // Fetch purchase requests
  const fetchPurchaseRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `GetAllReq?Orgid=${userData?.userDetails?.orgId}&Branchid=${userData?.userDetails?.branchID}`
      );

      if (response.status === 200) {
        const formattedMasterData = (response.data || []).map((masterItem) => {
          const isApprovedStatus =
            masterItem.isApproved === '' || masterItem.isApproved === 'P'
              ? 'Pending'
              : masterItem.isApproved === 'A'
                ? 'Approved'
                : masterItem.isApproved === 'R'
                  ? 'Rejected'
                  : masterItem.isApproved;

          // Add master row info to each detail item for permission checking
          const detailsWithMasterInfo = (masterItem.Details || []).map((detailItem) => ({
            ...detailItem,
            _masterCreatedBy: masterItem.CreatedBy,
            _masterIsApproved: isApprovedStatus,
          }));

          return {
            ...masterItem,
            canApprove: isApprover && masterItem.IsIssued === false,
            TrackingID: masterItem.TrackingID === '0' ? '-' : masterItem.TrackingID,
            isApproved: isApprovedStatus,
            Details: detailsWithMasterInfo,
          };
        });

        setMasterData(formattedMasterData);
      } else {
        setMasterData([]);
        enqueueSnackbar(response.data?.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load purchase requests', { variant: 'error' });
      setMasterData([]);
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar, isApprover]);

  useEffect(() => {
    const fetchData = async () => {
      await checkApproverStatus();
    };
    fetchData();
  }, [checkApproverStatus]);

  useEffect(() => {
    fetchPurchaseRequests();
  }, [fetchPurchaseRequests]);

  // Prepare row data
  const rowData = useMemo(
    () =>
      masterData.map((masterItem) => ({
        ...masterItem,
        Details: masterItem.Details || [],
      })),
    [masterData]
  );

  const handleCellValueChanged = useCallback((params) => {
    if (params.colDef.field === 'isApproved' || params.colDef.field === 'ApprovedRemarks') {
      setChangedRows((prev) => {
        const existingIndex = prev.findIndex((row) => row.ReqID === params.data.ReqID);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = params.data;
          return updated;
        }
        return [...prev, params.data];
      });
    }
  }, []);

  // Handle detail grid cell value change for TotalRequestedQty
  const handleDetailCellValueChanged = useCallback(
    async (params) => {
      if (params.colDef.field === 'TotalRequestedQty') {
        const newValue = parseFloat(params.newValue) || 0;
        const reqDtlID = params.data.ReqDtlID;

        if (!reqDtlID) {
          enqueueSnackbar('Invalid detail ID', { variant: 'error' });
          return;
        }

        try {
          const response = await Put('UpdateTotalRequestedQty', {
            ReqDtlID: reqDtlID,
            TotalRequestedQty: newValue,
            UpdatedBy: userData?.userDetails?.userId,
          });

          if (response.status === 200 || response.data?.Success) {
            enqueueSnackbar('Request quantity updated successfully', { variant: 'success' });
            // update the columns  using userData?.userDetails = {
            params.node.setDataValue('UpdatedBy', userData?.userDetails?.userId);
            params.node.setDataValue('UpdatedByuser', userData?.userDetails?.userName);
            params.node.setDataValue('UpdatedDate', new Date().toISOString());

            // Refresh the data
            // fetchPurchaseRequests();
          } else {
            enqueueSnackbar(response.data?.Message || 'Failed to update request quantity', {
              variant: 'error',
            });
            // Revert the change
            params.node.setDataValue('TotalRequestedQty', params.oldValue);
          }
        } catch (error) {
          console.error('Error updating request quantity:', error);
          enqueueSnackbar(error.response?.data?.Message || 'Error updating request quantity', {
            variant: 'error',
          });
          // Revert the change
          params.node.setDataValue('TotalRequestedQty', params.oldValue);
        }
      }
    },
    [userData, enqueueSnackbar]
  );

  const handleBulkSubmit = useCallback(async () => {
    if (changedRows.length === 0) return;

    try {
      setLoading(true);
      const payload = {
        Requests: changedRows.map((row) => ({
          ReqID: row.ReqID,
          IsApproved:
            row.isApproved === 'Approved' ? 'A' : row.isApproved === 'Rejected' ? 'R' : 'P',
          ApprovedRemarks: row?.ApprovedRemarks || '-',
          ApproverID: userData?.userDetails?.userId,
        })),
      };

      const response = await Put('request/approve', payload);

      if (response.status === 200) {
        enqueueSnackbar('Changes saved successfully', { variant: 'success' });
        setChangedRows([]);
        fetchPurchaseRequests();
      } else {
        enqueueSnackbar('Failed to save changes', { variant: 'error' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error saving changes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [changedRows, userData, enqueueSnackbar, fetchPurchaseRequests]);

  const handleDelete = useCallback(async () => {
    if (!selectedReqID) return;

    try {
      setLoading(true);
      await Delete(`DeleteReq?reqId=${selectedReqID}&deletedBy=${userData?.userDetails?.userId}`);
      enqueueSnackbar('Request deleted successfully', { variant: 'success' });
      deleteConfirmDialog.onFalse();
      setSelectedReqID(null);
      fetchPurchaseRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      enqueueSnackbar(error?.response?.data?.Message || 'Failed to delete request', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedReqID, userData?.userDetails?.userId, enqueueSnackbar, deleteConfirmDialog, fetchPurchaseRequests]);

  // Master Column Definitions (Read-only)
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
        pinned: 'left',
        lockPosition: 'left',
      },
      {
        field: 'ReqCode',
        headerName: 'Request Code',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ReqDate',
        headerName: 'Request Date',
        minWidth: 150,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
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
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Line_No',
        headerName: 'Line No',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'MRPNO',
        headerName: 'MRP',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'isApproved',
        headerName: 'Status',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        editable: (params) => params.data.canApprove,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['Pending', 'Approved', 'Rejected'],
        },
        cellStyle: (params) => {
          let style = {};
          if (params.value === 'Rejected') {
            style = { color: '#c62828', fontWeight: 'bold' };
          } else if (params.value === 'Approved') {
            style = { color: '#2e7d32', fontWeight: 'bold' };
          } else if (params.value === 'Pending') {
            style = { color: '#ff9800', fontWeight: 'bold' };
          }

          if (params.data.canApprove) {
            return {
              ...style,
              backgroundColor: 'rgba(99, 145, 58, 0.10)',
              border: '1px solid rgba(99, 145, 58, 0.25)',
            };
          }
          return style;
        },
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'ApprovedRemarks',
        headerName: 'Approval Remarks',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        editable: (params) => params.data.canApprove,
        cellStyle: (params) =>
          params.data.canApprove
            ? {
              backgroundColor: 'rgba(99, 145, 58, 0.10)',
              border: '1px solid rgba(99, 145, 58, 0.25)',
            }
            : null,
        valueFormatter: (params) => params.value || '-',
      },

      {
        headerName: 'Items Count',
        minWidth: 120,
        valueGetter: (params) => (params.data.Details ? params.data.Details.length : 0),
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
      },
      // {
      //   headerName: 'Total Quantity',
      //   minWidth: 150,
      //   valueGetter: (params) => {
      //     if (!params.data.Details) return 0;
      //     return params.data.Details.reduce((sum, item) => sum + (item.Qty || 0), 0);
      //   },
      //   valueFormatter: (params) => fNumber(params.value.toFixed(2)),
      //   type: 'numericColumn',
      //   cellStyle: { textAlign: 'right' },
      // },

      {
        field: 'actions',
        headerName: '',
        minWidth: 120,
        maxWidth: 120,
        pinned: 'right',
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: actionButtonsRenderer,
        lockPosition: 'right',
        cellStyle: { textAlign: 'right' },
      },
    ],
    [actionButtonsRenderer]
  );

  // Detail Column Definitions (Read-only)
  const detailColumnDefs = useMemo(
    () => [
      // {
      //   field: 'InvTypeName',
      //   headerName: 'Item Type',
      //   minWidth: 150,
      //   filter: 'agTextColumnFilter',
      // },
      // {
      //   field: 'CategoryName',
      //   headerName: 'Category',
      //   minWidth: 150,
      //   filter: 'agTextColumnFilter',
      // },
      {
        field: 'SourceType',
        headerName: 'Source Type',
        minWidth: 120,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ItemDescription',
        headerName: 'Item Description',
        minWidth: 250,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'GRNNo',
        headerName: 'GRN No.',
        minWidth: 120,
        filter: true,
        sortable: true,
        valueFormatter: (params) => params?.value || '-',
      },
      {
        field: 'GRNDate',
        headerName: 'GRN Date',
        minWidth: 120,
        filter: true,
        sortable: true,
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      {
        field: 'ChallanNo',
        headerName: 'Challan No.',
        minWidth: 120,
        filter: true,
        sortable: true,
        valueFormatter: (params) => params?.value || '-',
      },
      {
        field: 'ChallanDate',
        headerName: 'Challan Date',
        minWidth: 120,
        filter: true,
        sortable: true,
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      {
        field: 'TrackingID',
        headerName: 'Lot No.',
        minWidth: 120,
        filter: true,
        sortable: true,
        valueFormatter: (params) => params?.value || '-',
      },
      {
        field: 'VendorName',
        headerName: 'Vendor',
        minWidth: 250,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'TotalQty',
        headerName: 'Available Qty',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => `${fNumber(params.value) || 0} ${params.data.UOMName || ''}`,
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'TotalBale',
        headerName: 'Requested Bale',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => `${fNumber(params.value) || 0}`,
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'TotalRequestedQty',
        headerName: 'Requested Quantity',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        // editable: (params) => {
        //   const userId = userData?.userDetails?.userId;
        //   const masterCreatedBy = params.data._masterCreatedBy;
        //   const masterIsApproved = params.data._masterIsApproved;

        //   // Approver can edit anytime
        //   if (isApprover) {
        //     return true;
        //   }

        //   // Before Approved: CreatedBy can edit
        //   if (masterIsApproved !== 'Approved' && userId === masterCreatedBy) {
        //     return true;
        //   }

        //   return false;
        // },

        cellEditor: 'agNumberCellEditor',
        cellEditorParams: {
          min: 0,
          precision: 2,
        },
        valueFormatter: (params) => `${fNumber(params.value) || 0} ${params.data.UOMName || ''}`,
        // cellStyle: (params) => {
        //   const userId = userData?.userDetails?.userId;
        //   const masterCreatedBy = params.data._masterCreatedBy;
        //   const masterIsApproved = params.data._masterIsApproved;
        //   const isEditable =
        //     isApprover || (masterIsApproved !== 'Approved' && userId === masterCreatedBy);

        //   return {
        //     textAlign: 'right',
        //     ...(isEditable
        //       ? {
        //         backgroundColor: 'rgba(99, 145, 58, 0.10)',
        //         border: '1px solid rgba(99, 145, 58, 0.25)',
        //       }
        //       : {}),
        //   };
        // },
        onCellValueChanged: handleDetailCellValueChanged,
      },
      {
        field: 'StoreName',
        headerName: 'Store',
        minWidth: 100,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'LocationName',
        headerName: 'Storage Location',
        minWidth: 100,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'UpdatedByuser',
        headerName: 'Updated By',
        minWidth: 100,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'UpdatedDate',
        headerName: 'Updated Date',
        minWidth: 100,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      // {
      //   field: 'CreatedDate',
      //   headerName: 'Created Date',
      //   minWidth: 180,
      //   filter: 'agDateColumnFilter',
      //   valueFormatter: (params) => new Date(params.value).toLocaleString(),
      // },
    ],
    [handleDetailCellValueChanged]
  );

  // Default column definitions
  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
      editable: false, // All columns are read-only
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
          editable: false, // Detail columns are also read-only
        },
        domLayout: 'autoHeight',
      },
      getDetailRowData: (params) => params.successCallback(params.data.Details),
    }),
    [detailColumnDefs]
  );

  // Get counts for each tab
  const tabCounts = useMemo(() => {
    const allCount = rowData.length;
    const approvedCount = rowData.filter((item) => item.isApproved === 'Approved').length;
    const pendingCount = rowData.filter((item) => item.isApproved === 'Pending').length;
    const rejectedCount = rowData.filter((item) => item.isApproved === 'Rejected').length;

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
      data = data.filter((item) => item.isApproved === 'Approved');
    } else if (filterTab === 'pending') {
      data = data.filter((item) => item.isApproved === 'Pending');
    } else if (filterTab === 'rejected') {
      data = data.filter((item) => item.isApproved === 'Rejected');
    }
    // 'all' tab shows all data

    // Apply search filter
    if (!searchText) return data;

    const lowerSearch = searchText.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some(
        (val) =>
          val &&
          (typeof val === 'string' || typeof val === 'number') &&
          val.toString().toLowerCase().includes(lowerSearch)
      )
    );
  }, [rowData, searchText, filterTab]);

  // Handle zoom in/out
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
  };

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
              <Label variant={filterTab === 'approved' ? 'filled' : 'soft'} color="success">
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
          <Tab
            value="rejected"
            label="Rejected"
            sx={{ minWidth: 'auto' }}
            icon={
              <Label variant={filterTab === 'rejected' ? 'filled' : 'soft'} color="error">
                {tabCounts.rejected}
              </Label>
            }
          />
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

          <Button
            variant="contained"
            color="primary"
            onClick={handleBulkSubmit}
            disabled={changedRows.length === 0}
            startIcon={<Iconify icon="eva:save-fill" />}
          >
            {`Save Changes (${changedRows.length})`}
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Zoom out" arrow placement="top">
            <IconButton color="primary" sx={{ border: '1px solid #eee' }} onClick={handleZoomOut}>
              <Iconify icon="si:zoom-out-duotone" width={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset Zoom">
            <Button onClick={handleZoomReset} variant="outlined" size="small" sx={{ minWidth: 40 }}>
              {Math.round(zoomLevel * 100)}%
            </Button>
          </Tooltip>
          <Tooltip title="Zoom in" arrow placement="top">
            <IconButton color="primary" sx={{ border: '1px solid #eee' }} onClick={handleZoomIn}>
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
              onCellValueChanged={handleCellValueChanged}
            />
          </div>
        </Scrollbar>
      </Box>
      <ConfirmDialog
        open={deleteConfirmDialog.value}
        onClose={deleteConfirmDialog.onFalse}
        title="Delete Request"
        content="Are you sure you want to delete this request?"
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        }
      />
    </Box>
  );
};

export default PurchaseRequestGrid;
