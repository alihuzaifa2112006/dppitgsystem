import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get, Post, Delete } from 'src/api/apibasemethods';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import {
  Box,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  LinearProgress,
  Stack,
} from '@mui/material';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import EmptyContent from 'src/components/empty-content';
import { fDate, fDateTime } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import PropTypes from 'prop-types';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

const ProductionOpenGridPDO = ({ setPdoDataLength, onSaveSuccess }) => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [zoomLevel, setZoomLevel] = useState(1);
  const confirm = useBoolean();
  const [selectedPDO, setSelectedPDO] = useState(null);

  // State for grid data
  const [rowData, setRowData] = useState([]);
  const [allRowData, setAllRowData] = useState([]); // Store all data for filtering
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
  ); // Next month by default
  const [selectedPDOs, setSelectedPDOs] = useState([]); // Selected PDO IDs
  const [mrpDate, setMrpDate] = useState(new Date());
  const [subDetailsDialog, setSubDetailsDialog] = useState({
    open: false,
    subDetails: [],
    title: '',
  });

  const [open, setOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Filter data by selected month
  const filterByMonth = useCallback((data, month) => {
    if (!month) {
      setRowData(data);
      return;
    }
    const monthString = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    const filtered = data.filter((item) => item.ProductionMonth === monthString);
    setRowData(filtered);
  }, []);

  // Fetch PDO data
  const fetchPDOData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `PDO/GetAllPDO?OrgID=${userData?.userDetails?.orgId || 1}&BranchID=${userData?.userDetails?.branchID || 6
        }`
      );

      if (response.status === 200 && response.data.Success) {
        const data = response.data.Data.map((item) => ({
          ...item,
          Details: item.Details.map((detail) => ({
            ...detail,
            PINo: detail?.HistoryCount > 0 ? `${detail?.PINo}-R${detail?.HistoryCount}` : detail?.PINo,
          })),
        })) || [];
        setAllRowData(data);
        setPdoDataLength(data.length);
        // Filter by selected month
        filterByMonth(data, selectedMonth);
      } else {
        setRowData([]);
        setAllRowData([]);
        enqueueSnackbar(response.data?.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load PDO data', { variant: 'error' });
      setRowData([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [userData, enqueueSnackbar, setPdoDataLength]);

  // Handle month change
  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
    filterByMonth(allRowData, newMonth);
    setSelectedPDOs([]); // Clear selections when month changes
  };

  useEffect(() => {
    fetchPDOData();
  }, [fetchPDOData]);

  // Filter by month when month or allRowData changes
  useEffect(() => {
    if (allRowData.length > 0) {
      filterByMonth(allRowData, selectedMonth);
    }
  }, [selectedMonth, allRowData, filterByMonth]);

  // Get counts for each tab based on RecipeType
  const tabCounts = useMemo(() => {
    const allCount = rowData.length;

    // Count by recipe type from details
    const recipeTypeCounts = rowData.reduce((acc, item) => {
      item.Details?.forEach((detail) => {
        const recipeType = detail.RecipeType || 'Unknown';
        acc[recipeType] = (acc[recipeType] || 0) + 1;
      });
      return acc;
    }, {});

    return {
      all: allCount,
      ...recipeTypeCounts,
    };
  }, [rowData]);

  // Get unique RecipeType values for tabs
  const recipeTypeTabs = useMemo(() => {
    const uniqueTypes = new Set();
    rowData.forEach((item) => {
      item.Details?.forEach((detail) => {
        if (detail.RecipeType) {
          uniqueTypes.add(detail.RecipeType);
        }
      });
    });
    return Array.from(uniqueTypes);
  }, [rowData]);

  // Handle row selection
  const onSelectionChanged = useCallback((params) => {
    const selectedRows = params.api.getSelectedRows();
    setSelectedPDOs(selectedRows.map((row) => row.PDOID));
  }, []);

  // Filter data based on search text and recipe type tab
  const filteredData = useMemo(() => {
    let data = rowData;

    // Apply recipe type filter based on selected tab
    if (filterTab !== 'all') {
      data = data.filter((item) => item.Details?.some((detail) => detail.RecipeType === filterTab));
    }

    // Apply search filter
    if (!searchText) return data;

    const lowerSearch = searchText.toLowerCase();
    return data.filter(
      (item) =>
        Object.values(item).some(
          (val) =>
            val &&
            (typeof val === 'string' || typeof val === 'number') &&
            val.toString().toLowerCase().includes(lowerSearch)
        ) ||
        item.Details?.some((detail) =>
          Object.values(detail).some(
            (val) =>
              val &&
              (typeof val === 'string' || typeof val === 'number') &&
              val.toString().toLowerCase().includes(lowerSearch)
          )
        )
    );
  }, [rowData, searchText, filterTab]);

  // Delete handler
  const handleDeletePDO = useCallback(async () => {
    if (!selectedPDO) return;

    try {
      const pdoId = selectedPDO.PDOID || selectedPDO.ID || selectedPDO.PDONo;
      const userId = userData?.userDetails?.userId;

      if (!pdoId) {
        enqueueSnackbar('PDO ID not found', { variant: 'error' });
        return;
      }

      const response = await Delete(`Production/DeleteProductionOrder/${pdoId}?lastUpdatedBy=${userId}`);

      if (response.status === 200) {
        enqueueSnackbar(response.data?.Message || 'PDO deleted successfully', {
          variant: 'success',
        });
        fetchPDOData(); // Refresh data
      } else {
        enqueueSnackbar(response.data?.Message || 'Failed to delete PDO', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting PDO:', error);
      enqueueSnackbar(error?.response?.data?.Message || 'Failed to delete PDO', {
        variant: 'error',
      });
    } finally {
      confirm.onFalse();
      setSelectedPDO(null);
    }
  }, [selectedPDO, userData, enqueueSnackbar, fetchPDOData, confirm]);

  // Delete action renderer
  const deleteActionRenderer = useCallback(
    (params) => (
      <Tooltip title="Delete PDO" arrow>
        <IconButton
          color="error"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPDO(params.data);
            confirm.onTrue();
          }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
        </IconButton>
      </Tooltip>
    ),
    [confirm]
  );

  // Sub Details button renderer
  const subDetailsRenderer = useCallback((params) => {
    const subDetails = params.data.SubDetails || [];
    const hasSubDetails = subDetails.length > 0;

    return (
      <Tooltip title="View BOM" arrow>
        <IconButton
          variant="outlined"
          size="small"
          disabled={!hasSubDetails}
          onClick={() => {
            if (hasSubDetails) {
              setSubDetailsDialog({
                open: true,
                subDetails,
                title: `BOM - ${params.data.RecipeName || 'Recipe'}`,
              });
            }
          }}
        >
          <Iconify icon="hugeicons:property-view" width={18} />
        </IconButton>
      </Tooltip>
    );
  }, []);

  // History Icon Renderer for detail section
  const historyIconRenderer = useCallback((params) => {
    const handleOpen = async () => {
      // eslint-disable-next-line
      const pidtlId = params.data?.PIDtlID;
      if (!pidtlId) {
        enqueueSnackbar('PIDtlID not found', { variant: 'warning' });
        return;
      }

      setLoadingHistory(true);
      try {
        const response = await Get(`GetDividedQtyByHistory?PIDtlID=${pidtlId}`);

        if (response.status === 200 && response.data) {
          // Handle both array response and object with Data property
          let data = [];
          if (Array.isArray(response.data)) {
            data = response.data;
          } else if (response.data.Data && Array.isArray(response.data.Data)) {
            data = response.data.Data;
          }

          // Group data by HistoryDtlID
          const groupedData = {};
          data.forEach((item) => {
            const historyDtlId = item.HistoryDtlID;
            if (!groupedData[historyDtlId]) {
              groupedData[historyDtlId] = [];
            }
            groupedData[historyDtlId].push(item);
          });

          // Convert to array of pairs (each pair is an array of items with same HistoryDtlID)
          const pairs = Object.values(groupedData);
          setHistoryData(pairs);
        } else {
          setHistoryData([]);
        }
        setOpen(true);
      } catch (error) {
        console.error('Error fetching history:', error);
        enqueueSnackbar('Error loading history', { variant: 'error' });
        setHistoryData([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    return (
      <Tooltip title="View History" arrow>
        <IconButton
          onClick={handleOpen}
          disabled={loadingHistory}
          size="small"
          sx={{ padding: '4px' }}
        >
          <Iconify icon="mdi:history" width={18} />
        </IconButton>
      </Tooltip>
    );
  }, [enqueueSnackbar, loadingHistory]);

  // Recipe Type renderer
  const recipeTypeRenderer = (params) => {
    const isCustomize = params.value === 'Customize';
    return (
      <div
        style={{
          fontSize: '14px',
          padding: '2px 8px',
          borderRadius: '4px',
          backgroundColor: isCustomize ? 'rgba(99, 145, 58, 0.1)' : 'rgba(25, 118, 210, 0.1)',
          color: isCustomize ? '#63913a' : '#1976d2',
          display: 'inline-block',
        }}
      >
        {params.value}
      </div>
    );
  };

  // Progress renderer for produced vs required
  const progressRenderer = (params) => {
    const produced = params.data.ProducedQtyKG || 0;
    const required = params.data.RequiredQtyKG || 0;
    const percentage = required > 0 ? (produced / required) * 100 : 0;

    // Determine color based on percentage
    let color = 'error'; // Red for < 50%
    if (percentage >= 100) {
      color = 'success'; // Green for 100%
    } else if (percentage >= 50) {
      color = 'warning'; // Orange for >= 50%
    }

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
        }}
      >
        <Box sx={{ width: '100px', px: 1 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(percentage, 100)}
            color={color}
            sx={{
              height: 8,
              borderRadius: 1,
            }}
          />
        </Box>
        <span>{fNumber(percentage) || 0}%</span>
      </Box>
    );
  };

  // Action buttons renderer
  const actionButtonsRenderer = useCallback(
    (params) => (
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
        <Tooltip title="View Details" arrow>
          <IconButton
            size="small"
            onClick={() => console.log('View PDO:', params.data.PDOID)}
            sx={{ padding: '4px' }}
          >
            <Iconify icon="solar:eye-bold" width={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit PDO" arrow>
          <IconButton
            size="small"
            onClick={() => console.log('Edit PDO:', params.data.PDOID)}
            sx={{ padding: '4px' }}
          >
            <Iconify icon="solar:pen-bold" width={18} />
          </IconButton>
        </Tooltip>
      </div>
    ),
    []
  );

  // Master Column Definitions
  const masterColumnDefs = useMemo(
    () => [
      {
        field: 'checkbox',
        headerName: '',
        maxWidth: 50,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        sortable: false,
        filter: false,
        resizable: false,
        lockPosition: 'left',
      },
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
        field: 'PDONo',
        headerName: 'PDO No',
        minWidth: 180,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'PDODate',
        headerName: 'PDO Date',
        minWidth: 120,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      {
        field: 'ProductionMonth',
        headerName: 'Production Month',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(params.value, 'MMM yyyy') : '-'),
      },
      {
        field: 'TotalRequiredKG',
        headerName: 'Total Required (KG)',
        minWidth: 150,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '0.00',
        cellStyle: { textAlign: 'right' },
      },
      {
        headerName: 'Order Count',
        minWidth: 120,
        valueGetter: (params) => params.data.Details?.length || 0,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
      },
      {
        headerName: '',
        minWidth: 60,
        maxWidth: 60,
        cellRenderer: deleteActionRenderer,
        sortable: false,
        filter: false,
        resizable: false,
        pinned: 'right',
        lockPosition: 'right',
      },
    ],
    [deleteActionRenderer]
  );

  // Detail Column Definitions (Order Details)
  const detailColumnDefs = useMemo(
    () => [
      {
        field: 'PINo',
        headerName: 'PI No.',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'CustomerName',
        headerName: 'Customer',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'BuyerName',
        headerName: 'Buyer',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'InitiativeName',
        headerName: 'Initiative',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'SustainabilityName',
        headerName: 'Sustainability',
        minWidth: 130,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'RecipeType',
        headerName: 'Recipe Type',
        minWidth: 120,
        filter: 'agSetColumnFilter',
        cellRenderer: recipeTypeRenderer,
      },
      {
        field: 'RecipeName',
        headerName: 'Recipe',
        minWidth: 250,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'ColorReference',
        headerName: 'Color Reference',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'RequiredKG',
        headerName: 'Required (KG)',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '0.00',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'ProducedKG',
        headerName: 'Produced (KG)',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '0.00',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'BalanceKG',
        headerName: 'Balance (KG)',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '0.00',
        cellStyle: { textAlign: 'right' },
      },
      {
        headerName: 'Progress',
        minWidth: 150,
        cellRenderer: progressRenderer,
        filter: false,
        sortable: false,
      },
      {
        field: 'DeliveryDate',
        headerName: 'Delivery Date',
        minWidth: 120,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : '-'),
      },
      {
        headerName: 'BOM',
        minWidth: 60,
        maxWidth: 88,
        cellRenderer: subDetailsRenderer,
        filter: false,
        sortable: false,
        cellStyle: { textAlign: 'center' },
        pinned: 'right',
        lockPosition: 'right',
      },
      {
        headerName: '',
        minWidth: 80,
        maxWidth: 80,
        cellRenderer: historyIconRenderer,
        filter: false,
        sortable: false,
        resizable: false,
        cellStyle: { textAlign: 'center' },
        pinned: 'right',
        lockPosition: 'right',
      },
    ],
    [subDetailsRenderer, historyIconRenderer]
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
        params.successCallback(params.data.Details || []);
      },
    }),
    [detailColumnDefs]
  );

  const handleTabChange = (event, newValue) => {
    setFilterTab(newValue);
  };

  const handleCloseSubDetailsDialog = () => {
    setSubDetailsDialog({
      open: false,
      subDetails: [],
      title: '',
    });
  };

  // Handle Save MRP
  const handleSaveMRP = async () => {
    if (selectedPDOs.length === 0) {
      enqueueSnackbar('Please select at least one PDO', { variant: 'warning' });
      return;
    }

    if (!mrpDate) {
      enqueueSnackbar('Please select MRP Date', { variant: 'error' });
      return;
    }

    try {
      // Get selected PDOs with their details
      const selectedPDOData = rowData.filter((pdo) => selectedPDOs.includes(pdo.PDOID));

      // Build Details array from selected PDOs - iterate through Details and their SubDetails
      const details = [];
      selectedPDOData.forEach((pdo) => {
        if (pdo.Details && Array.isArray(pdo.Details)) {
          pdo.Details.forEach((detail) => {
            // Each detail can have multiple SubDetails
            if (
              detail.SubDetails &&
              Array.isArray(detail.SubDetails) &&
              detail.SubDetails.length > 0
            ) {
              detail.SubDetails.forEach((subDetail) => {
                details.push({
                  PDOID: pdo.PDOID,
                  PIRFPLISTID: detail.PIRFPLISTID,
                  PDODetailID: detail.PDO_DetailID || detail.PDODetailID || null,
                  ItemID:
                    subDetail.ItemID !== undefined && subDetail.ItemID !== null
                      ? subDetail.ItemID
                      : null,
                  RecipeID: subDetail.RecipeID || detail.RecipeID || null,
                  RequiredQtyKG: subDetail.RequiredQty || 0,
                  ActualReqQty: subDetail.ActualReqQty || 0,
                });
              });
            } else {
              // Fallback: if no SubDetails, use detail level data
              details.push({
                PDOID: pdo.PDOID,
                PIRFPLISTID: detail.PIRFPLISTID,
                PDODetailID: detail.PDO_DetailID || detail.PDODetailID || null,
                ItemID: null, // ItemID is only in SubDetails
                RecipeID: detail.RecipeID || null,
                RequiredQtyKG: detail.RequiredKG || 0,
                ActualReqQty: detail.ActualReqQty || 0,
              });
            }
          });
        }
      });

      // Calculate TotalYieldKG (sum of all ActualReqQty)
      const totalYieldKG = details.reduce((sum, detail) => sum + (detail.ActualReqQty || 0), 0);

      // Format dates
      const mrpDateString = `${mrpDate.getFullYear()}-${String(mrpDate.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(mrpDate.getDate()).padStart(2, '0')}`;
      const productionMonth = `${selectedMonth.getFullYear()}-${String(
        selectedMonth.getMonth() + 1
      ).padStart(2, '0')}`;

      const requestBody = {
        MRPDate: mrpDateString,
        ProductionMonth: productionMonth,
        OrgID: userData?.userDetails?.orgId || 1,
        BranchID: userData?.userDetails?.branchID || 1,
        TotalYieldKG: parseFloat(totalYieldKG.toFixed(2)),
        Created_By: userData?.userDetails?.userId || 1,
        Details: details,
      };

      console.log('Submitting MRP data:', requestBody);

      const response = await Post('Production/SaveMRP', requestBody);

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('MRP saved successfully', { variant: 'success' });
        setSelectedPDOs([]); // Clear selections after successful save
        fetchPDOData(); // Refresh data

        // Navigate to next tab if callback provided
        if (onSaveSuccess) {
          onSaveSuccess();
        }
      } else {
        enqueueSnackbar('Error saving MRP', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error saving MRP:', error);
      enqueueSnackbar(error.message || 'Error saving MRP', {
        variant: 'error',
        autoHideDuration: 5000,
      });
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ width: '100%', height: '80vh' }}>
      {/* Filter Tabs */}
      {/* <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={filterTab} onChange={handleTabChange} aria-label="recipe type filter tabs">
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
          {recipeTypeTabs.map((recipeType) => (
            <Tab
              key={recipeType}
              value={recipeType}
              label={recipeType === 'standard' ? 'Standard' : 'Customer'}
              sx={{ minWidth: 'auto' }}
              icon={
                <Label
                  variant={filterTab === recipeType ? 'filled' : 'soft'}
                  color={recipeType === 'standard' ? 'primary' : 'secondary'}
                >
                  {tabCounts[recipeType] || 0}
                </Label>
              }
            />
          ))}
        </Tabs>
      </Box> */}

      {/* MRP Workflow - Step 1: Month Selection */}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <DesktopDatePicker
            label="Production Month"
            views={['month', 'year']}
            value={selectedMonth}
            onChange={handleMonthChange}
            format="MM-yyyy"
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
              },
            }}
          />
          <DesktopDatePicker
            label="MRP Date"
            value={mrpDate}
            onChange={(newValue) => setMrpDate(newValue)}
            format="dd MMM yyyy"
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveMRP}
            disabled={selectedPDOs.length === 0}
            startIcon={<Iconify icon="mdi:check" />}
            sx={{ minWidth: 150 }}
          >
            Save MRP ({selectedPDOs.length})
          </Button>
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
              rowSelection="multiple"
              onSelectionChanged={onSelectionChanged}
              domLayout="autoHeight"
            />
          </div>
        </Scrollbar>
      </Box>

      {/* Sub Details Dialog */}
      <Dialog
        open={subDetailsDialog.open}
        onClose={handleCloseSubDetailsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            {subDetailsDialog.title}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Item Description</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Required Qty</strong>
                  </TableCell>
                  <TableCell>
                    <strong>UOM</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Recipe</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subDetailsDialog.subDetails.map((subDetail, index) => (
                  <TableRow key={index}>
                    <TableCell>{subDetail.ItemDescription || 'N/A'}</TableCell>
                    <TableCell align="right">{fNumber(subDetail.RequiredQty) || '0.00'}</TableCell>
                    <TableCell>{subDetail.UOMID === 1 ? 'KG' : 'LBS'}</TableCell>
                    <TableCell>
                      {subDetail.RecipeID ? `Recipe ${subDetail.RecipeID}` : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
                {subDetailsDialog.subDetails.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="textSecondary">
                        No sub details available
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubDetailsDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete PDO"
        content={`Are you sure you want to delete PDO ${selectedPDO?.PDONo || ''
          }? This action cannot be undone.`}
        action={
          <Button variant="contained" color="error" onClick={handleDeletePDO}>
            Delete
          </Button>
        }
      />

      {/* History Dialog */}
      <Dialog open={open} fullWidth maxWidth="lg" onClose={() => setOpen(false)}>
        <DialogTitle>Quantity Division History</DialogTitle>
        <DialogContent>
          {loadingHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <LoadingScreen />
            </Box>
          ) : historyData.length > 0 ? (
            <Stack spacing={3} sx={{ mt: 2 }}>
              {historyData.map((pair, pairIndex) => (
                <Card key={pairIndex} sx={{ p: 2 }}>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Reapproval Date: {fDateTime(pair[0]?.ReapprovedDate, 'dd MMM yyyy hh:mm:ss a')}
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Typography variant="body2">
                        <strong>Original Qty:</strong> {fNumber(pair[0]?.OriginalQTY || 0)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Divided Qty per Row:</strong> {fNumber(pair[0]?.DividedQtyPerRow || 0)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Total Rows:</strong> {pair[0]?.TotalRowsPerHistoryDtlID || 0}
                      </Typography>
                    </Stack>
                  </Stack>
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Scrollbar>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ minWidth: 150 }}>Item Code</TableCell>
                            <TableCell sx={{ minWidth: 200 }}>Description</TableCell>
                            <TableCell sx={{ minWidth: 120 }}>Color Name</TableCell>
                            <TableCell align="right" sx={{ minWidth: 100 }}>
                              Original Qty
                            </TableCell>
                            <TableCell align="right" sx={{ minWidth: 120 }}>
                              Divided Qty per Row
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {pair.map((row, index) => (
                            <TableRow key={index}>
                              <TableCell>{row.Item_Code || '-'}</TableCell>
                              <TableCell>{row.Description || '-'}</TableCell>
                              <TableCell>{row.ColorName || '-'}</TableCell>
                              <TableCell align="right">{fNumber(row.OriginalQTY || 0)}</TableCell>
                              <TableCell align="right">{fNumber(row.DividedQtyPerRow || 0)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Scrollbar>
                  </TableContainer>
                </Card>
              ))}
            </Stack>
          ) : (
            <EmptyContent title="No History Data" sx={{ py: 8 }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionOpenGridPDO;
ProductionOpenGridPDO.propTypes = {
  setPdoDataLength: PropTypes.func,
  onSaveSuccess: PropTypes.func,
};
