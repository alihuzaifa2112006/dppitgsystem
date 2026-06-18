import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import {
  Box,
  Card,
  TextField,
  InputAdornment,
  Tooltip,
  IconButton,
  Stack,
  Tabs,
  Tab,
  alpha,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import LoadingButton from '@mui/lab/LoadingButton';
import { LoadingScreen } from 'src/components/loading-screen';
import Iconify from 'src/components/iconify';
import { Get, Post, Delete, Put } from 'src/api/apibasemethods';
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';
import Label from 'src/components/label';
import UploadExcelDialog from './excel-import-dialog';
import PropTypes from 'prop-types';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { enqueueSnackbar } from 'notistack';
import { paths } from 'src/routes/paths';
import { useNavigate } from 'react-router';
import { fDate, fDateTime } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

const getStatusColor = (status) => {
  const colorMap = {
    'LC Not Generated': 'error',
    'LC Generated': 'primary',
    'LC Pending': 'warning',
    'LC Approved': 'success',
    true: 'success',
    false: 'warning',
    // Add more mappings as needed
  };

  return colorMap[status] || 'default';
};

const ItemListView = ({ uploadOpen, uploadClose, data }) => {
  const gridRef = useRef();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const confirm = useBoolean();
  const warningDialog = useBoolean();
  const deleteConfirm = useBoolean();
  const bottleneckDialog = useBoolean();
  const historyDialog = useBoolean();
  const [selectedRowForDelete, setSelectedRowForDelete] = useState(null);
  const [selectedRowForBottleneck, setSelectedRowForBottleneck] = useState(null);
  const [selectedRowForHistory, setSelectedRowForHistory] = useState(null);
  const [bottleneckHistory, setBottleneckHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [bottleneckTypes, setBottleneckTypes] = useState([]);
  const [selectedBottleneckType, setSelectedBottleneckType] = useState(null);
  const [bottleneckDescription, setBottleneckDescription] = useState('');
  const [bottleneckDate, setBottleneckDate] = useState(new Date());
  const directPurchaseDialog = useBoolean();
  const [selectedRowForDirectPurchase, setSelectedRowForDirectPurchase] = useState(null);
  const [directPurchaseDate, setDirectPurchaseDate] = useState(new Date());
  const [directPurchaseReason, setDirectPurchaseReason] = useState('');
  const navigate = useNavigate();

  const settings = useSettingsContext();
  const [rowData, setRowData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [PIDateFrom, setPIDateFrom] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [PIDateTo, setPIDateTo] = useState(new Date());
  const [filters, setFilters] = useState({
    status: 'all',
  });

  // Tabs: All Buckets | All Plans
  const bucketTabOptions = useMemo(
    () => [
      { value: 'all', label: 'All Buckets', color: 'default' },
      { value: 'plans', label: 'All Plans', color: 'info' },
    ],
    []
  );

  // All Plans tab: separate API and grid
  const plansGridRef = useRef();
  const [plansData, setPlansData] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);

  // View Plan dialog: open plan details in dialog with tabs (excel-like grids)
  const [viewPlanDialogOpen, setViewPlanDialogOpen] = useState(false);
  const [selectedPlanForView, setSelectedPlanForView] = useState(null);
  const [viewPlanDialogTab, setViewPlanDialogTab] = useState(0);

  const openViewPlanDialog = useCallback((planRow) => {
    setSelectedPlanForView(planRow);
    setViewPlanDialogTab(0);
    setViewPlanDialogOpen(true);
  }, []);

  const closeViewPlanDialog = useCallback(() => {
    setViewPlanDialogOpen(false);
    setSelectedPlanForView(null);
  }, []);

  const fetchPlansData = useCallback(async () => {
    try {
      setPlansLoading(true);
      const response = await Get('GetALLProductionPlans');
      if (response?.status === 200 && response?.data?.status) {
        setPlansData(Array.isArray(response.data.Data) ? response.data.Data : []);
      } else {
        setPlansData([]);
      }
    } catch (error) {
      console.error('Failed to fetch production plans:', error);
      setPlansData([]);
      enqueueSnackbar('Failed to load production plans', { variant: 'error' });
    } finally {
      setPlansLoading(false);
    }
    // eslint-disable-next-line 
  }, []);

  useEffect(() => {
    if (filters.status === 'plans') {
      fetchPlansData();
    }
  }, [filters.status, fetchPlansData]);



  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await Get('GetAllBucketsWithDetails');

      if (response.status === 200) {
        const { Master = [], Details = [] } = response.data || {};
        const detailsByBucketId = (Details || []).reduce((acc, d) => {
          const list = acc[d.BUCKETID] || [];
          list.push({
            ...d,
            PIDate: d.PIDATE,
            PDORequired: d.REQUIREMENTINKG,
            STOCK_AVAILABLE_IN_KG: d.STOCKAVAILABLEINKG,
            AvailableStockForPDO: d.STOCKAVAILABLESTATUS === 'Y' ? 'Available' : 'Not Available',
            RemainingStockAfterDeptReq: d.STOCKAVAILABLEAFTERDPTREQ,
            StockAvailableStsafterdeptreq: d.STOCKAVAILABLESTATUSAFTERDPTREQ === 'Y' ? 'Available' : 'Not Available',
            Quantity: d.Quantity ?? d.QUANTITY,
          });
          acc[d.BUCKETID] = list;
          return acc;
        }, {});

        const masterRows = (Master || []).map((m) => ({
          ...m,
          Details: detailsByBucketId[m.BUCKETID] || [],
        }));
        setRowData(masterRows);
        setFilteredData(masterRows);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch bottleneck types
  const fetchBottleneckTypes = useCallback(async () => {
    try {
      const response = await Get(
        `BN/GetAll?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      if (response.status === 200 && response.data?.Success) {
        setBottleneckTypes(response.data.Data || []);
      }
    } catch (error) {
      console.error('Failed to fetch bottleneck types:', error);
      enqueueSnackbar('Failed to load bottleneck types', { variant: 'error' });
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // Load bottleneck types when dialog opens
  useEffect(() => {
    if (bottleneckDialog.value) {
      fetchBottleneckTypes();
    }
  }, [bottleneckDialog.value, fetchBottleneckTypes]);

  // Populate bottleneck dialog fields if row has BNID
  useEffect(() => {
    if (
      bottleneckDialog.value &&
      selectedRowForBottleneck?.BNID &&
      bottleneckTypes.length > 0
    ) {
      // Find the matching bottleneck type
      const matchingType = bottleneckTypes.find(
        (type) => type.BNID === selectedRowForBottleneck.BNID
      );

      if (matchingType) {
        setSelectedBottleneckType(matchingType);
      }

      // Set description from BNReason
      if (selectedRowForBottleneck.BNReason) {
        setBottleneckDescription(selectedRowForBottleneck.BNReason);
      }

      // Set date from BNDeliveryDate
      if (selectedRowForBottleneck.BNDeliveryDate) {
        setBottleneckDate(new Date(selectedRowForBottleneck.BNDeliveryDate));
      }
    } else if (bottleneckDialog.value && !selectedRowForBottleneck?.BNID) {
      // Reset fields if no BNID
      setSelectedBottleneckType(null);
      setBottleneckDescription('');
      setBottleneckDate(new Date());
    }
  }, [
    bottleneckDialog.value,
    selectedRowForBottleneck,
    bottleneckTypes,
  ]);

  // Fetch bottleneck history
  const fetchBottleneckHistory = useCallback(async (pirfpId) => {
    if (!pirfpId) return;

    try {
      setIsLoadingHistory(true);
      const response = await Get(`PIRFP/GetBottleNeckHistory/${pirfpId}`);

      if (response.status === 200 && response.data?.Success) {
        setBottleneckHistory(response.data.Data || []);
      } else {
        setBottleneckHistory([]);
        enqueueSnackbar('Failed to load bottleneck history', { variant: 'error' });
      }
    } catch (error) {
      console.error('Failed to fetch bottleneck history:', error);
      setBottleneckHistory([]);
      enqueueSnackbar('Failed to load bottleneck history', { variant: 'error' });
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Delete handler for reverting Ready for Production
  const handleDeletePIRFP = useCallback(async () => {
    if (!selectedRowForDelete) return;

    try {
      const pirfpId = selectedRowForDelete.PIRFPID;

      if (!pirfpId) {
        enqueueSnackbar('PIRFP ID not found', { variant: 'error' });
        return;
      }

      const response = await Delete(`DeletePIRFPID/${pirfpId}`);

      if (response.status === 200) {
        enqueueSnackbar(response.data?.Message || 'Reverted successfully', {
          variant: 'success',
        });
        fetchData(); // Refresh data
      } else {
        enqueueSnackbar(response.data?.Message || 'Failed to revert', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error reverting PIRFPID:', error);
      enqueueSnackbar(error?.response?.data?.Message || 'Failed to revert', {
        variant: 'error',
      });
    } finally {
      deleteConfirm.onFalse();
      setSelectedRowForDelete(null);
    }
    // eslint-disable-next-line
  }, [selectedRowForDelete, enqueueSnackbar, fetchData, deleteConfirm]);

  // Revert action renderer
  const revertActionRenderer = useCallback(
    // eslint-disable-next-line
    (params) => {
      // Pending items - Show Direct Purchase button
      if (params.data?.PIRFPStatus === false && params.data?.DPSTATUS === null) {
        return (
          <Tooltip title="Direct Purchase" arrow>
            <IconButton
              color="success"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRowForDirectPurchase(params.data);
                directPurchaseDialog.onTrue();
              }}
            >
              <Iconify icon="mdi:cart-outline" width={18} />
            </IconButton>
          </Tooltip>
        );
      }

      // Only show revert button if PIRFPStatus is true (confirmed)
      if (params.data?.PIRFPStatusTab === 'confirmed') {
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Revert" arrow>
              <IconButton
                color="error"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRowForDelete(params.data);
                  deleteConfirm.onTrue();
                }}
              >
                <Iconify icon="mage:refresh-reverse" width={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Bottleneck" arrow>
              <IconButton
                color="warning"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRowForBottleneck(params.data);
                  bottleneckDialog.onTrue();
                }}
              >
                <Iconify icon="mdi:alert-circle" width={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Bottleneck History" arrow>
              <IconButton
                color="info"
                size="small"
                disabled={params.data?.BNID === null}
                onClick={async (e) => {
                  e.stopPropagation();
                  setSelectedRowForHistory(params.data);
                  await fetchBottleneckHistory(params.data?.PIRFPID);
                  historyDialog.onTrue();
                }}
              >
                <Iconify icon="mdi:history" width={18} />
              </IconButton>
            </Tooltip>
          </Box>
        )
      }
    },
    [deleteConfirm, bottleneckDialog, historyDialog, fetchBottleneckHistory, directPurchaseDialog]
  );

  // Bottleneck action renderer
  // const bottleneckActionRenderer = useCallback(
  //   (params) => {
  //     // Only show bottleneck button if PIRFPStatus is true (confirmed)
  //     if (params.data?.PIRFPStatus !== true) {
  //       return null;
  //     }

  //     return (

  //     );
  //   },
  //   [bottleneckDialog]
  // );

  // Check if row is selectable (pending items for Save; all rows when on MRP tab for Create Bucket)
  const isRowSelectable = useCallback(
    (params) => params.data?.PIRFPStatusTab === 'pending' || filters.status === 'mrp',
    [filters.status]
  );

  // Highlight rows with BNID in orange
  const getRowStyle = useCallback((params) => {
    if (params.data?.BNID) {
      return {
        backgroundColor: 'rgba(255, 165, 0, 0.1)', // Orange hue with transparency
      };
    }
    return null;
  }, []);

  // Create AI Plan: per-row → show confirmation, then call generateAIPlanbyBuckandCrID
  const createAIPlanConfirm = useBoolean();
  const [bucketRowForPlan, setBucketRowForPlan] = useState(null);
  const [generateAIPlanLoading, setGenerateAIPlanLoading] = useState(false);

  const handleCreateBucketClick = useCallback((rwData) => {
    setBucketRowForPlan(rwData);
    createAIPlanConfirm.onTrue();
  }, [createAIPlanConfirm]);

  const handleGenerateAIPlanConfirm = useCallback(async () => {
    if (!bucketRowForPlan?.BUCKETID) return;
    setGenerateAIPlanLoading(true);
    createAIPlanConfirm.onFalse(); // close dialog so Lottie overlay is visible
    try {
      const response = await Get(
        `generateAIPlanbyBuckandCrID?bucket_id=${bucketRowForPlan.BUCKETID}&createdby_id=${userData?.userDetails?.userId ?? 0}`
      );
      if (response?.data?.Data.Status === "Success" || response?.data?.Data.Status === "Sucess") {
        enqueueSnackbar(response?.data?.Message ?? 'AI Plan generated successfully.', { variant: 'success' });
        createAIPlanConfirm.onFalse();
        setBucketRowForPlan(null);
        fetchData();
        setFilters((prev) => ({ ...prev, status: 'plans' }));
        // if (filters.status === 'plans') fetchPlansData();
      } else {
        enqueueSnackbar(response?.data?.Message ?? 'Failed to generate AI Plan', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error generating AI Plan:', error);
      enqueueSnackbar(error?.response?.data?.message ?? 'Error generating AI Plan', { variant: 'error' });
    } finally {
      setGenerateAIPlanLoading(false);
    }
    // eslint-disable-next-line
  }, [bucketRowForPlan, userData?.userDetails?.userId, createAIPlanConfirm, fetchData, fetchPlansData, filters.status]);


  // Master grid: bucket rows (expandable to show details)
  const masterColumnDefs = useMemo(
    () => [
      {
        field: 'expand',
        headerName: '',
        maxWidth: 50,
        minWidth: 50,
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: { suppressCount: true },
        sortable: false,
        filter: false,
        resizable: false,
        pinned: 'left',
        lockPosition: 'left',
      },
      { field: 'BUCKETCODE', headerName: 'Bucket Code', minWidth: 120, filter: 'agTextColumnFilter' },
      { field: 'BUCKETNAME', headerName: 'Bucket Name', minWidth: 220, filter: 'agTextColumnFilter' },
      {
        field: 'FROMDATE',
        headerName: 'From Date',
        minWidth: 120,
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      {
        field: 'TODATE',
        headerName: 'To Date',
        minWidth: 120,
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      {
        headerName: 'Lines',
        minWidth: 80,
        valueGetter: (params) => (params.data?.Details ? params.data.Details.length : 0),
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
      },
      {
        headerName: '',
        minWidth: 140,
        maxWidth: 160,
        sortable: false,
        filter: false,
        resizable: false,
        pinned: 'right',
        lockPosition: 'right',
        cellRenderer: (params) => (
          <Tooltip title="Generate AI Plan" arrow>
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="si:ai-fill" width={18} />}
              onClick={(e) => {
                e.stopPropagation();
                handleCreateBucketClick(params.data);
              }}
            >
              Generate Plan
            </Button>
          </Tooltip>
        ),
      },
    ],
    [handleCreateBucketClick]
  );

  // Detail grid: lines inside each bucket (updated API field names)
  const detailColumnDefs = useMemo(
    () => [
      { field: 'PINo', headerName: 'PI No.', minWidth: 160, filter: 'agTextColumnFilter' },
      {
        field: 'PIDATE',
        headerName: 'PI Date',
        minWidth: 110,
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      { field: 'MRPNo', headerName: 'MRP No.', minWidth: 160, filter: 'agTextColumnFilter' },
      {
        field: 'MRPDATE',
        headerName: 'MRP Date',
        minWidth: 110,
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      {
        field: 'Required_Item_Description',
        headerName: 'Required Item',
        minWidth: 280,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'REQUIREMENTINKG',
        headerName: 'Requirement in KG',
        minWidth: 130,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) ?? '-',
      },
      {
        field: 'STOCKAVAILABLEINKG',
        headerName: 'Stock Available in KG',
        minWidth: 150,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) ?? '-',
      },
      {
        field: 'AvailableStockForPDO',
        headerName: 'Stock Available',
        minWidth: 120,
        valueFormatter: (params) => params.value || '-',
        cellStyle: (params) => (params.value === 'Available' ? { color: 'green' } : { color: 'red' }),
      },
      {
        field: 'STOCKAVAILABLEAFTERDPTREQ',
        headerName: 'Stock After Dept Req',
        minWidth: 140,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) ?? '-',
      },
      {
        field: 'StockAvailableStsafterdeptreq',
        headerName: 'Status After Dept Req',
        minWidth: 140,
        valueFormatter: (params) => params.value || '-',
        cellStyle: (params) => (params.value === 'Available' ? { color: 'green' } : { color: 'red' }),
      },
      { field: 'Customer', headerName: 'Customer', minWidth: 180, filter: 'agTextColumnFilter' },
      { field: 'Main Buyer', headerName: 'Main Buyer', minWidth: 150, filter: 'agTextColumnFilter' },
      { field: 'ColorName', headerName: 'Color', minWidth: 120, filter: 'agTextColumnFilter' },
      { field: 'COLORCODE', headerName: 'Color & Code', minWidth: 100, filter: 'agTextColumnFilter' },
      {
        field: 'Quantity',
        headerName: 'Quantity',
        minWidth: 100,
        type: 'numericColumn',
        valueFormatter: (params) => (params.value != null ? Number(params.value).toFixed(2) : '-'),
      },
      {
        field: 'Customer requested Delivery Date',
        headerName: 'Delivery Date',
        minWidth: 120,
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      { field: 'Payment_Term', headerName: 'Payment Term', minWidth: 130, filter: 'agTextColumnFilter' },
      {
        field: 'Key Account Manager KAM',
        headerName: 'KAM',
        minWidth: 180,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
    ],
    []
  );

  const detailCellRendererParams = useMemo(
    () => ({
      detailGridOptions: {
        columnDefs: detailColumnDefs,
        defaultColDef: {
          sortable: true,
          filter: true,
          resizable: true,
        },
        domLayout: 'autoHeight',
      },
      getDetailRowData: (params) => params.successCallback(params.data?.Details ?? []),
    }),
    [detailColumnDefs]
  );

  // --- All Plans tab: columns (no master/detail; view plan via dialog) ---
  const plansMasterColumnDefs = useMemo(
    () => [
      { field: 'PlanNo', headerName: 'Plan No.', minWidth: 120, filter: 'agTextColumnFilter' },
      {
        field: 'PlanningDate',
        headerName: 'Planning Date',
        minWidth: 150,
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      { field: 'BUCKETCODE', headerName: 'Bucket Code', minWidth: 100, filter: 'agTextColumnFilter' },
      { field: 'BUCKETNAME', headerName: 'Bucket Name', minWidth: 200, filter: 'agTextColumnFilter' },
      {
        field: 'FROMDATE',
        headerName: 'From Date',
        minWidth: 110,
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      {
        field: 'TODATE',
        headerName: 'To Date',
        minWidth: 110,
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      {
        field: 'BucketCreatedDate',
        headerName: 'Bucket Created',
        minWidth: 120,
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      {
        headerName: '',
        minWidth: 90,
        maxWidth: 100,
        sortable: false,
        filter: false,
        resizable: false,
        pinned: 'right',
        lockPosition: 'right',
        cellRenderer: (params) => (
          <Tooltip title="View" arrow>
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                openViewPlanDialog(params.data);
              }}
            >
              <Iconify icon="solar:eye-bold" width={20} />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [openViewPlanDialog]
  );

  const productionScheduleColumnDefs = useMemo(
    () => [
      { field: 'lot_no', headerName: 'Lot No.', minWidth: 180, filter: 'agTextColumnFilter' },
      // { field: 'orders', headerName: 'Order', minWidth: 160, filter: 'agTextColumnFilter' },
      { field: 'line', headerName: 'Line', minWidth: 120, filter: 'agTextColumnFilter' },
      { field: 'date', headerName: 'Date', minWidth: 110, valueFormatter: (p) => (p.value ? fDate(p.value) : '-') },
      { field: 'shift', headerName: 'Shift', minWidth: 80, filter: 'agTextColumnFilter' },
      {
        field: 'allocated_kg',
        headerName: 'Qty to Produce (KG)',
        minWidth: 110,
        type: 'numericColumn',
        valueFormatter: (p) => (p.value != null ? fNumber(p.value) : '-'),
      },
      { field: 'start_dt', headerName: 'Start DateTime', minWidth: 120, valueFormatter: (p) => (p.value ? fDateTime(p.value, 'dd/MM/yyyy HH:mm') : '-') },
      { field: 'end_dt', headerName: 'End DateTime', minWidth: 120, valueFormatter: (p) => (p.value ? fDateTime(p.value, 'dd/MM/yyyy HH:mm') : '-') },
      { field: 'Color_and_Code', headerName: 'Color & Code', minWidth: 100 },
      { field: 'color_family', headerName: 'Color Family', minWidth: 100 },
      { field: 'display_count', headerName: 'Count', minWidth: 80 },
      { field: 'blend', headerName: 'Composition', minWidth: 200, filter: 'agTextColumnFilter' },
      { field: 'yarn_type', headerName: 'Yarn Type', minWidth: 100 },
      {
        field: 'no_of_hours',
        headerName: 'No. ofHours',
        minWidth: 90,
        type: 'numericColumn',
        valueFormatter: (p) => (p.value != null ? fNumber(p.value) : '-'),
      },
    ],
    []
  );

  const lotSummaryColumnDefs = useMemo(
    () => [
      { field: 'lot_no', headerName: 'Lot No.', minWidth: 180, filter: 'agTextColumnFilter' },
      // { field: 'orders', headerName: 'Order', minWidth: 160, filter: 'agTextColumnFilter' },
      { field: 'count', headerName: 'Count', minWidth: 80 },
      { field: 'blend', headerName: 'Composition', minWidth: 220, filter: 'agTextColumnFilter' },
      { field: 'yarn_type', headerName: 'Yarn Type', minWidth: 100 },
      { field: 'Color_and_Code', headerName: 'Color & Code', minWidth: 100 },
      { field: 'color_family', headerName: 'Color Family', minWidth: 100 },
      {
        field: 'total_qty',
        headerName: 'Total Qty (KG)',
        minWidth: 100,
        type: 'numericColumn',
        valueFormatter: (p) => (p.value != null ? fNumber(p.value) : '-'),
      },
      {
        field: 'hours_taken',
        headerName: 'Hours Taken',
        minWidth: 90,
        type: 'numericColumn',
        valueFormatter: (p) => (p.value != null ? fNumber(p.value) : '-'),
      },
      { field: 'completion_dt', headerName: 'Completion DateTime', minWidth: 130, valueFormatter: (p) => (p.value ? fDateTime(p.value, 'dd/MM/yyyy HH:mm') : '-') },
    ],
    []
  );

  const lotDistributionColumnDefs = useMemo(
    () => [
      { field: 'lot_no', headerName: 'Lot No.', minWidth: 180, filter: 'agTextColumnFilter' },
      { field: 'sublot_no', headerName: 'Sub-Lot No', minWidth: 180, filter: 'agTextColumnFilter' },
      // { field: 'PI_NO', headerName: 'PI No.', minWidth: 160, filter: 'agTextColumnFilter' },
      { field: 'CustomerName', headerName: 'Customer Name', minWidth: 180, filter: 'agTextColumnFilter' },
      { field: 'MainBuyer', headerName: 'Buyer Name', minWidth: 120, filter: 'agTextColumnFilter' },
      { field: 'count_display', headerName: 'Yarn Count', minWidth: 80 },
      { field: 'blend', headerName: 'Composition', minWidth: 200, filter: 'agTextColumnFilter' },
      { field: 'yarn_type', headerName: 'Yarn Type', minWidth: 100 },
      { field: 'Color_and_Code', headerName: 'Color & Code', minWidth: 90 },
      { field: 'color_family', headerName: 'Color Family', minWidth: 90 },
      // { field: 'KAM', headerName: 'KAM', minWidth: 160, filter: 'agTextColumnFilter' },
      // {
      //   field: 'Quantity',
      //   headerName: 'Quantity',
      //   minWidth: 90,
      //   type: 'numericColumn',
      //   valueFormatter: (p) => (p.value != null ? fNumber(p.value) : '-'),
      // },
      {
        field: 'required_qty',
        headerName: 'Required Qty (KG)',
        minWidth: 100,
        type: 'numericColumn',
        valueFormatter: (p) => (p.value != null ? fNumber(p.value) : '-'),
      },
      {
        field: 'calculated_hours',
        headerName: 'Calculated Hours',
        minWidth: 90,
        type: 'numericColumn',
        valueFormatter: (p) => (p.value != null ? fNumber(p.value) : '-'),
      },
    ],
    []
  );

  // Fetch data
  const formatDateForApi = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // All buckets shown (no status filter)
  useEffect(() => {
    setFilteredData(rowData);
  }, [rowData]);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      suppressMovable: false,
    }),
    []
  );

  const onFirstDataRendered = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  const handleFilterStatus = useCallback((event, newValue) => {
    setFilters((prev) => ({ ...prev, status: newValue }));
  }, []);

  // Handle row selection
  const onSelectionChanged = useCallback((params) => {
    const selected = params.api.getSelectedRows();
    setSelectedRows(selected);
  }, []);

  // Handle date change with validation
  const handleDateFromChange = (newValue) => {
    if (PIDateTo && newValue > PIDateTo) {
      enqueueSnackbar('PI Date From cannot be greater than PI Date To', { variant: 'warning' });
      return;
    }
    setPIDateFrom(newValue);
  };

  const handleDateToChange = (newValue) => {
    if (PIDateFrom && newValue < PIDateFrom) {
      enqueueSnackbar('PI Date To cannot be less than PI Date From', { variant: 'warning' });
      return;
    }
    setPIDateTo(newValue);
  };

  // Check for LC status warnings in selected rows
  const lcStatusWarnings = useMemo(() => {
    if (selectedRows.length === 0) return { lcPending: 0, lcNotGenerated: 0 };

    const lcPending = selectedRows.filter(
      (row) => row.Commercial_Dept_Status === 'LC Pending'
    ).length;

    const lcNotGenerated = selectedRows.filter(
      (row) => row.Commercial_Dept_Status === 'LC Not Generated'
    ).length;

    return { lcPending, lcNotGenerated };
  }, [selectedRows]);

  // Handle bulk save for Ready For Production
  const handleBulkReadyForProduction = async () => {
    if (selectedRows.length === 0) {
      enqueueSnackbar('No rows selected.', { variant: 'error' });
      return;
    }

    const payload = {
      Items: selectedRows.map((row) => ({
        PIID: row.PIID,
        PIDtlID: row.PIDtlID,
        ConfirmedOn: new Date().toISOString().split('T')[0],
        ConfirmedBy: userData?.userDetails?.userId,
        BreakdownID: row.BreakdownID,
        ExportLCID: row.ExportLCID,
      })),
    };

    try {
      const response = await Post('PIReadyForProduction/AddBulk', payload);

      if (response.status === 200) {
        enqueueSnackbar(
          `${selectedRows.length} item(s) marked as Ready for Production successfully!`,
          { variant: 'success' }
        );
        setSelectedRows([]);
        fetchData();
      } else {
        enqueueSnackbar('Failed to mark as Ready for Production', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error marking Ready for Production:', error);
      enqueueSnackbar(error.response?.data || 'Error marking Ready for Production', {
        variant: 'error',
      });
    }
  };

  // Handle save button click - show warning first if needed
  const handleSaveClick = () => {
    if (selectedRows.length === 0) {
      enqueueSnackbar('No rows selected.', { variant: 'error' });
      return;
    }

    // Show warning dialog if there are LC Pending or LC Not Generated items
    if (lcStatusWarnings.lcPending > 0 || lcStatusWarnings.lcNotGenerated > 0) {
      warningDialog.onTrue();
    } else {
      // No warnings, proceed directly to confirm dialog
      confirm.onTrue();
    }
  };


  return (
    <Card sx={{ p: 2 }}>
      {/* <Stack
        spacing={2}
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box/>
         <Tooltip title="Filter by PI Date Range" arrow placement="top-start">
          <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
            <DesktopDatePicker
              label="PI Date From"
              variant="outlined"
              value={PIDateFrom}
              format="dd MMM yyyy"
              maxDate={PIDateTo}
              onChange={handleDateFromChange}
              renderInput={(params) => <TextField {...params} fullWidth size="small" />}
              slotProps={{
                textField: {
                  size: 'small',
                },
              }}
            />

            <DesktopDatePicker
              label="PI Date To"
              variant="outlined"
              value={PIDateTo}
              format="dd MMM yyyy"
              minDate={PIDateFrom}
              onChange={handleDateToChange}
              renderInput={(params) => <TextField {...params} fullWidth size="small" />}
              slotProps={{
                textField: {
                  size: 'small',
                },
              }}
            />
          </Stack>
        </Tooltip>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          <Tooltip title="Zoom in" arrow placement="top">
            <IconButton
              color="primary"
              sx={{ border: '1px solid #eee' }}
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 1.5))}
            >
              <Iconify icon="ant-design:zoom-in-outlined" width={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom out" arrow placement="top">
            <IconButton
              color="primary"
              sx={{ border: '1px solid #eee' }}
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.7))}
            >
              <Iconify icon="ant-design:zoom-out-outlined" width={20} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack> */}

      {/* Tabs: All Buckets | All Plans */}
      <Tabs
        value={filters.status}
        onChange={handleFilterStatus}
        sx={{
          px: 2.5,
          mb: 2,
          boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
        }}
      >
        {bucketTabOptions.map((tab) => (
          <Tab
            key={tab.value}
            iconPosition="end"
            value={tab.value}
            label={tab.label}
            icon={
              <Label variant={filters.status === tab.value ? 'filled' : 'soft'} color={tab.color}>
                {tab.value === 'plans' ? plansData.length : rowData.length}
              </Label>
            }
          />
        ))}
      </Tabs>

      {filters.status === 'plans' ? (
        <Scrollbar>
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left',
              width: `${100 / zoomLevel}%`,
              height: `${100 / zoomLevel}%`,
            }}
          >
            {plansLoading ? (
              <LoadingScreen />
            ) : (
              <AgGridReact
                className="ag-theme-material"
                theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
                ref={plansGridRef}
                rowData={plansData}
                columnDefs={plansMasterColumnDefs}
                defaultColDef={defaultColDef}
                rowHeight={35}
                headerHeight={40}
                animateRows
                pagination
                paginationPageSize={20}
                onFirstDataRendered={onFirstDataRendered}
                domLayout="autoHeight"
                suppressRowClickSelection
              />
            )}
          </div>
        </Scrollbar>
      ) : (
        <Scrollbar>
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left',
              width: `${100 / zoomLevel}%`,
              height: `${100 / zoomLevel}%`,
            }}
          >
            <AgGridReact
              className="ag-theme-material"
              theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
              ref={gridRef}
              rowData={isLoading ? [] : filteredData}
              columnDefs={masterColumnDefs}
              defaultColDef={defaultColDef}
              rowHeight={35}
              headerHeight={40}
              animateRows
              pagination
              paginationPageSize={20}
              onFirstDataRendered={onFirstDataRendered}
              domLayout="autoHeight"
              loading={isLoading}
              masterDetail
              detailCellRenderer="agDetailCellRenderer"
              detailCellRendererParams={detailCellRendererParams}
              rowSelection="multiple"
              suppressRowClickSelection
              onSelectionChanged={onSelectionChanged}
              isRowSelectable={() => true}
              getRowStyle={getRowStyle}
            />
          </div>
        </Scrollbar>
      )}

      <UploadExcelDialog
        uploadOpen={uploadOpen}
        uploadClose={uploadClose}
        FetchUpdatedData={() => {
          fetchData();
        }}
        data={data}
        tableData={rowData}
      />

      {/* AI Plan generating: full-screen Lottie loading overlay */}
      {generateAIPlanLoading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            zIndex: 9999,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: 320,
            }}
          >
            <DotLottieReact
              src="/Ai_loading_model.lottie"
              loop
              autoplay
              renderer="svg"
              style={{ width: 280, height: 280 }}
              rendererSettings={{
                preserveAspectRatio: 'xMidYMid meet',
              }}
            />
            <Typography variant="body1" sx={{ mt: 1, fontWeight: 600 }}>
              Generating AI Plan...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Create AI Plan confirmation dialog */}
      <ConfirmDialog
        open={createAIPlanConfirm.value}
        onClose={() => {
          createAIPlanConfirm.onFalse();
          setBucketRowForPlan(null);
        }}
        title="Create AI Plan"
        content={
          <Typography variant="body2">
            Generate AI Plan for bucket <strong>{bucketRowForPlan?.BUCKETNAME ?? bucketRowForPlan?.BUCKETCODE ?? ''}</strong>?
          </Typography>
        }
        action={
          <Stack direction="row" spacing={1} mr={1}>
            {/* <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                createAIPlanConfirm.onFalse();
                setBucketRowForPlan(null);
              }}
            >
              Cancel
            </Button> */}
            <LoadingButton
              variant="contained"
              onClick={handleGenerateAIPlanConfirm}
              loading={generateAIPlanLoading}
              color="primary"
              startIcon={<Iconify icon="si:ai-fill" width={18} />}
            >
              Generate AI Plan
            </LoadingButton>
          </Stack>
        }
      />

      {/* View Plan dialog: tabs with Production Schedule, Lot Summary, Lot Distribution (excel-like grids) */}
      <Dialog
        open={viewPlanDialogOpen}
        onClose={closeViewPlanDialog}
        maxWidth="xl"
        fullWidth
      // PaperProps={{ }}
      >
        <DialogTitle>
          View Plan {selectedPlanForView?.PlanNo ? `– ${selectedPlanForView.PlanNo}` : ''}
        </DialogTitle>
        <DialogContent dividers>
          <Tabs
            value={viewPlanDialogTab}
            onChange={(e, v) => setViewPlanDialogTab(v)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab label="Production Schedule" id="view-plan-schedule" />
            <Tab label="Lot Summary" id="view-plan-summary" />
            <Tab label="Lot Distribution" id="view-plan-distribution" />
          </Tabs>
          {viewPlanDialogTab === 0 && (
            <Box sx={{ width: '100%', height: 420 }}>
              <AgGridReact
                className="ag-theme-material"
                theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
                rowData={selectedPlanForView?.ProductionSchedule ?? []}
                columnDefs={productionScheduleColumnDefs}
                defaultColDef={defaultColDef}
                rowHeight={32}
                headerHeight={36}
                animateRows
                domLayout="normal"
                suppressRowClickSelection
              />
            </Box>
          )}
          {viewPlanDialogTab === 1 && (
            <Box sx={{ width: '100%', height: 420 }}>
              <AgGridReact
                className="ag-theme-material"
                theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
                rowData={selectedPlanForView?.LotSummary ?? []}
                columnDefs={lotSummaryColumnDefs}
                defaultColDef={defaultColDef}
                rowHeight={32}
                headerHeight={36}
                animateRows
                domLayout="normal"
                suppressRowClickSelection
              />
            </Box>
          )}
          {viewPlanDialogTab === 2 && (
            <Box sx={{ width: '100%', height: 420 }}>
              <AgGridReact
                className="ag-theme-material"
                theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
                rowData={selectedPlanForView?.LotDistribution ?? []}
                columnDefs={lotDistributionColumnDefs}
                defaultColDef={defaultColDef}
                rowHeight={32}
                headerHeight={36}
                animateRows
                domLayout="normal"
                suppressRowClickSelection
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeViewPlanDialog} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Warning Dialog for LC Status */}
      <ConfirmDialog
        open={warningDialog.value}
        onClose={() => {
          warningDialog.onFalse();
        }}
        title="Warning: LC Status"
        content={
          <Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              The following items have LC status issues:
            </Typography>
            <Stack spacing={1}>
              {lcStatusWarnings.lcPending > 0 && (
                <Typography variant="body2" color="warning.main">
                  • LC Pending: {lcStatusWarnings.lcPending} item(s)
                </Typography>
              )}
              {lcStatusWarnings.lcNotGenerated > 0 && (
                <Typography variant="body2" color="error.main">
                  • LC Not Generated: {lcStatusWarnings.lcNotGenerated} item(s)
                </Typography>
              )}
            </Stack>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Do you want to proceed anyway?
            </Typography>
          </Box>
        }
        action={
          <Stack direction="row" spacing={2}>
            {/* <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                warningDialog.onFalse();
              }}
            >
              Cancel
            </Button> */}
            <Button
              variant="contained"
              color="warning"
              sx={{ mr: 2 }}
              onClick={() => {
                warningDialog.onFalse();
                confirm.onTrue();
              }}
            >
              Proceed
            </Button>
          </Stack>
        }
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
        }}
        title="Ready for Production"
        content={`Are you sure you want to mark ${selectedRows.length} item(s) as ready for production?`}
        action={
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              handleBulkReadyForProduction();
              confirm.onFalse();
            }}
          >
            Confirm ({selectedRows.length})
          </Button>
        }
      />

      {/* Delete/Revert Confirm Dialog */}
      <ConfirmDialog
        open={deleteConfirm.value}
        onClose={() => {
          deleteConfirm.onFalse();
          setSelectedRowForDelete(null);
        }}
        title="Revert Ready for Production"
        content={`Are you sure you want to revert this ${selectedRowForDelete?.Invoice || ''
          } item? This will remove it from Ready for Production status.`}
        action={
          <Button variant="contained" color="warning" onClick={handleDeletePIRFP}>
            Revert
          </Button>
        }
      />

      {/* Bottleneck Dialog */}
      <Dialog
        open={bottleneckDialog.value}
        onClose={() => {
          bottleneckDialog.onFalse();
          setSelectedRowForBottleneck(null);
          setSelectedBottleneckType(null);
          setBottleneckDescription('');
          setBottleneckDate(new Date());
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Bottleneck - {selectedRowForBottleneck?.Invoice || ''}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Autocomplete
              options={bottleneckTypes}
              getOptionLabel={(option) => option?.BNTYPE || ''}
              value={selectedBottleneckType}
              onChange={(event, newValue) => {
                setSelectedBottleneckType(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Bottleneck Type"
                  placeholder="Select bottleneck type"
                  required
                />
              )}
              isOptionEqualToValue={(option, value) => option?.BNID === value?.BNID}
            />
            <TextField
              label="Delivery Due Date"
              value={selectedRowForBottleneck?.Delivery_Date ? fDate(selectedRowForBottleneck.Delivery_Date) : '-'}
              InputProps={{
                readOnly: true,
              }}
              fullWidth
              disabled
              helperText="Reference: Original delivery date"
            />
            <DesktopDatePicker
              label="New Est. Delivery Date"
              variant="outlined"
              value={bottleneckDate}
              format="dd MMM yyyy"
              onChange={(newValue) => {
                setBottleneckDate(newValue);
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
            <TextField
              label="Description"
              placeholder="Enter description"
              multiline
              rows={4}
              value={bottleneckDescription}
              onChange={(e) => setBottleneckDescription(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              bottleneckDialog.onFalse();
              setSelectedRowForBottleneck(null);
              setSelectedBottleneckType(null);
              setBottleneckDescription('');
              setBottleneckDate(new Date());
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              if (!selectedBottleneckType) {
                enqueueSnackbar('Please select a bottleneck type', { variant: 'warning' });
                return;
              }

              if (!selectedRowForBottleneck?.PIRFPID) {
                enqueueSnackbar('PIRFP ID not found', { variant: 'error' });
                return;
              }

              try {
                const payload = {
                  PIRFPID: selectedRowForBottleneck.PIRFPID,
                  BNID: selectedBottleneckType.BNID,
                  BNDeliveryDate: bottleneckDate,
                  BNReason: bottleneckDescription || '',
                };

                const response = await Put('PIRFP/Update', payload);

                if (response.status === 200) {
                  enqueueSnackbar(
                    response.data?.Message || 'Bottleneck saved successfully',
                    { variant: 'success' }
                  );
                  fetchData(); // Refresh data
                  bottleneckDialog.onFalse();
                  setSelectedRowForBottleneck(null);
                  setSelectedBottleneckType(null);
                  setBottleneckDescription('');
                  setBottleneckDate(new Date());
                } else {
                  enqueueSnackbar(
                    response.data?.Message || 'Failed to save bottleneck',
                    { variant: 'error' }
                  );
                }
              } catch (error) {
                console.error('Error saving bottleneck:', error);
                enqueueSnackbar(
                  error?.response?.data?.Message || 'Failed to save bottleneck',
                  { variant: 'error' }
                );
              }
            }}
            disabled={!selectedBottleneckType}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Direct Purchase Dialog */}
      <Dialog
        open={directPurchaseDialog.value}
        onClose={() => {
          directPurchaseDialog.onFalse();
          setSelectedRowForDirectPurchase(null);
          setDirectPurchaseDate(new Date());
          setDirectPurchaseReason('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Direct Purchase - {selectedRowForDirectPurchase?.Invoice || ''}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <DesktopDatePicker
              label="Date"
              variant="outlined"
              value={directPurchaseDate}
              format="dd MMM yyyy"
              onChange={(newValue) => {
                setDirectPurchaseDate(newValue);
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
            <TextField
              label="Reason"
              placeholder="Enter direct purchase reason"
              multiline
              rows={4}
              value={directPurchaseReason}
              onChange={(e) => setDirectPurchaseReason(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              directPurchaseDialog.onFalse();
              setSelectedRowForDirectPurchase(null);
              setDirectPurchaseDate(new Date());
              setDirectPurchaseReason('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              if (!directPurchaseReason) {
                enqueueSnackbar('Please enter a reason', { variant: 'warning' });
                return;
              }

              try {
                const payload = {
                  PIDtlID: selectedRowForDirectPurchase?.PIDtlID,
                  DPDATE: formatDateForApi(directPurchaseDate),
                  DPREASON: directPurchaseReason,
                  UpdatedBy: userData?.userDetails?.userId,
                  Org_ID: userData?.userDetails?.orgId,
                  Branch_ID: userData?.userDetails?.branchID,
                };

                const response = await Post('ProductionDirectPurchase/Insert', payload);

                if (response.status === 200) {
                  enqueueSnackbar(
                    response.data?.Message || 'Direct purchase saved successfully',
                    { variant: 'success' }
                  );
                  // Refresh data if needed, or just close dialog
                  fetchData();
                  directPurchaseDialog.onFalse();
                  setSelectedRowForDirectPurchase(null);
                  setDirectPurchaseDate(new Date());
                  setDirectPurchaseReason('');
                } else {
                  enqueueSnackbar(
                    response.data?.Message || 'Failed to save direct purchase',
                    { variant: 'error' }
                  );
                }
              } catch (error) {
                console.error('Error saving direct purchase:', error);
                enqueueSnackbar(
                  error?.response?.data?.Message || 'Failed to save direct purchase',
                  { variant: 'error' }
                );
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bottleneck History Dialog */}
      <Dialog
        open={historyDialog.value}
        onClose={() => {
          historyDialog.onFalse();
          setSelectedRowForHistory(null);
          setBottleneckHistory([]);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Bottleneck History - {selectedRowForHistory?.Invoice || ''}
        </DialogTitle>
        <DialogContent>
          {isLoadingHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <LoadingScreen />
            </Box>
          ) : bottleneckHistory.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No bottleneck history found
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Bottleneck Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Estimated Delivery Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bottleneckHistory.map((history, index) => (
                    <TableRow key={history.HIS_BNID || index}>
                      <TableCell>{history.BNTYPE || '-'}</TableCell>
                      <TableCell>{history.BNDESCRIPTION || '-'}</TableCell>
                      <TableCell>
                        {history.ESTDELIVERY_DATE
                          ? fDate(history.ESTDELIVERY_DATE)
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              historyDialog.onFalse();
              setSelectedRowForHistory(null);
              setBottleneckHistory([]);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ItemListView;

ItemListView.propTypes = {
  uploadOpen: PropTypes.bool,
  uploadClose: PropTypes.func,
  data: PropTypes.object,
};
