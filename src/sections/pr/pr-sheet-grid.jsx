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
import { Stack, textAlign } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { paths } from 'src/routes/paths';
import { useNavigate } from 'react-router-dom';
import { fDate } from 'src/utils/format-time';
import Label from 'src/components/label';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

const PurchaseRequestGrid = () => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [zoomLevel, setZoomLevel] = useState(1);

  // State for grid data
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [approvalLevel, setApprovalLevel] = useState(null); // Track user's approval level
  const [selectedRows, setSelectedRows] = useState([]);
  const [changes, setChanges] = useState([]);

  // New state for filter tabs
  const [filterTab, setFilterTab] = useState('all');

  const navigate = useNavigate();

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
        onClick={() => moveToEditForm(params.data.PRRequestID)}
        size="small"
        disabled={params.data.AllApproved}
        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:pen-bold" width={18} />
      </IconButton>
    </Tooltip>
  );

  const moveToEditForm = (PRRequestID) => {
    navigate(paths.dashboard.procurement.pr.edit(PRRequestID));
  };
  const pdfButtonRenderer = (params) => (
    <Tooltip title="View PDF" arrow>
      <IconButton
        onClick={() => moveToPDF(params.data.PRRequestID)}
        size="small"
        // disabled={!params.data.AllApproved}
        sx={{ padding: '4px' }}
      >
        <Iconify icon="mdi:file-pdf-box" width={18} />
      </IconButton>
    </Tooltip>
  );

  const moveToPDF = (PRRequestID) => {
    navigate(paths.dashboard.procurement.pr.pdf(PRRequestID));
  };

  // Update fetchPurchaseRequests to extract approval level
  const fetchPurchaseRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `GetPurchaseRequestDetails?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      if (response.status === 200) {
        const approverResponse = await Get(
          `getDocumentApproverByID?&ApproverID=${userData?.userDetails?.userId}&DocID=5`
        );

        let approverData = approverResponse?.data || [];
        if (approverResponse?.data?.Data) {
          approverData = approverResponse?.data?.Data || [];
        }

        // Set the user's approval level
        if (approverData.length > 0) {
          setApprovalLevel(approverData[0].Approval_Lvl_ID);
        }

        const formattedData = response.data.map((item) => ({
          ...item,
          AllApproved: item.Level1_Approve === 'A' && item.Level2_Approve === 'A',
          ClassName: item.Details[0].ClassName,
          TotalValue: item.Details.reduce(
            (acc, detail) => acc + detail.PRQTY * detail.PRUnitPrice,
            0
          ),
          Status1:
            item.Level1_Approve === 'A'
              ? 'Approved'
              : item.Level1_Approve === 'R'
                ? 'Rejected'
                : 'Pending',
          Status2:
            item.Level2_Approve === 'A'
              ? 'Approved'
              : item.Level2_Approve === 'R'
                ? 'Rejected'
                : 'Pending',
          ToBeApproved:
            approverData.length > 0 &&
            (approverData[0].Approval_Lvl_ID === 1 || approverData[0].Approval_Lvl_ID === 2),
        }));

        setRowData(formattedData);
      } else {
        setRowData([]);
        enqueueSnackbar(response.data.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load purchase requests', { variant: 'error' });
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar]);

  useEffect(() => {
    fetchPurchaseRequests();
  }, [fetchPurchaseRequests]);

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

  const handleDetailChange = useCallback(
    (params) => {
      const { data, colDef, newValue, oldValue } = params;

      // Find the parent row (main purchase request)
      const parentRow = rowData.find(
        (row) => row.Details && row.Details.some((detail) => detail.PRDetailID === data.PRDetailID)
      );

      if (!parentRow) return;

      setChanges((prev) => {
        const existingChangeIndex = prev.findIndex(
          (change) => change.PRRequestID === parentRow.PRRequestID
        );

        if (existingChangeIndex === -1) {
          // Create new change entry
          const newChange = {
            PRRequestID: parentRow.PRRequestID,
            Approve: parentRow[`Level${approvalLevel}_Approve`] || 'P',
            Remarks: parentRow[`Level${approvalLevel}_Approved_Remarks`] || '',
            Level: approvalLevel,
            Details: parentRow.Details.map((item) => ({
              PRDetailID: item.PRDetailID,
              PRQTY:
                item.PRDetailID === data.PRDetailID
                  ? colDef.field === 'PRQTY'
                    ? newValue
                    : item.PRQTY
                  : item.PRQTY,
              PRUnitPrice:
                item.PRDetailID === data.PRDetailID
                  ? colDef.field === 'PRUnitPrice'
                    ? newValue
                    : item.PRUnitPrice
                  : item.PRUnitPrice,
            })),
          };
          return [...prev, newChange];
          // eslint-disable-next-line
        } else {
          // Update existing change
          return prev.map((change, index) => {
            if (index === existingChangeIndex) {
              console.log('change', change);
              return {
                ...change,
                Details: change.Details.map((item) => ({
                  ...item,
                  PRQTY:
                    item.PRDetailID === data.PRDetailID
                      ? colDef.field === 'PRQTY'
                        ? newValue
                        : item.PRQTY
                      : item.PRQTY,
                  PRUnitPrice:
                    item.PRDetailID === data.PRDetailID
                      ? colDef.field === 'PRUnitPrice'
                        ? newValue
                        : item.PRUnitPrice
                      : item.PRUnitPrice,
                })),
              };
            }
            return change;
          });
        }
      });
    },
    [rowData, approvalLevel]
  );

  const handleSubmitChanges = async () => {
    if (changes.length === 0) {
      enqueueSnackbar('No changes to submit', { variant: 'info' });
      return;
    }

    try {
      setLoading(true);

      // Format the changes for API
      const payload = changes.map((change) => ({
        PRRequestID: change.PRRequestID,
        Approve: change.Approve,
        Remarks: change.Remarks,
        Level: change.Level,
        ApprovedBy: userData?.userDetails?.userId,
        Details:
          change.Details.map((x) => ({
            PRDetailID: x?.PRDetailID,
            PRUnitPrice: x?.PRUnitPrice,
            PRQty: x?.PRQTY,
          })) || [],
      }));

      const response = await Post('UpdatePRApproval', payload);

      if (response.status === 200) {
        enqueueSnackbar('Changes submitted successfully', { variant: 'success' });
        setChanges([]);
        fetchPurchaseRequests(); // Refresh data
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

  const onRowSelected = (event) => {
    if (event.node.isSelected()) {
      setSelectedRows((prev) => [...prev, event.data]);
    } else {
      setSelectedRows((prev) => prev.filter((row) => row.PRRequestID !== event.data.PRRequestID));
    }
  };

  const handleTabChange = (event, newValue) => {
    setFilterTab(newValue);
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
        field: 'PRCode',
        headerName: 'PR Code',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'PreparedByName',
        headerName: 'Created By',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'PRRequestDate',
        headerName: 'Request Date',
        minWidth: 150,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => fDate(new Date(params.value)),
      },
      {
        field: 'ClassName',
        headerName: 'Item Type',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'TotalValue',
        headerName: 'Total Value',
        minWidth: 150,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => {
          const currencySymbol = params.data.Details[0]?.Currency_ID === 8 ? '৳' : '$';
          return `${currencySymbol}${fNumber(params.value)}`;
        },
      },
      {
        field: 'PurchaseType',
        headerName: 'Purchase Type',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Status1',
        headerName: 'Approval Level 1',
        minWidth: 150,
        filter: 'agTextColumnFilter',
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
        // In masterColumnDefs, update the onCellValueChanged for Status1 and Status2:
        onCellValueChanged: (params) => {
          const change = {
            PRRequestID: params.data.PRRequestID,
            Approve:
              params.newValue === 'Approved' ? 'A' : params.newValue === 'Rejected' ? 'R' : 'P',
            Remarks: params.data[`Level${approvalLevel}_Approved_Remarks`] || '',
            Level: approvalLevel,
            Details:
              params.data.Details?.map((item) => ({
                PRDetailID: item.PRDetailID,
                PRQTY: item.PRQTY || 0,
                PRUnitPrice: item.PRUnitPrice || 0,
              })) || [], // Add fallback empty array
          };

          setChanges((prev) => {
            const existing = prev.find((c) => c.PRRequestID === change.PRRequestID);
            if (existing) {
              // Merge with existing change, preserving Details if they exist
              return prev.map((c) =>
                c.PRRequestID === change.PRRequestID
                  ? {
                      ...c,
                      Approve: change.Approve,
                      Remarks: change.Remarks,
                      Level: change.Level,
                      // Preserve existing Details if they exist, otherwise use new ones
                      Details: c.Details || change.Details,
                    }
                  : c
              );
              // eslint-disable-next-line
            } else {
              return [...prev, change];
            }
          });
        },
      },
      {
        field: 'Status2',
        headerName: 'Approval Level 2',
        minWidth: 150,
        filter: 'agTextColumnFilter',
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
        // In masterColumnDefs, update the onCellValueChanged for Status1 and Status2:
        onCellValueChanged: (params) => {
          const change = {
            PRRequestID: params.data.PRRequestID,
            Approve:
              params.newValue === 'Approved' ? 'A' : params.newValue === 'Rejected' ? 'R' : 'P',
            Remarks: params.data[`Level${approvalLevel}_Approved_Remarks`] || '',
            Level: approvalLevel,
            Details:
              params.data.Details?.map((item) => ({
                PRDetailID: item.PRDetailID,
                PRQTY: item.PRQTY || 0,
                PRUnitPrice: item.PRUnitPrice || 0,
              })) || [], // Add fallback empty array
          };

          setChanges((prev) => {
            const existing = prev.find((c) => c.PRRequestID === change.PRRequestID);
            if (existing) {
              // Merge with existing change, preserving Details if they exist
              return prev.map((c) =>
                c.PRRequestID === change.PRRequestID
                  ? {
                      ...c,
                      Approve: change.Approve,
                      Remarks: change.Remarks,
                      Level: change.Level,
                      // Preserve existing Details if they exist, otherwise use new ones
                      Details: c.Details || change.Details,
                    }
                  : c
              );
              // eslint-disable-next-line
            } else {
              return [...prev, change];
            }
          });
        },
      },
      {
        headerName: 'Items Count',
        minWidth: 120,
        valueGetter: (params) => (params.data.Details ? params.data.Details.length : 0),
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'isPOdone',
        headerName: 'PO Converted',
        minWidth: 120,
        valueGetter: (params) => (params.data.isPOdone ? 'Yes' : 'No'),
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
    [approvalLevel, actionButtonsRenderer]
  );

  // Detail Column Definitions
  const detailColumnDefs = useMemo(
    () => [
      {
        field: 'Inv_Cat_Name',
        headerName: 'Category',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'SubCat_Name',
        headerName: 'Sub Category',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'Itemcode',
        headerName: 'Item Code',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'PRItemDescription',
        headerName: 'Item Name',
        minWidth: 250,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'PRQTY',
        headerName: 'Quantity',
        minWidth: 130,
        type: 'numericColumn',
        editable: (params) => approvalLevel,
        cellStyle: (params) =>
          approvalLevel
            ? { backgroundColor: 'rgba(99, 145, 58, 0.05)', textAlign: 'right' }
            : { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '-',
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
        field: 'PRUnitPrice',
        headerName: 'Unit Price',
        minWidth: 150,
        type: 'numericColumn',
        editable: (params) => approvalLevel,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => {
          const currencySymbol = params.data?.Currency_ID === 8 ? '৳' : '$';
          return `${currencySymbol}${fNumber(params.value.toFixed(2))}`;
        },
        cellStyle: (params) =>
          approvalLevel
            ? { backgroundColor: 'rgba(99, 145, 58, 0.05)', textAlign: 'right' }
            : { textAlign: 'right' },
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
        field: 'CurrConsumedAmt',
        headerName: 'Consumed Amount in BDT',
        minWidth: 150,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => {
          const currencySymbol = params.data?.Currency_ID === 8 ? '৳' : '$';
          return `${currencySymbol}${fNumber(params.value.toFixed(2))}`;
        },
        cellStyle: { textAlign: 'right' },
      },
      {
        headerName: 'Total',
        minWidth: 150,
        valueGetter: (params) => params.data.PRQTY * params.data.PRUnitPrice,
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
      getDetailRowData: (params) => {
        params.successCallback(params.data.Details);
      },
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
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
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
              rowSelection="multiple"
              onRowSelected={onRowSelected}
              suppressRowClickSelection
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
              domLayout="autoHeight"
            />
          </div>
        </Scrollbar>
      </Box>
    </Box>
  );
};

export default PurchaseRequestGrid;
