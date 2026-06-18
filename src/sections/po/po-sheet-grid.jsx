import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get, Post } from 'src/api/apibasemethods';
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

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

const PoSheetGrid = () => {
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
  const [approvalLevel, setApprovalLevel] = useState(null);
  const [changes, setChanges] = useState([]);

  // New state for filter tabs
  const [filterTab, setFilterTab] = useState('all');

  const actionButtonsRenderer = useCallback(
    (params) => (
      <div style={{ display: 'flex', gap: '4px' }}>
        {editButtonRenderer(params)}
        {pdfButtonRenderer(params)}
      </div>
    ),
    // eslint-disable-next-line
    []
  );

  const editButtonRenderer = (params) => (
    <Tooltip title="Edit" arrow>
      <IconButton
        onClick={() => moveToEditForm(params.data.POID)}
        size="small"
        disabled={params.data.AllApproved}
        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:pen-bold" width={18} />
      </IconButton>
    </Tooltip>
  );

  const moveToEditForm = (POID) => {
    navigate(paths.dashboard.procurement.po.edit(POID));
  };
  const pdfButtonRenderer = (params) => (
    <Tooltip title="View PDF" arrow>
      <IconButton
        onClick={() => moveToPDF(params.data.POID)}
        size="small"
        // disabled={!params.data.AllApproved}
        sx={{ padding: '4px' }}
      >
        <Iconify icon="mdi:file-pdf-box" width={18} />
      </IconButton>
    </Tooltip>
  );

  const moveToPDF = (POID) => {
    navigate(paths.dashboard.procurement.po.pdf(POID));
  };

  // Fetch purchase orders
  const fetchPurchaseOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `GetPOMstDtl?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      if (response.status === 200) {
        // Get approver data
        const approverResponse = await Get(
          `getDocumentApproverByID?&ApproverID=${userData?.userDetails?.userId}&DocID=6`
        );

        let approverData = approverResponse?.data || [];
        if (approverResponse?.data?.Data) {
          approverData = approverResponse?.data?.Data || [];
        }

        // Set approval level
        if (approverData.length > 0) {
          setApprovalLevel(approverData[0].Approval_Lvl_ID);
        }

        // Format master data with status fields
        const formattedMasterData = (response.data.POMst || []).map((masterItem) => {
          const relatedDetails = response.data.PODtl.filter((d) => d.POID === masterItem.POID);

          const totalQty = relatedDetails.reduce((sum, item) => sum + item.POQTY, 0);
          const totalValue = relatedDetails.reduce(
            (sum, item) => sum + item.POQTY * item.POUNITPRICE,
            0
          );

          // Assuming all items in relatedDetails have the same UOMName
          const uomName = relatedDetails.length > 0 ? relatedDetails[0].UOMName : '';
          const currency = relatedDetails.length > 0 ? relatedDetails[0].Currency_ID : '';

          return {
            ...masterItem,
            TotalQty: `${fNumber(totalQty)} ${uomName}`,
            TotalValue: `${currency === 8 ? '৳' : '$'}${fNumber(totalValue)}`,

            AllApproved: masterItem.Level1_Approve === 'A' && masterItem.Level2_Approve === 'A',
            Status1:
              masterItem.Level1_Approve === 'A'
                ? 'Approved'
                : masterItem.Level1_Approve === 'R'
                  ? 'Rejected'
                  : 'Pending',
            Status2:
              masterItem.Level2_Approve === 'A'
                ? 'Approved'
                : masterItem.Level2_Approve === 'R'
                  ? 'Rejected'
                  : 'Pending',
            ToBeApproved:
              approverData.length > 0 &&
              (approverData[0].Approval_Lvl_ID === 1 || approverData[0].Approval_Lvl_ID === 2),
          };
        });
        setMasterData(formattedMasterData);
        setDetailData(response.data.PODtl || []);
      } else {
        setMasterData([]);
        setDetailData([]);
        enqueueSnackbar(response.data.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load purchase orders', { variant: 'error' });
      setMasterData([]);
      setDetailData([]);
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar]);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  // Prepare row data by combining master and detail data
  const rowData = useMemo(
    () =>
      masterData.map((masterItem) => ({
        ...masterItem,
        Details: detailData.filter((detailItem) => detailItem.POID === masterItem.POID),
      })),
    [masterData, detailData]
  );

  // Get counts for each tab
  const tabCounts = useMemo(() => {
    const allCount = rowData.length;
    const approvedCount = rowData.filter((item) => item.Status2 === 'Approved').length;
    const pendingCount = rowData.filter((item) => item.Status2 === 'Pending').length;
    const rejectedCount = rowData.filter((item) => item.Status2 === 'Rejected').length;

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
      data = data.filter((item) => item.Status2 === 'Approved');
    } else if (filterTab === 'pending') {
      data = data.filter((item) => item.Status2 === 'Pending');
    } else if (filterTab === 'rejected') {
      data = data.filter((item) => item.Status2 === 'Rejected');
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

  // Handle detail changes (quantity and unit price)
  const handleDetailChange = useCallback(
    (params) => {
      const { data, colDef, newValue, oldValue } = params;

      // Find the parent row (main PO)
      const parentRow = rowData.find(
        (row) => row.Details && row.Details.some((detail) => detail.PODtlID === data.PODtlID)
      );

      if (!parentRow) return;

      setChanges((prev) => {
        const existingChangeIndex = prev.findIndex((change) => change.POID === parentRow.POID);

        if (existingChangeIndex === -1) {
          // Create new change entry
          const newChange = {
            POID: parentRow.POID,
            Approve: parentRow[`Level${approvalLevel}_Approve`] || 'P',
            Remarks: parentRow[`Level${approvalLevel}_Approved_Remarks`] || '',
            Level: approvalLevel,
            ApprovedBy: userData?.userDetails?.userId,
            Details: parentRow.Details.map((item) => ({
              PODtlID: item.PODtlID,
              POQTY:
                item.PODtlID === data.PODtlID
                  ? colDef.field === 'POQTY'
                    ? newValue
                    : item.POQTY
                  : item.POQTY,
              POUNITPRICE:
                item.PODtlID === data.PODtlID
                  ? colDef.field === 'POUNITPRICE'
                    ? newValue
                    : item.POUNITPRICE
                  : item.POUNITPRICE,
            })),
          };
          return [...prev, newChange];
          // eslint-disable-next-line
        } else {
          // Update existing change
          return prev.map((change, index) => {
            if (index === existingChangeIndex) {
              return {
                ...change,
                Details: change.Details.map((item) => ({
                  ...item,
                  POQTY:
                    item.PODtlID === data.PODtlID
                      ? colDef.field === 'POQTY'
                        ? newValue
                        : item.POQTY
                      : item.POQTY,
                  POUNITPRICE:
                    item.PODtlID === data.PODtlID
                      ? colDef.field === 'POUNITPRICE'
                        ? newValue
                        : item.POUNITPRICE
                      : item.POUNITPRICE,
                })),
              };
            }
            return change;
          });
        }
      });
    },
    [rowData, approvalLevel, userData]
  );

  const handleStatusUpdate = useCallback(
    (params, level) => {
      const change = {
        POID: params.data.POID,
        Approve: params.newValue === 'Approved' ? 'A' : params.newValue === 'Rejected' ? 'R' : 'P',
        ApprovedBy: userData?.userDetails?.userId,
        Remarks: params.data[`Level${level}_Approved_Remarks`] || '',
        Level: level,
        Details:
          params.data.Details?.map((item) => ({
            PODtlID: item.PODtlID,
            POQTY: item.POQTY || 0,
            POUNITPRICE: item.POUNITPRICE || 0,
          })) || [],
      };

      setChanges((prev) => {
        const existing = prev.find((c) => c.POID === change.POID);
        if (existing) {
          // Merge with existing change, preserving Details
          return prev.map((c) =>
            c.POID === change.POID
              ? {
                  ...c,
                  Approve: change.Approve,
                  Remarks: change.Remarks,
                  Level: change.Level,
                  Details: c.Details || change.Details,
                }
              : c
          );
          // eslint-disable-next-line
        } else {
          // eslint-disable-next-line
          return [...prev, change];
        }
      });
    },
    [userData?.userDetails?.userId]
  );

  // Handle remarks updates
  const handleRemarksUpdate = useCallback((params, level) => {
    setChanges((prev) =>
      prev.map((change) => {
        if (change.POID === params.data.POID && change.Level === level) {
          return { ...change, Remarks: params.newValue };
        }
        return change;
      })
    );
  }, []);

  const handleTabChange = (event, newValue) => {
    setFilterTab(newValue);
  };

  // Submit changes to API
  const handleSubmitChanges = async () => {
    if (changes.length === 0) {
      enqueueSnackbar('No changes to submit', { variant: 'info' });
      return;
    }

    const dataToSend = changes.map((change) => ({
      ...change,
      Details: change.Details.map((detail) => ({
        // ...detail,
        PODetailID: detail?.PODtlID,
        POQty: detail?.POQTY,
        POUnitPrice: detail?.POUNITPRICE,
      })),
    }));
    try {
      setLoading(true);
      const response = await Post('UpdatePOApproval', dataToSend);

      if (response.status === 200) {
        enqueueSnackbar('Changes submitted successfully', { variant: 'success' });
        setChanges([]);
        fetchPurchaseOrders(); // Refresh data
      } else {
        throw new Error('Failed to submit changes');
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to submit changes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

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
      {
        field: 'POCODE',
        headerName: 'PO Code',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'PRCODE',
        headerName: 'Reffered PR Number',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'PODate',
        headerName: 'PO Date',
        minWidth: 150,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => fDate(new Date(params.value)),
      },
      {
        field: 'ClassName',
        headerName: 'Item Type',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'VendorName',
        headerName: 'Vendor',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      // {
      //   field: 'TotalQty',
      //   headerName: 'Total Qty',
      //   minWidth: 200,
      //   type: 'numericColumn',
      //   filter: 'agNumberColumnFilter',
      // },
      {
        field: 'TotalValue',
        headerName: 'Total Value',
        minWidth: 200,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
      },
      {
        field: 'Status1',
        headerName: 'Level 1 Approval',
        minWidth: 150,
        editable: (params) => approvalLevel === 1 && params.data.ToBeApproved,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['Approved', 'Rejected', 'Pending'],
        },
        cellStyle: (params) => {
          if (params.value === 'Pending')
            return {
              color: '#ff9800',
              fontWeight: 'bold',
              backgroundColor:
                approvalLevel === 1 && params.data.ToBeApproved ? 'rgba(99, 145, 58, 0.05)' : null,
            };
          if (params.value === 'Approved')
            return {
              color: '#4caf50',
              fontWeight: 'bold',
              backgroundColor:
                approvalLevel === 1 && params.data.ToBeApproved ? 'rgba(99, 145, 58, 0.05)' : null,
            };
          if (params.value === 'Rejected')
            return {
              color: '#f44336',
              fontWeight: 'bold',
              backgroundColor:
                approvalLevel === 1 && params.data.ToBeApproved ? 'rgba(99, 145, 58, 0.05)' : null,
            };
          return null;
        },
        onCellValueChanged: (params) => handleStatusUpdate(params, 1),
      },
      {
        field: 'Level1_Approved_Remarks',
        headerName: 'Level 1 Remarks',
        minWidth: 150,
        editable: (params) => approvalLevel === 1 && params.data.ToBeApproved,
        valueFormatter: (params) => params.value || '-',
        cellStyle: (params) =>
          approvalLevel === 1 && params.data.ToBeApproved
            ? { backgroundColor: 'rgba(99, 145, 58, 0.05)' }
            : null,
        onCellValueChanged: (params) => handleRemarksUpdate(params, 1),
        hide: true,
      },
      {
        field: 'Status2',
        headerName: 'Level 2 Approval',
        minWidth: 150,
        editable: (params) => approvalLevel === 2 && params.data.ToBeApproved,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: ['Approved', 'Rejected', 'Pending'],
        },
        cellStyle: (params) => {
          if (params.value === 'Pending')
            return {
              color: '#ff9800',
              fontWeight: 'bold',
              backgroundColor:
                approvalLevel === 2 && params.data.ToBeApproved ? 'rgba(99, 145, 58, 0.05)' : null,
            };
          if (params.value === 'Approved')
            return {
              color: '#4caf50',
              fontWeight: 'bold',
              backgroundColor:
                approvalLevel === 2 && params.data.ToBeApproved ? 'rgba(99, 145, 58, 0.05)' : null,
            };
          if (params.value === 'Rejected')
            return {
              color: '#f44336',
              fontWeight: 'bold',
              backgroundColor:
                approvalLevel === 2 && params.data.ToBeApproved ? 'rgba(99, 145, 58, 0.05)' : null,
            };
          return null;
        },
        onCellValueChanged: (params) => handleStatusUpdate(params, 2),
      },
      {
        field: 'Level2_Approved_Remarks',
        headerName: 'Level 2 Remarks',
        minWidth: 150,
        editable: (params) => approvalLevel === 2 && params.data.ToBeApproved,
        valueFormatter: (params) => params.value || '-',
        cellStyle: (params) =>
          approvalLevel === 2 && params.data.ToBeApproved
            ? { backgroundColor: 'rgba(99, 145, 58, 0.05)' }
            : null,
        onCellValueChanged: (params) => handleRemarksUpdate(params, 2),
        hide: true,
      },
      {
        field: 'Payment_Term',
        headerName: 'Payment Terms',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'MeansOfTransports',
        headerName: 'Transport',
        minWidth: 120,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Items Count',
        minWidth: 120,
        valueGetter: (params) => (params.data.Details ? params.data.Details.length : 0),
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        maxWidth: 100,
        pinned: 'right',
        sortable: false,
        filter: false,
        resizable: false,
        // suppressSizeToFit: true,
        cellRenderer: actionButtonsRenderer,
        lockPosition: 'right',
        cellStyle: { textAlign: 'center' },
      },
    ],
    [approvalLevel, handleStatusUpdate, handleRemarksUpdate, actionButtonsRenderer]
  );

  // Detail Column Definitions
  const detailColumnDefs = useMemo(
    () => [
      {
        field: 'ClassName',
        headerName: 'Item Type',
        minWidth: 130,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Inv_Cat_Name',
        headerName: 'Category',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'SubCat_Name',
        headerName: 'Sub Category',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ItemCode',
        headerName: 'Item Code',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'ItemDescription',
        headerName: 'Item Name',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'POPurchaseTypes',
        headerName: 'Purchase Type',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'POQTY',
        headerName: 'Quantity',
        minWidth: 130,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        editable: (params) => approvalLevel,
        cellStyle: (params) =>
          approvalLevel
            ? { backgroundColor: 'rgba(99, 145, 58, 0.05)', textAlign: 'right' }
            : { textAlign: 'right' },
        valueFormatter: (params) => fNumber(params.value.toFixed(2)),
        onCellValueChanged: (params) => {
          handleDetailChange(params);
        },
      },
      {
        field: 'UOMName',
        headerName: 'Unit',
        minWidth: 120,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'POUNITPRICE',
        headerName: 'Unit Price',
        minWidth: 150,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        cellStyle: (params) =>
          approvalLevel
            ? { backgroundColor: 'rgba(99, 145, 58, 0.05)', textAlign: 'right' }
            : { textAlign: 'right' },
        valueFormatter: (params) => {
          const currencySymbol = params.data?.Currency_ID === 8 ? '৳' : '$';
          return `${currencySymbol}${fNumber(params.value.toFixed(2))}`;
        },
        editable: (params) => approvalLevel,
        onCellValueChanged: (params) => {
          handleDetailChange(params);
        },
      },
      {
        field: 'Currency_Name',
        headerName: 'Currency',
        minWidth: 120,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: 'Total',
        minWidth: 150,
        valueGetter: (params) => params.data.POQTY * params.data.POUNITPRICE,
        valueFormatter: (params) => {
          const currencySymbol = params.data?.Currency_ID === 8 ? '৳' : '$';
          return `${currencySymbol}${fNumber(params.value.toFixed(2))}`;
        },
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
      },
    ],
    // eslint-disable-next-line
    [approvalLevel]
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
      getDetailRowData: (params) => params.successCallback(params.data.Details),
    }),
    [detailColumnDefs]
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

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
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
            sx={{ width: { xs: '100%', sm: '300px' } }}
          />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitChanges}
            disabled={changes.length === 0}
            startIcon={<Iconify icon="eva:save-fill" width={20} />}
            sx={{ mr: 2 }}
          >
            Submit Changes ({changes.length})
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
          </Box>
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

export default PoSheetGrid;
