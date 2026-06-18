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
  LinearProgress,
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
import { useRouter } from 'src/routes/hooks';

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
  const router = useRouter();

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
  const [itemStockDialogOpen, setItemStockDialogOpen] = useState(false);
  const [itemStockData, setItemStockData] = useState([]);
  const [itemStockLoading, setItemStockLoading] = useState(false);
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
    status: 'pending',
  });

  // Get unique statuses for tabs based on PIRFPStatus
  const statusOptions = useMemo(
    () => [
      { value: 'all', label: 'All', color: 'default' },
      { value: 'pending', label: 'Pending', color: 'warning' },
      { value: 'directPurchase', label: 'Direct Purchase', color: 'primary' },
      { value: 'confirmed', label: 'Confirmed', color: 'success' },
      { value: 'pdo', label: 'PDO', color: 'info' },
      { value: 'mrp', label: 'MRP', color: 'error' },
    ],
    []
  );



  const fetchData = useCallback(async () => {
    const caseStatus = (d) => {
      if (d?.isPDO === 'Y') return 'pdo';
      if (d?.isMRP === 'Y') return 'mrp';
      if (d?.PIRFPStatus === 1) return 'confirmed';
      if (d?.DPSTATUS === 'Y') return 'directPurchase';
      return 'pending';
    };
    try {
      setIsLoading(true);
      const fromDate = formatDateForApi(PIDateFrom);
      const toDate = formatDateForApi(PIDateTo);
      const response = await Get(
        `CommercialLCStatusBydates?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}&fromDate=${fromDate}&toDate=${toDate}`
      );

      if (response.status === 200) {
        const rawData = Array.isArray(response.data) ? response.data : [];
        const formattedData = rawData.map((item) => ({
          ...item,
          PIDate: item.PIDate ?? item.PIDATE,
          PIRFPStatusTab: caseStatus(item),
          PIRFPStatusTabName: statusOptions.find((x) => x.value === caseStatus(item))?.label,
          Invoice: item?.HistoryCount > 0 ? `${item.Invoice}-R${item.HistoryCount}` : item.Invoice,
          RequiredItemDetails: item?.RequiredItemDetails ?? [],
        }));
        setRowData(formattedData);
        setFilteredData(formattedData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, PIDateFrom, PIDateTo, statusOptions]);

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

  const isMasterDetailTab = filters.status === 'pdo' || filters.status === 'mrp';

  const columnDefs = useMemo(
    () => [

      {
        field: 'checkbox',
        headerName: '',
        maxWidth: 40,
        minWidth: 40,
        checkboxSelection: (params) => params.data?.PIRFPStatusTab === 'pending',
        headerCheckboxSelection: true,
        sortable: false,
        filter: false,
        resizable: false,
        lockPosition: 'left',
        pinned: 'left',
        hide: filters.status === 'directPurchase' || filters.status === 'confirmed' || filters.status === 'pdo' || filters.status === 'mrp',
        // cellRenderer: (params) => {
        //   const isSelectable = params.data?.PIRFPStatus === false && params.data?.ExportLCID != null;

        //   // If selectable, let AG-Grid render the default checkbox
        //   if (isSelectable) {
        //     return undefined;
        //   }

        //   // Already confirmed - show check icon
        //   if (params.data?.PIRFPStatus === true) {
        //     return (
        //       <Tooltip title={`Approved by ${params.data.ApproverName || 'Unknown'}`} arrow>
        //         <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        //           <Iconify icon="solar:check-circle-bold" width={20} style={{ color: '#22c55e' }} />
        //         </span>
        //       </Tooltip>
        //     );
        //   }

        //   // No LC generated (null or undefined) - show dash
        //   if (params.data?.ExportLCID == null) {
        //     return (
        //       <Tooltip title="LC not generated yet" arrow>
        //         <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
        //           —
        //         </span>
        //       </Tooltip>
        //     );
        //   }

        //   // Fallback - show dash for any other non-selectable case
        //   return (
        //     <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
        //       —
        //     </span>
        //   );
        // },
      },
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
        hide: !isMasterDetailTab,
      },
      {
        field: 'bucketCheckbox',
        headerName: '',
        maxWidth: 40,
        minWidth: 40,
        hide: filters.status !== 'mrp',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        sortable: false,
        filter: false,
        resizable: false,
        lockPosition: 'left',
        pinned: 'left',
      },
      { field: 'Invoice', headerName: 'PI No.', minWidth: 150, filter: 'agTextColumnFilter' },
      { field: 'Item_Code', headerName: 'Item Code', minWidth: 150, filter: 'agTextColumnFilter' },
      {
        field: 'Product_Description',
        headerName: 'Description',
        minWidth: 250,
        filter: 'agTextColumnFilter',
        tooltipField: 'Product_Description',
      },
      {
        field: 'PIDate',
        headerName: 'PI Date',
        minWidth: 120,
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      {
        field: 'PDO_NO',
        headerName: 'PDO No.',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
        hide: filters.status === 'pending' || filters.status === 'directPurchase' || filters.status === 'confirmed',
      },
      {
        field: 'PDODATE',
        headerName: 'PDO Date',
        minWidth: 120,
        valueFormatter: (params) => fDate(params.value) || '-',
        hide: filters.status === 'pending' || filters.status === 'directPurchase' || filters.status === 'confirmed',
      },
      {
        field: 'PDOCREATED_ON',
        headerName: 'PDO Created On',
        minWidth: 120,
        valueFormatter: (params) => fDate(params.value) || '-',
        hide: filters.status === 'pending' || filters.status === 'directPurchase' || filters.status === 'confirmed',
      },
      {
        field: 'MRP_NO',
        headerName: 'MRP No.',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
        hide: filters.status === 'pending' || filters.status === 'directPurchase' || filters.status === 'confirmed' || filters.status === 'pdo',
      },
      {
        field: 'MRPDATE',
        headerName: 'MRP Date',
        minWidth: 120,
        valueFormatter: (params) => fDate(params.value) || '-',
        hide: filters.status === 'pending' || filters.status === 'directPurchase' || filters.status === 'confirmed' || filters.status === 'pdo',
      },
      {
        field: 'MRPCREATED_ON',
        headerName: 'MRP Created On',
        minWidth: 120,
        valueFormatter: (params) => fDate(params.value) || '-',
        hide: filters.status === 'pending' || filters.status === 'directPurchase' || filters.status === 'confirmed' || filters.status === 'pdo',
      },

      { field: 'WIC_Name', headerName: 'WIC Name', minWidth: 150, filter: 'agTextColumnFilter' },
      {
        field: 'Main_Buyer',
        headerName: 'Main Buyer',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },

      { field: 'ColorName', headerName: 'Color', minWidth: 120, filter: 'agTextColumnFilter' },
      {
        field: 'Color_Code',
        headerName: 'Color Code',
        minWidth: 100,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Quantity',
        headerName: 'Quantity',
        minWidth: 100,
        type: 'numericColumn',
        valueFormatter: (params) => params.value?.toFixed(2),
      },

      {
        field: 'ItemDescription',
        headerName: 'Required Item',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
        hide: filters.status === 'pending' || filters.status === 'directPurchase' || filters.status === 'confirmed' || isMasterDetailTab,
      },
      {
        field: 'PDORequired',
        headerName: 'Requirement in KG',
        minWidth: 150,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '-',
        hide: filters.status === 'pending' || filters.status === 'directPurchase' || filters.status === 'confirmed' || isMasterDetailTab,
      },
      {
        field: 'STOCK_AVAILABLE_IN_KG',
        headerName: 'Stock Available in KG',
        minWidth: 150,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '-',
        hide: filters.status === 'pending' || filters.status === 'directPurchase' || filters.status === 'confirmed' || isMasterDetailTab,
      },
      {
        field: 'AvailableStockForPDO',
        headerName: 'Stock Available Status',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
        cellStyle: (params) => ({ color: params.value === 'Available' ? 'green' : 'red' }),
        hide: filters.status === 'pending' || filters.status === 'directPurchase' || filters.status === 'confirmed' || isMasterDetailTab,
      },
      {
        field: 'RemainingStockAfterDeptReq',
        headerName: 'Stock Available After Dept Request',
        minWidth: 150,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '-',
        hide: filters.status === 'pending' || filters.status === 'directPurchase' || filters.status === 'confirmed' || isMasterDetailTab,
      },
      {
        field: 'StockAvailableStsafterdeptreq',
        headerName: 'Stock Available Status After Dept Request',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
        cellStyle: (params) => ({ color: params.value === 'Available' ? 'green' : 'red' }),
        hide: filters.status === 'pending' || filters.status === 'directPurchase' || filters.status === 'confirmed' || isMasterDetailTab,
      },

      {
        field: 'Delivery_Date',
        headerName: 'Delivery Date',
        minWidth: 120,
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      {
        field: 'Payment_Term',
        headerName: 'Payment Term',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Commercial_Dept_Status',
        headerName: 'LC Status',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        cellRenderer: (params) => (
          <Typography variant="caption" color={`${getStatusColor(params.value)}.main`}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'PIRFPStatusTabName',
        headerName: 'Status',
        minWidth: 140,
        filter: 'agTextColumnFilter',
        cellRenderer: (params) => {
          const isBoth = params.data?.isPDO === 'Y' && params.data?.isMRP === 'Y';
          if (isBoth) {
            const pdoOpt = statusOptions.find((x) => x.value === 'pdo');
            const mrpOpt = statusOptions.find((x) => x.value === 'mrp');
            return (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                <Label variant="soft" color={pdoOpt?.color}>
                  PDO
                </Label>
                <Label variant="soft" color={mrpOpt?.color}>
                  MRP
                </Label>
              </Box>
            );
          }
          return (
            <Label variant="soft" color={statusOptions.find((x) => x.label === params.value)?.color}>
              {params.value}
            </Label>
          );
        },
      },

      {
        field: 'ApproverName',
        headerName: 'Approver',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'BNTYPE',
        headerName: 'Bottleneck',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'BNReason',
        headerName: 'Bottleneck Description',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'BNDeliveryDate',
        headerName: 'New Estimated Delivery Date',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => fDate(params.value) || '-',
      },
      {
        headerName: '',
        minWidth: 120,
        maxWidth: 120,
        cellRenderer: revertActionRenderer,
        sortable: false,
        filter: false,
        resizable: false,
        pinned: 'right',
        lockPosition: 'right',
      },

    ],
    [revertActionRenderer, statusOptions, filters.status, isMasterDetailTab]
  );

  // Detail grid columns for RequiredItemDetails (PDO / MRP tabs only)
  const requiredItemDetailColumnDefs = useMemo(
    () => [
      { field: 'ItemCode', headerName: 'Item Code', minWidth: 140, filter: 'agTextColumnFilter' },
      {
        field: 'ItemDescription', headerName: 'Required Item', minWidth: 240,
        width: 480, filter: 'agTextColumnFilter'
      },
      { field: 'PDO_NO', headerName: 'PDO No.', minWidth: 140, filter: 'agTextColumnFilter' },
      { field: 'MRP_NO', headerName: 'MRP No.', minWidth: 140, filter: 'agTextColumnFilter' },
      {
        field: 'PDORequired',
        headerName: 'Requirement in KG',
        minWidth: 120,
        filter: 'agNumberColumnFilter',
        valueFormatter: (p) => (p.value != null ? fNumber(p.value) : '-'),
      },
      // {
      //   field: 'REQUIREMENT_IN_KG',
      //   headerName: 'Req in KG',
      //   minWidth: 100,
      //   filter: 'agNumberColumnFilter',
      //   valueFormatter: (p) => (p.value != null ? fNumber(p.value) : '-'),
      // },
      // {
      //   field: 'STOCK_AVAILABLE_IN_KG',
      //   headerName: 'Stock Available (KG)',
      //   minWidth: 140,
      //   filter: 'agNumberColumnFilter',
      //   valueFormatter: (p) => (p.value != null ? fNumber(p.value) : '-'),
      // },
      // {
      //   field: 'StockAvailableStatus',
      //   headerName: 'Stock Status',
      //   minWidth: 110,
      //   valueFormatter: (p) => (p.value === 'Y' ? 'Available' : 'Not Available'),
      //   cellStyle: (p) => (p.value === 'Y' ? { color: 'green' } : { color: 'red' }),
      // },
      // {
      //   field: 'PURCHASE_IN_PROCESS_IN_KG',
      //   headerName: 'Purchase in Process (KG)',
      //   minWidth: 160,
      //   filter: 'agNumberColumnFilter',
      //   valueFormatter: (p) => (p.value != null ? fNumber(p.value) : '-'),
      // },
      // {
      //   field: 'DepartReqQty',
      //   headerName: 'Dept Req Qty (KG)',
      //   minWidth: 110,
      //   filter: 'agNumberColumnFilter',
      //   valueFormatter: (p) => (p.value != null ? fNumber(p.value) : '-'),
      // },
      // {
      //   field: 'RemainingStockAfterDeptReq',
      //   headerName: 'Stock After Dept Req',
      //   minWidth: 150,
      //   filter: 'agNumberColumnFilter',
      //   valueFormatter: (p) => (p.value != null ? fNumber(p.value) : '-'),
      // },
      // {
      //   field: 'AvailableStockForPDO',
      //   headerName: 'Available for PDO',
      //   minWidth: 120,
      //   valueFormatter: (p) => (p.value === 'Y' ? 'Available' : 'Not Available'),
      //   cellStyle: (p) => (p.value === 'Y' ? { color: 'green' } : { color: 'red' }),
      // },
      // {
      //   field: 'StockAvailableStsafterdeptreq',
      //   headerName: 'Status After Dept Req',
      //   minWidth: 140,
      //   valueFormatter: (p) => (p.value === 'Y' ? 'Available' : 'Not Available'),
      //   cellStyle: (p) => (p.value === 'Y' ? { color: 'green' } : { color: 'red' }),
      // },
    ],
    []
  );

  const detailCellRendererParams = useMemo(
    () => ({
      detailGridOptions: {
        columnDefs: requiredItemDetailColumnDefs,
        defaultColDef: { sortable: true, filter: true, resizable: true },
        domLayout: 'autoHeight',
      },
      getDetailRowData: (params) => params.successCallback(params.data?.RequiredItemDetails ?? []),
    }),
    [requiredItemDetailColumnDefs]
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

  // Fetch Item Stock (date-wise) and open dialog
  const fetchItemStock = useCallback(async () => {
    setItemStockDialogOpen(true);
    setItemStockLoading(true);
    setItemStockData([]);
    try {
      const fromDate = formatDateForApi(PIDateFrom);
      const toDate = formatDateForApi(PIDateTo);
      const response = await Get(
        `GetRequiredItemStockDateWise?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}&fromDate=${fromDate}&toDate=${toDate}`
      );
      if (response.status === 200 && Array.isArray(response.data)) {
        const formattedData = response.data.map((item) => ({
          ...item,
          StockAvailablePercentage: (item.STOCK_AVAILABLE_IN_KG - item.RequiredQtyInKG) / item.STOCK_AVAILABLE_IN_KG * 100,
          STOCK_AVAILABLE_STATUS: item.STOCK_AVAILABLE_IN_KG - item.RequiredQtyInKG > 0 ? 'Available' : 'Not Available',
          RemainingStockAfterDeptReq_STATUS: item.RemainingStockAfterDeptReq - item.RequiredQtyInKG > 0 ? 'Available' : 'Not Available',
        }));
        setItemStockData(formattedData);
      } else {
        setItemStockData([]);
        enqueueSnackbar('No item stock data found', { variant: 'info' });
      }
    } catch (error) {
      console.error('Failed to fetch item stock:', error);
      enqueueSnackbar('Failed to load item stock', { variant: 'error' });
      setItemStockData([]);
    } finally {
      setItemStockLoading(false);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, PIDateFrom, PIDateTo]);

  const itemStockColumnDefs = useMemo(
    () => [
      {
        colId: 'expand',
        headerName: '',
        maxWidth: 50,
        minWidth: 50,
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: { suppressCount: true },
        sortable: false,
        filter: false,
        resizable: false,
        pinned: 'left',
      },
      {
        field: 'RequiredItemDescription',
        headerName: 'Required Item',
        minWidth: 280,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'STOCK_AVAILABLE_IN_KG',
        headerName: 'Stock Available (KG)',
        minWidth: 140,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => (params.value != null ? fNumber(params.value) || '-' : '-'),
      },
      {
        field: 'RemainingStockAfterDeptReq',
        headerName: 'Remaining Stock After Dept Req (KG)',
        minWidth: 150,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => (params.value != null ? fNumber(params.value) || '-' : '-'),
      },
      {
        field: 'RequiredQtyInKG',
        headerName: 'Required Qty (KG)',
        minWidth: 140,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => (params.value != null ? fNumber(params.value) || '-' : '-'),
      },
      {
        field: 'StockAvailablePercentage',
        headerName: 'Stock Available %',
        minWidth: 180,
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => (params.value != null ? `${fNumber(params.value)}%` : '-'),
        cellRenderer: (params) => {
          const value = params.value != null ? Number(params.value) : null;
          if (value === null) return '-';
          const pct = Math.min(100, Math.max(0, value));
          const color = pct >= 80 ? 'success' : pct >= 50 ? 'primary' : pct >= 25 ? 'warning' : 'error';
          return (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%', py: 0.5 }}>
              <LinearProgress
                variant="determinate"
                value={pct}
                color={color}
                sx={{ flex: 1, height: 8, borderRadius: 1 }}
              />
              <Typography variant="caption" sx={{ minWidth: 36 }}>
                {fNumber(pct)}%
              </Typography>
            </Stack>
          );
        },
      },
      
      {
        field: 'STOCK_AVAILABLE_STATUS',
        headerName: 'Stock Status',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value != null ? params.value : '-'),
        cellStyle: (params) => (params.value === 'Available' ? { color: 'green' } : { color: 'red' }),
      },

      {
        field: 'RemainingStockAfterDeptReq_STATUS',
        headerName: 'Remaining Stock Status',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value != null ? params.value : '-'),
        cellStyle: (params) => (params.value === 'Available' ? { color: 'green' } : { color: 'red' }),
      },
      { field: 'isMRP', headerName: 'Is MRP', minWidth: 90, filter: 'agTextColumnFilter', valueFormatter: (params) => (params.value === 'Y' ? 'Yes' : 'No'), },
      // { field: 'MRP_ID', headerName: 'MRP ID', minWidth: 90, filter: 'agNumberColumnFilter' },
      { field: 'MRP_NO', headerName: 'MRP No', minWidth: 140, filter: 'agTextColumnFilter' },
      {
        field: 'MRPDATE',
        headerName: 'MRP Date',
        minWidth: 120,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
      },
    ],
    []
  );

  const itemStockDetailColumnDefs = useMemo(
    () => [
      { field: 'PINo', headerName: 'PI No', minWidth: 160, filter: 'agTextColumnFilter' },
      { field: 'ITEM_CODE', headerName: 'Item Code', minWidth: 180, filter: 'agTextColumnFilter' },
      // {
      //   field: 'Quantity',
      //   headerName: 'Quantity',
      //   minWidth: 100,
      //   filter: 'agNumberColumnFilter',
      //   valueFormatter: (params) => (params.value != null ? fNumber(params.value) : '-'),
      // },
      { field: 'Description', headerName: 'Description', minWidth: 580, filter: 'agTextColumnFilter' },
    ],
    []
  );

  const itemStockDetailCellRendererParams = useMemo(
    () => ({
      detailGridOptions: {
        columnDefs: itemStockDetailColumnDefs,
        defaultColDef: { sortable: true, filter: true, resizable: true },
        domLayout: 'autoHeight',
      },
      getDetailRowData: (params) => params.successCallback(params.data?.Items ?? []),
    }),
    [itemStockDetailColumnDefs]
  );

  // Filter data based on status filter (PDO and MRP tabs show rows where isPDO/isMRP = 'Y' so a row can appear in both)
  useEffect(() => {
    if (!rowData.length) return;

    let filtered = rowData;

    if (filters.status !== 'all') {
      if (filters.status === 'pdo') {
        filtered = filtered.filter((item) => item.isPDO === 'Y');
      } else if (filters.status === 'mrp') {
        filtered = filtered.filter((item) => item.isMRP === 'Y');
      } else {
        filtered = filtered.filter((item) => item.PIRFPStatusTab === filters.status);
      }
    }

    setFilteredData(filtered);
  }, [rowData, filters.status]);

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

  // Create Bucket (MRP tab): build payload and call InsertBucket
  const [bucketDialogOpen, setBucketDialogOpen] = useState(false);
  const [bucketName, setBucketName] = useState('');
  const [bucketSubmitting, setBucketSubmitting] = useState(false);

  const handleCreateBucketClick = () => {
    if (selectedRows.length === 0) {
      enqueueSnackbar('Select at least one row to add to the bucket.', { variant: 'error' });
      return;
    }
    setBucketName('');
    setBucketDialogOpen(true);
  };

  const handleCreateBucketSubmit = async () => {
    const name = (bucketName || '').trim();
    if (!name) {
      enqueueSnackbar('Enter a bucket name.', { variant: 'error' });
      return;
    }
    setBucketSubmitting(true);
    try {
      const Details = selectedRows.map((row) => ({
        MRPID: row.MRP_ID ?? 0,
        MRPDATE: row.MRPDATE ? formatDateForApi(row.MRPDATE) : '',
        PIID: row.PIID ?? 0,
        PIDTLID: row.PIDtlID ?? 0,
        PIDATE: row.PIDate ? formatDateForApi(row.PIDate) : '',
        REQUIREDITEMID: row.ReuiredItemID ?? row.ItemID ?? 0,
        REQUIREMENTINKG: Number(row.PDORequired ?? row.REQUIREMENT_IN_KG ?? 0),
        STOCKAVAILABLEINKG: Number(row.STOCK_AVAILABLE_IN_KG ?? 0),
        STOCKAVAILABLEAFTERDPTREQ: Number(row.RemainingStockAfterDeptReq ?? 0),
        STOCKAVAILABLESTATUS: row.AvailableStockForPDO === 'Available' ? 'Y' : 'N',
        STOCKAVAILABLESTATUSAFTERDPTREQ:
          row.StockAvailableStsafterdeptreq === 'Available' ? 'Y' : 'N',
        WICID: row.WIC_ID ?? 0,
        ENDCUSTOMERID: row.End_CustomerID ?? 0,
        COLORID: row.ColorID ?? 0,
        COLORCODE: row.Color_Code ?? '',
        QUANTITY: Number(row.Quantity ?? 0),
        PAYMENTTERMID: row.Payment_TermID ?? 0,
        LCSTATUSID: row.ExportLCID ?? 0,
        APPROVERID: row.AppoverID ?? row.ApproverID ?? 0,
      }));
      const payload = {
        BUCKETNAME: name,
        FromDate: formatDateForApi(PIDateFrom),
        ToDate: formatDateForApi(PIDateTo),
        CreatedBy: userData?.userDetails?.userId ?? 0,
        Org_ID: userData?.userDetails?.orgId ?? 0,
        Branch_ID: userData?.userDetails?.branchID ?? 0,
        Details,
      };
      const response = await Post('InsertBucket', payload);
      if (response?.data?.Success ?? response?.status === 200) {
        enqueueSnackbar('Bucket created successfully.', { variant: 'success' });

        setBucketDialogOpen(false);
        setBucketName('');
        router.push(paths.dashboard.Production.Planning.ProductionBucket.root);
        if (gridRef.current?.api) gridRef.current.api.deselectAll();
        setSelectedRows([]);
      } else {
        enqueueSnackbar(response?.data?.Message ?? 'Failed to create bucket', { variant: 'error' });
      }
    } catch (err) {
      console.error(err);
      enqueueSnackbar(err?.response?.data?.Message ?? 'Failed to create bucket', {
        variant: 'error',
      });
    } finally {
      setBucketSubmitting(false);
    }
  };

  return (
    <Card sx={{ p: 2 }}>
      <Stack
        spacing={2}
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
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

            {filters.status === 'mrp' ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateBucketClick}
                disabled={selectedRows.length === 0}
                startIcon={<Iconify icon="ri:ai-generate-3d-line" />}
              >
                Create Bucket ({selectedRows.length})
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveClick}
                disabled={selectedRows.length === 0}
                startIcon={<Iconify icon="mdi:check-all" />}
              >
                Save Selected ({selectedRows.length})
              </Button>
            )}

          </Stack>
        </Tooltip>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>

          <Button
            variant="outlined"
            color="primary"
            onClick={fetchItemStock}
            startIcon={<Iconify icon="fa7-solid:boxes-packing" />}
          >
            Item Stock
          </Button>
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
      </Stack>

      {/* Tabs for filtering by Status */}
      <Tabs
        value={filters.status}
        onChange={handleFilterStatus}
        sx={{
          px: 2.5,
          mb: 2,
          boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
        }}
      >
        {statusOptions.map((tab) => (
          <Tab
            key={tab.value}
            iconPosition="end"
            value={tab.value}
            label={tab.label}
            icon={
              <Label
                variant={
                  ((tab.value === filters.status || tab.value === 'all') && 'filled') || 'soft'
                }
                color={tab.color}
              >
                {tab.value === 'all'
                  ? rowData.length
                  : tab.value === 'pdo'
                    ? rowData.filter((item) => item.isPDO === 'Y').length
                    : tab.value === 'mrp'
                      ? rowData.filter((item) => item.isMRP === 'Y').length
                      : rowData.filter((item) => item.PIRFPStatusTab === tab.value).length}
              </Label>
            }
          />
        ))}
      </Tabs>

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
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowHeight={35}
            headerHeight={40}
            animateRows
            pagination
            paginationPageSize={20}
            onFirstDataRendered={onFirstDataRendered}
            domLayout="autoHeight"
            loading={isLoading}
            masterDetail={isMasterDetailTab}
            detailCellRenderer={isMasterDetailTab ? 'agDetailCellRenderer' : undefined}
            detailCellRendererParams={isMasterDetailTab ? detailCellRendererParams : undefined}
            rowSelection="multiple"
            suppressRowClickSelection
            onSelectionChanged={onSelectionChanged}
            isRowSelectable={isRowSelectable}
            getRowStyle={getRowStyle}
          />
        </div>
      </Scrollbar>

      <UploadExcelDialog
        uploadOpen={uploadOpen}
        uploadClose={uploadClose}
        FetchUpdatedData={() => {
          fetchData();
        }}
        data={data}
        tableData={rowData}
      />

      {/* Item Stock dialog */}
      <Dialog
        open={itemStockDialogOpen}
        onClose={() => setItemStockDialogOpen(false)}
        maxWidth="xl"
        fullWidth
      // PaperProps={{ sx: { height: '85vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Item Stock [{fDate(PIDateFrom)} - {fDate(PIDateTo)}]
          <IconButton
            aria-label="close"
            onClick={() => setItemStockDialogOpen(false)}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <Iconify icon="eva:close-fill" width={24} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers >
          {itemStockLoading ? (
            <LoadingScreen />
          ) : (
            <div
              style={{
                overflow: 'hidden',
              }}
            >

              <Scrollbar >
                <AgGridReact
                  className="ag-theme-material"
                  theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
                  rowData={itemStockData}
                  columnDefs={itemStockColumnDefs}
                  defaultColDef={defaultColDef}
                  rowHeight={35}
                  headerHeight={40}
                  animateRows
                  pagination
                  paginationPageSize={10}
                  paginationPageSizeSelector={[10, 15, 20, 50, 100]}
                  domLayout="autoHeight"
                  onFirstDataRendered={onFirstDataRendered}
                  masterDetail
                  detailCellRenderer="agDetailCellRenderer"
                  detailCellRendererParams={itemStockDetailCellRendererParams}
                />
              </Scrollbar>
            </div>
          )}
        </DialogContent>
        {/* <DialogActions>
          <Button onClick={() => setItemStockDialogOpen(false)}>Close</Button>
        </DialogActions> */}
      </Dialog>

      {/* Create Bucket dialog (MRP tab) */}
      <Dialog open={bucketDialogOpen} onClose={() => setBucketDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create Bucket</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Bucket Name"
            fullWidth
            variant="outlined"
            value={bucketName}
            onChange={(e) => setBucketName(e.target.value)}
            placeholder="Enter bucket name"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBucketDialogOpen(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            onClick={handleCreateBucketSubmit}
            loading={bucketSubmitting}
            disabled={!bucketName.trim()}
          >
            Create Bucket
          </LoadingButton>
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
