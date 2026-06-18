import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get, Post, Put } from 'src/api/apibasemethods';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { useTheme } from '@mui/system';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import ItemIssueEntryDialog from './ItemIssueEntryDialog';
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
  Typography,
} from '@mui/material';
import Scrollbar from 'src/components/scrollbar';
import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';
import { DatePicker } from '@mui/x-date-pickers';
import Label from 'src/components/label';
import { paths } from 'src/routes/paths';
import { useNavigate } from 'react-router';
import { useBoolean } from 'src/hooks/use-boolean';

const IssueNoteListView = () => {
  const settings = useSettingsContext();
  const theme = useTheme();

  const themeDark = themeBalham.withPart(colorSchemeDarkBlue);
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const navigate = useNavigate();

  // State for grid data
  const [rowData, setRowData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchParams, setSearchParams] = useState({
    ReqCode: '',
    ItemDescription: '',
    VendorName: '',
  });

  // New state for filter tabs
  const [filterTab, setFilterTab] = useState('All');
  const [isApprover, setIsApprover] = useState(false);
  const [changedRows, setChangedRows] = useState([]);

  const containerStyle = useMemo(() => ({ width: '100%', height: '500px' }), []);

  // Dialog states
  const dialog = useBoolean();
  const closeSRDialog = useBoolean();
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [closeReason, setCloseReason] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const handleOpenIssueDialog = useCallback((row, editMode = false) => {
    setSelectedIssue(row);
    setIsEditMode(editMode);
    dialog.onTrue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCloseIssueDialog = useCallback(() => {
    setSelectedIssue(null);
    setIsEditMode(false);
    dialog.onFalse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenCloseSRDialog = useCallback((row) => {
    setSelectedIssue(row);
    closeSRDialog.onTrue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirmCloseSR = useCallback(async () => {
    try {
      const payload = {
        ReqDtlID: selectedIssue.ReqDtlID,
        SRClosingReason: closeReason,
        SRCloseBy: userData?.userDetails?.userId || 1,
      };
      const res = await Put('reqdtl/closesr', payload);
      if (res.status === 200) {
        enqueueSnackbar('SR Line Closed', { variant: 'success' });
        fetchIssues();
        closeSRDialog.onFalse();
      } else {
        enqueueSnackbar('Failed to close SR Line', { variant: 'error' });
      }
    } catch (e) {
      console.error(e);
      enqueueSnackbar('Error closing SR Line', { variant: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIssue?.ReqDtlID]);

  // Fetch Issue data
  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `GetAllRequestIssueListFlat?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );

      if (response.status === 200) {
        const formattedData = response.data.map((item) => {
          // Format approval status
          const isApprovedStatus =
            item.isApproved === '' || item.isApproved === 'P'
              ? 'Pending'
              : item.isApproved === 'A'
                ? 'Approved'
                : item.isApproved === 'R'
                  ? 'Rejected'
                  : item.isApproved || 'Pending';

          return {
            // Map API fields
            ...item,
            ReqID: item.ReqID,
            ReqCode: item.ReqCode,
            ReqDate: item.ReqDate,
            DeptID: item.DeptID,
            DeptName: item.DeptName,
            SectionID: item.SectionID,
            SectionName: item.SectionName,
            InvTypeID: item.InvTypeID,
            InvTypeName: item.InvTypeName,
            CategoryID: item.CategoryID,
            CategoryName: item.CategoryName,
            SubCatID: item.SubCatID,
            SubCatName: item.SubCatName,
            ItemID: item.ItemID,
            ItemDescription: item.ItemDescription,
            UOMID: item.UOMID,
            UOMName: item.UOMName,
            TotalQty: item.TotalQty,
            TotalRequestedQty: item.TotalRequestedQty,
            VendorID: item.VendorID,
            VendorName: item.VendorName,
            StoreID: item.StoreID,
            StoreName: item.StoreName,
            LocationID: item.LocationID,
            LocationName: item.LocationName,
            TrackingID: item.TrackingID,
            SourceType: item.SourceType,
            GRNID: item.GRNID,
            GRNDtlID: item.GRNDTLID,
            GRNNo: item.GRNNo,
            GRNDate: item.GRNDate,
            ChallanNo: item.ChallanNo,
            ChallanDate: item.ChallanDate,
            IssueCode: item.IssueCode,
            IssueID: item.IssueID,
            IssueDtlID: item.IssueDtlID,
            IssueQty: item.IssueQty,
            RemainingQty: (() => {
              // Calculate totalPrevIssuedQty from IssueHistory (sum of all IssueQty)
              const totalPrevIssuedQty =
                (item.IssueHistory || []).reduce((acc, curr) => acc + (curr.IssueQty || 0), 0) || 0;
              // RemainingQty = TotalRequestedQty - totalPrevIssuedQty
              return (item.TotalRequestedQty || 0) - totalPrevIssuedQty;
            })(),
            PendingQty: item.TotalRequestedQty - item.TotalIssuedQty,
            IssueRemarks: item.IssueRemarks,
            IssueDate: item.IssueDate,
            // Additional fields for editing
            ReqDtlID: item.ReqDtlID,
            ItemOpenID: item.ItemOpenID,
            ItemOpenDtlID: item.ItemOpenDtlID,
            Status: item.Status,
            // Approval fields
            isApproved: isApprovedStatus,
            ApprovedRemarks: item.ApprovedRemarks || '',
            canApprove: isApprover && item.IssueID && isApprovedStatus !== 'Approved',
            // Track changes
            Line_No: item.Line_No,
            TotalBale: item.TotalBale,
            originalIssueQty: item.IssueQty,
            IssueBaleQty: item.TotalBaleIssued,
            originalIssueBaleQty: item.TotalBaleIssued,
            BagQty: item.BagQty || 0,
            originalBagQty: item.BagQty || 0,
            hasChanges: false,
            // Issue History
            IssueHistory: item.IssueHistory || [],
            // sort with latest history id
            latestHistoryID:
              item.IssueHistory.sort((a, b) => b.HistoryID - a.HistoryID)[0]?.HistoryID || 0,
            latestHistoryIssuedQty: item.IssueHistory.sort((a, b) => b.HistoryID - a.HistoryID)[0]?.IssueQty || 0,
            latestHistoryRemainingQty: item.IssueHistory.sort((a, b) => b.HistoryID - a.HistoryID)[0]?.RemainingQty || 0,
          };
        });
        setRowData(formattedData);
        setOriginalData(formattedData);
      } else {
        setRowData([]);
        setOriginalData([]);
        enqueueSnackbar('No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load issue data', { variant: 'error' });
      setRowData([]);
      setOriginalData([]);
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, userData, isApprover]);
  // Check if user is an approver for DocID=10
  const checkApproverStatus = useCallback(async () => {
    try {
      const response = await Get(
        `getDocumentApproverByID?ApproverID=${userData?.userDetails?.userId}&DocID=10`
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

  // Handle cell value change for approval fields
  const handleCellValueChanged = useCallback((params) => {
    if (params.colDef.field === 'isApproved' || params.colDef.field === 'ApprovedRemarks') {
      setChangedRows((prev) => {
        const existingIndex = prev.findIndex((row) => row.IssueID === params.data.IssueID);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = params.data;
          return updated;
        }
        return [...prev, params.data];
      });
    }
  }, []);

  // Handle bulk submit for approval changes
  const handleBulkSubmit = useCallback(async () => {
    if (changedRows.length === 0) return;

    try {
      setLoading(true);
      const payload = {
        requests: changedRows
          .filter((row) => row.IssueID) // Only include rows with IssueID
          .map((row) => ({
            issueID: row.IssueID,
            isApproved:
              row.isApproved === 'Approved' ? 'A' : row.isApproved === 'Rejected' ? 'R' : 'P',
            approvedRemarks: row?.ApprovedRemarks || '-',
            approverID: userData?.userDetails?.userId,
          })),
      };

      const response = await Put('Issue/approve', payload);

      if (response.status === 200) {
        enqueueSnackbar('Changes saved successfully', { variant: 'success' });
        setChangedRows([]);
        fetchIssues();
      } else {
        enqueueSnackbar('Failed to save changes', { variant: 'error' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error saving changes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [changedRows, userData, enqueueSnackbar, fetchIssues]);

  // ... (rest of component)

  const handleSaveIssue = async (data) => {
    // API call to save issue
    try {
      const isEdit = isEditMode;

      if (isEdit) {
        // Update latest history record
        const payload = {
          HistoryID: data.latestHistoryID,
          IssueID: data.IssueID,
          IssueDtlID: data.IssueDtlID,
          ItemID: data.ItemID,
          UOMID: data.UOMID,
          IssueQty: parseFloat(data.IssueQty) || 0,
          IssueBaleQty: parseFloat(data.IssueBaleQty) || 0,
          // when editing this field, values will remain same as the latest history record according to the historyID
          RemainingQty: parseFloat(data.IssueHistory.find((history) => history.HistoryID === data.latestHistoryID).RemainingQty) || 0,
          UpdatedBy: userData?.userDetails?.userId || 1,
          Org_Id: userData?.userDetails?.orgId || 1,
          Branch_Id: userData?.userDetails?.branchID || 1,
          BagQty: parseFloat(data.BagQty) || 0,
          VehNO: data.VehNO || '',
          DriverName: data.DriverName || '',
        };

        const result = await Put('Issue/UpdateIssueHistory', payload);

        const payload2 = [
          {
            IssueDate: fDate(data.IssueDate, 'yyyy-MM-dd'),
            DeptID: data.DeptID,
            SectionID: data.SectionID,
            IssuedTo: 1, // Default?
            IssueID: data.IssueID || 0, // 0 for new
            CreatedBy: userData?.userDetails?.userId || 1,
            Org_Id: userData?.userDetails?.orgId || 1,
            Branch_Id: userData?.userDetails?.branchID || 1,
            Details: [
              {
                IssueID: data.IssueID || 0,
                IssueDtlID: data.IssueDtlID || 0,
                RemainingQty: parseFloat(data.RemainingQty) || 0,
                RequestedQty: parseFloat(data.TotalRequestedQty) || 0,
                VehNO: data.VehNO || '',
                DriverName: data.DriverName || '',
                InvTypeID: data.InvTypeID,
                CategoryID: data.CategoryID,
                SubCatID: data.SubCatID,
                ColorID: data.ColorID || 0,
                ItemID: data.ItemID,
                UOMID: data.UOMID,
                IssueQty: parseFloat(data.IssueQty) || 0,
                BagQty: parseFloat(data.BagQty) || 0,
                IssueBaleQty: parseFloat(data.IssueBaleQty) || 0,
                ReqID: data.ReqID,
                ReqDtlID: data.ReqDtlID,
                GRNID: data.GRNID || 0,
                GRNDtlID: data.GRNDtlID || 0,
                ItemOpenID: data.ItemOpenID || 0,
                ItemOpenDtlID: data.ItemOpenDtlID || 0,
                VendorID: data.VendorID || 0,
                StoreID: data.StoreID || 0,
                LocationID: data.LocationID || 0,
                TrackingID: data.TrackingID || '',
                SourceType: data.SourceType,
                Remarks: data.Remarks,
                CreatedBy: userData?.userDetails?.userId,
              },
            ],
          },
        ];

        if (result.status === 200) {
          await Post('AddRequestIssue', payload2);
          enqueueSnackbar('Issue history updated successfully', { variant: 'success' });
          fetchIssues();
          dialog.onFalse();
        } else {
          enqueueSnackbar('Failed to update issue history', { variant: 'error' });
        }
      } else {
        // Create new issue
        const payload = [
          {
            IssueDate: fDate(data.IssueDate, 'yyyy-MM-dd'),
            DeptID: data.DeptID,
            SectionID: data.SectionID,
            IssuedTo: 1, // Default?
            IssueID: data.IssueID || 0, // 0 for new
            CreatedBy: userData?.userDetails?.userId || 1,
            Org_Id: userData?.userDetails?.orgId || 1,
            Branch_Id: userData?.userDetails?.branchID || 1,
            Details: [
              {
                AddHistory: true,
                IssueID: data.IssueID || 0,
                IssueDtlID: data.IssueDtlID || 0,
                RemainingQty: parseFloat(data.RemainingQty) || 0,
                RequestedQty: parseFloat(data.TotalRequestedQty) || 0,
                VehNO: data.VehNO || '',
                DriverName: data.DriverName || '',
                InvTypeID: data.InvTypeID,
                CategoryID: data.CategoryID,
                SubCatID: data.SubCatID,
                ColorID: data.ColorID || 0,
                ItemID: data.ItemID,
                UOMID: data.UOMID,
                IssueQty: parseFloat(data.IssueQty) || 0,
                BagQty: parseFloat(data.BagQty) || 0,
                IssueBaleQty: parseFloat(data.IssueBaleQty) || 0,
                ReqID: data.ReqID,
                ReqDtlID: data.ReqDtlID,
                GRNID: data.GRNID || 0,
                GRNDtlID: data.GRNDtlID || 0,
                ItemOpenID: data.ItemOpenID || 0,
                ItemOpenDtlID: data.ItemOpenDtlID || 0,
                VendorID: data.VendorID || 0,
                StoreID: data.StoreID || 0,
                LocationID: data.LocationID || 0,
                TrackingID: data.TrackingID || '',
                SourceType: data.SourceType,
                Remarks: data.Remarks,
                CreatedBy: userData?.userDetails?.userId,
              },
            ],
          },
        ];

        const result = await Post('AddRequestIssue', payload);
        if (result.status === 200) {
          enqueueSnackbar('Issue saved successfully', { variant: 'success' });
          fetchIssues();
          dialog.onFalse();
        } else {
          enqueueSnackbar('Failed to save issue', { variant: 'error' });
        }
      }
    } catch (e) {
      console.error(e);
      enqueueSnackbar(e?.response?.data?.Message || 'Error saving issue', { variant: 'error' });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await checkApproverStatus();
    };
    fetchData();
  }, [checkApproverStatus]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Filter data based on search parameters and status tab
  const filteredData = useMemo(() => {
    let data = rowData.filter(
      (item) =>
        item.ReqCode.toLowerCase().includes(searchParams.ReqCode.toLowerCase()) &&
        item.ItemDescription.toLowerCase().includes(searchParams.ItemDescription.toLowerCase()) &&
        item.VendorName.toLowerCase().includes(searchParams.VendorName.toLowerCase())
    );

    // Apply status filter based on selected tab
    if (filterTab === 'Pending') {
      data = data.filter((item) => item.Status === 'Pending');
    } else if (filterTab === 'Completed') {
      data = data.filter((item) => item.Status === 'Completed');
    }
    // 'all' tab shows all data

    return data;
  }, [rowData, searchParams, filterTab]);

  // Get counts for each tab
  const tabCounts = useMemo(() => {
    const allCount = rowData.length;
    const pendingCount = rowData.filter((item) => item.Status === 'Pending').length;
    const completedCount = rowData.filter((item) => item.Status === 'Completed').length;

    return {
      all: allCount,
      pending: pendingCount,
      completed: completedCount,
    };
  }, [rowData]);

  // Source Type renderer with color coding
  const sourceTypeRenderer = (params) => {
    let color;
    switch (params.value) {
      case 'GRN':
        color = '#4CAF50'; // Green
        break;
      case 'Transaction':
        color = '#2196F3'; // Blue
        break;
      default:
        color = '#9E9E9E'; // Grey
    }

    return (
      <div
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: `${color}20`,
          color,
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        {params.value}
      </div>
    );
  };

  // Change indicator renderer
  const changeIndicatorRenderer = (params) => {
    if (params.data.Status === 'Completed') {
      return (
        <div
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            color: '#4CAF50',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          Completed
        </div>
      );
    }
    if (params.data.Status === 'Pending') {
      return (
        <div
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            color: '#FFA000',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          Pending
        </div>
      );
    }
    return (
      <div
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: '#FFA00020',
          color: '#9E9E9E',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        Pending
      </div>
    );
  };

  const moveToPDFView = useCallback(
    (IssueID) => {
      navigate(paths.dashboard.InventoryManagement.ItemIssue.pdf(IssueID));
    },
    [navigate]
  );

  const pdfButtonRenderer = useCallback(
    (params) => (
      <Tooltip title="View PDF" arrow>
        <IconButton
          disabled={!params.data.IssueID}
          onClick={() => moveToPDFView(params.data.IssueID)}
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
    (params) => {
      const isPending = params.data.Status === 'Pending';
      const isPartial = params.data.RemainingQty > 0;
      const hasIssue = !!params.data.IssueID;

      return (
        <Stack direction="row" spacing={0.5}>
          {/* Submit Issue (Visible if pending/partial and not an existing issue row, unless we allow add more) 
              Actually, "Issue Submit" is for creating a NEW issue for the line.
          */}
          {/* {isPartial && ( */}
          <Tooltip title="Issue Item" arrow>
            <IconButton
              disabled={params.data.SRClose === 'Y' || !isPending}
              size="small"
              // color="primary"
              onClick={() => handleOpenIssueDialog(params.data)}
            >
              <Iconify icon="mdi:content-save" width={20} />
            </IconButton>
          </Tooltip>
          {/* )} */}

          {/* Edit Issue (Visible if this row represents an issue or we just edit the last one? 
              Assuming rowData has IssueID if it's an issued line. 
              If the grid is flat and splits issues, then we edit that specific issue.
          */}
          {/* {hasIssue && ( */}
          <Tooltip title="Edit Issue" arrow>
            <IconButton
              disabled={params.data.SRClose === 'Y' || !params.data.IssueID}
              size="small"
              // color="warning"
              onClick={() => handleOpenIssueDialog(params.data, true)}
            >
              <Iconify icon="solar:pen-bold" width={20} />
            </IconButton>
          </Tooltip>
          {/* )} */}

          {/* Close SR (Visible if Partial) */}
          {/* {isPartial && ( */}
          <Tooltip title="Close SR Line" arrow>
            <IconButton
              disabled={params.data.SRClose === 'Y'}
              size="small"
              // color="error"
              onClick={() => handleOpenCloseSRDialog(params.data)}
            >
              <Iconify icon="mdi:close-circle" width={20} />
            </IconButton>
          </Tooltip>
          {/* )} */}

          {/* Print PDF */}
          {/* {hasIssue && ( */}
          <Tooltip title="View PDF" arrow>
            <IconButton
              disabled={!params.data.IssueID}
              onClick={() => moveToPDFView(params.data.IssueID)}
              size="small"
            // sx={{ padding: '4px' }}
            >
              <Iconify icon="mdi:file-pdf-box" width={20} />
            </IconButton>
          </Tooltip>
          {/* )} */}
        </Stack>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleOpenIssueDialog, handleOpenCloseSRDialog, moveToPDFView]
  );

  // History Column Definitions
  const historyColumnDefs = useMemo(
    () => [
      {
        field: 'UpdatedDate',
        headerName: 'Date',
        minWidth: 180,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
      },
      {
        field: 'IssueQty',
        headerName: 'Issue Qty',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        cellStyle: { textAlign: 'right' },
        valueFormatter: (params) => fNumber(params.value) || '0',
      },
      {
        field: 'RemainingQty',
        headerName: 'Remaining Qty',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        cellStyle: { textAlign: 'right' },
        valueFormatter: (params) => fNumber(params.value) || '0',
      },
    ],
    []
  );

  // Column definitions
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
        pinned: 'left',
        lockPosition: 'left',
      },
      {
        field: 'Status',
        headerName: 'Status',
        minWidth: 120,
        filter: 'agSetColumnFilter',
        cellRenderer: changeIndicatorRenderer,
      },
      {
        field: 'SourceType',
        headerName: 'Source Type',
        minWidth: 120,
        filter: 'agSetColumnFilter',
        cellRenderer: sourceTypeRenderer,
      },
      {
        field: 'IssueCode',
        headerName: 'Issue Code',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value ? params.value : '-'),
      },
      {
        field: 'ReqCode',
        headerName: 'Req Code',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value ? params.value : '-'),
      },
      {
        field: 'ReqDate',
        headerName: 'Req Date',
        minWidth: 120,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
      },
      {
        field: 'DeptName',
        headerName: 'Department',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value ? params.value : '-'),
      },
      {
        field: 'SectionName',
        headerName: 'Section',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value ? params.value : '-'),
      },
      {
        field: 'ItemDescription',
        headerName: 'Item Description',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value ? params.value : '-'),
      },
      {
        field: 'VendorName',
        headerName: 'Vendor',
        minWidth: 180,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value ? params.value : '-'),
      },
      {
        field: 'StoreName',
        headerName: 'Store',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value ? params.value : '-'),
      },
      {
        field: 'LocationName',
        headerName: 'Location',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value ? params.value : '-'),
      },
      {
        field: 'Line_No',
        headerName: 'Line No',
        minWidth: 150,
        filter: 'numericColumn',
        valueFormatter: (params) => (params.value ? fNumber(params.value) : '-'),
      },
      {
        field: 'TotalBale',
        headerName: 'Requested Bale',
        minWidth: 150,
        filter: 'numericColumn',
        valueFormatter: (params) => (params.value ? fNumber(params.value) : '-'),
      },
      {
        field: 'TotalQty',
        headerName: 'Stock Qty',
        minWidth: 100,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) =>
          `${fNumber(params.value) || 0} ${params.data.UOMName}` || `0.00 ${params.data.UOMName}`,
      },
      {
        field: 'RemainingQty',
        headerName: 'Remaining Qty',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) =>
          `${fNumber(params.value) || 0} ${params.data.UOMName}` || `0.00 ${params.data.UOMName}`,
      },
      {
        field: 'TotalRequestedQty',
        headerName: 'Requested Qty',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) =>
          `${fNumber(params.value)} ${params.data.UOMName}` || `0.00 ${params.data.UOMName}`,
      },
      {
        field: 'IssueBaleQty',
        headerName: 'Issue Bale Qty',
        minWidth: 140,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        editable: false,
        valueFormatter: (params) => (params.data.TotalBale ? fNumber(params.value) || '0' : '-'),
      },
      {
        field: 'IssueQty',
        headerName: 'Issue Qty',
        minWidth: 130,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        editable: false,
        valueFormatter: (params) =>
          `${fNumber(params.value) || 0} ${params.data.UOMName}` || `0.00 ${params.data.UOMName}`,
      },
      {
        field: 'PendingQty',
        headerName: 'Pending Qty',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) =>
          `${fNumber(params.value) || 0} ${params.data.UOMName}` || `0.00 ${params.data.UOMName}`,
      },
      {
        field: 'BagQty',
        headerName: 'Bag Qty',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        editable: false,
        valueFormatter: (params) =>
          `${fNumber(params.value) || 0} ${params.data.UOMName}` || `0.00 ${params.data.UOMName}`,
      },
      {
        field: 'IssueDate',
        headerName: 'Issue Date',
        minWidth: 120,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
      },

      {
        field: 'isApproved',
        headerName: 'Approval Status',
        minWidth: 150,
        pinned: 'left',
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
        minWidth: 180,
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
        field: 'ApproverName',
        headerName: 'Approver Name',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value ? params.value : '-'),
      },
      {
        field: 'ApprovedDate',
        headerName: 'Approval Date',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      {
        field: 'DriverName',
        headerName: 'Driver Name',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value ? params.value : '-'),
      },
      {
        field: 'VehNO',
        headerName: 'Vehicle No.',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value ? params.value : '-'),
      },
      {
        field: 'TrackingID',
        headerName: 'Lot No.',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value ? params.value : '-'),
      },
      {
        field: 'GRNNo',
        headerName: 'GRN No',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value ? params.value : '-'),
      },
      {
        field: 'GRNDate',
        headerName: 'GRN Date',
        minWidth: 120,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
      },
      {
        field: 'ChallanNo',
        headerName: 'Challan No',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value ? params.value : '-'),
      },
      {
        field: 'ChallanDate',
        headerName: 'Challan Date',
        minWidth: 120,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
      },
      {
        field: 'SRCloseDate',
        headerName: 'SR Closed On',
        minWidth: 120,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
      },
      {
        field: 'CloseByUser',
        headerName: 'SR Closed By',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value ? params.value : '-'),
      },
      {
        field: 'SRClosingReason',
        headerName: 'SR Closed Reason',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value ? params.value : '-'),
      },

      {
        field: 'Action',
        headerName: 'Actions',
        minWidth: 150,
        pinned: 'right',
        filter: false,
        cellRenderer: actionButtonsRenderer,
      },
    ],
    [actionButtonsRenderer]
  );

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  // Detail grid configuration for Issue History
  const detailCellRendererParams = useMemo(
    () => ({
      detailGridOptions: {
        columnDefs: historyColumnDefs,
        defaultColDef: {
          flex: 1,
          sortable: true,
          filter: true,
          resizable: true,
        },
        domLayout: 'autoHeight',
      },
      getDetailRowData: (params) => {
        params.successCallback(params.data.IssueHistory || []);
      },
    }),
    [historyColumnDefs]
  );

  const onFirstDataRendered = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  const getRowStyle = useCallback((params) => {
    if (params.data?.SRClose === 'Y') {
      return { backgroundColor: 'rgba(244, 67, 54, 0.1)' }; // Reddish tint
    }
    return null;
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
      {/* ... tabs and search logic ... */}

      {/* Add Dialogs at the end */}
      <ItemIssueEntryDialog
        open={dialog.value}
        onClose={handleCloseIssueDialog}
        selectedRow={selectedIssue}
        onSave={handleSaveIssue}
        isEdit={isEditMode}
      />

      <ConfirmDialog
        open={closeSRDialog.value}
        onClose={closeSRDialog.onFalse}
        title="Close SR Line"
        content={
          <Stack spacing={2}>
            <Typography>
              Are you sure you want to force close this SR line? No further issues will be allowed.
            </Typography>
            <TextField
              label="Reason"
              fullWidth
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
            />
          </Stack>
        }
        action={
          <Button variant="contained" color="error" onClick={handleConfirmCloseSR}>
            Confirm Close
          </Button>
        }
      />

      {/* Header Section with Controls */}
      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={filterTab} onChange={handleTabChange} aria-label="status filter tabs">
          <Tab
            value="All"
            label="All"
            sx={{ minWidth: 'auto' }}
            icon={
              <Label variant="filled" color="default">
                {rowData.length}
              </Label>
            }
          />
          <Tab
            value="Pending"
            label="Pending"
            sx={{ minWidth: 'auto' }}
            icon={
              <Label variant={filterTab === 'Pending' ? 'filled' : 'soft'} color="warning">
                {rowData.filter((item) => item.Status === 'Pending').length}
              </Label>
            }
          />
          <Tab
            value="Completed"
            label="Completed"
            sx={{ minWidth: 'auto' }}
            icon={
              <Label variant={filterTab === 'Completed' ? 'filled' : 'soft'} color="success">
                {rowData.filter((item) => item.Status === 'Completed').length}
              </Label>
            }
          />
        </Tabs>
      </Box>

      <Card sx={{ p: 2 }}>
        {/* Search and Zoom Controls */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Search Req Code"
              variant="outlined"
              size="small"
              value={searchParams.ReqCode}
              onChange={handleSearchChange('ReqCode')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" width={20} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Search Item"
              variant="outlined"
              size="small"
              value={searchParams.ItemDescription}
              onChange={handleSearchChange('ItemDescription')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" width={20} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Search Vendor"
              variant="outlined"
              size="small"
              value={searchParams.VendorName}
              onChange={handleSearchChange('VendorName')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" width={20} />
                  </InputAdornment>
                ),
              }}
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

        {/* Data Grid */}
        {/* <Card
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top left',
          width: `${100 / zoomLevel}%`,
          height: `${100 / zoomLevel}%`,
          padding: '12px',
          marginTop: '8px',
          overflow: 'hidden',
        }}
      > */}
        <Scrollbar>
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left',
              width: `${100 / zoomLevel}%`,
              height: `${100 / zoomLevel}%`,
              marginTop: '12px',
            }}
          >
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
              onFirstDataRendered={onFirstDataRendered}
              onCellValueChanged={handleCellValueChanged}
              getRowStyle={getRowStyle}
              masterDetail
              detailCellRendererParams={detailCellRendererParams}
            />
          </div>
        </Scrollbar>
      </Card>

      {/* </Card> */}
    </div>
  );
};

export default IssueNoteListView;
