import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get, Delete } from 'src/api/apibasemethods';
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
  LinearProgress,
} from '@mui/material';
import { Stack } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';
import PropTypes from 'prop-types';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

const ProductionOpenGridMRP = ({ setMrpDataLength }) => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [zoomLevel, setZoomLevel] = useState(1);
  const confirm = useBoolean();
  const [selectedMRP, setSelectedMRP] = useState(null);

  // State for grid data
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  // Fetch MRP data
  const fetchMRPData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `MRP/GetAllMRP?OrgID=${userData?.userDetails?.orgId || 1}&BranchID=${userData?.userDetails?.branchID || 6
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
        setRowData(data);
        if (setMrpDataLength) {
          setMrpDataLength(data.length);
        }
      } else {
        setRowData([]);
        enqueueSnackbar(response.data?.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load MRP data', { variant: 'error' });
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar, setMrpDataLength]);

  useEffect(() => {
    fetchMRPData();
  }, [fetchMRPData]);

  // Filter data based on search text
  const filteredData = useMemo(() => {
    if (!searchText) return rowData;

    const lowerSearch = searchText.toLowerCase();
    return rowData.filter(
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
  }, [rowData, searchText]);

  // Delete handler
  const handleDeleteMRP = useCallback(async () => {
    if (!selectedMRP) return;

    try {
      const mrpId = selectedMRP.MRPID || selectedMRP.ID || selectedMRP.MRPNo;
      const userId = userData?.userDetails?.userId;

      if (!mrpId) {
        enqueueSnackbar('MRP ID not found', { variant: 'error' });
        return;
      }

      const response = await Delete(`Production/DeleteMRP/${mrpId}?LastUpdated_By=${userId}`);

      if (response.status === 200) {
        enqueueSnackbar(response.data?.Message || 'MRP deleted successfully', {
          variant: 'success',
        });
        fetchMRPData(); // Refresh data
      } else {
        enqueueSnackbar(response.data?.Message || 'Failed to delete MRP', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting MRP:', error);
      enqueueSnackbar(error?.response?.data?.Message || 'Failed to delete MRP', {
        variant: 'error',
      });
    } finally {
      confirm.onFalse();
      setSelectedMRP(null);
    }
  }, [selectedMRP, userData, enqueueSnackbar, fetchMRPData, confirm]);

  // Delete action renderer
  const deleteActionRenderer = useCallback(
    (params) => (
      <Tooltip title="Delete MRP" arrow>
        <IconButton
          color="error"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedMRP(params.data);
            confirm.onTrue();
          }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
        </IconButton>
      </Tooltip>
    ),
    [confirm]
  );

  // Progress renderer for produced vs required using LinearProgress
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
        field: 'MRPNo',
        headerName: 'MRP No',
        minWidth: 180,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'MRPDate',
        headerName: 'MRP Date',
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
        field: 'TotalYieldKG',
        headerName: 'Total Yield (KG)',
        minWidth: 150,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '0.00',
        cellStyle: { textAlign: 'right' },
      },
      {
        headerName: 'Item Count',
        minWidth: 120,
        valueGetter: (params) => params.data.Details?.length || 0,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'CreatedByName',
        headerName: 'Created By',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'Created_On',
        headerName: 'Created On',
        minWidth: 150,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(params.value, 'dd MMM yyyy p') : '-'),
      },
      {
        headerName: '',
        minWidth: 60,
        maxWidth: 60,
        cellRenderer: deleteActionRenderer,
        sortable: false,
        filter: false,
        pinned: 'right',
        resizable: false,
        lockPosition: 'right',
      },
    ],
    [deleteActionRenderer]
  );

  // Detail Column Definitions (MRP Details)
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
        field: 'ItemCode',
        headerName: 'Item Code',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'ItemDescription',
        headerName: 'Item Description',
        minWidth: 300,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'RequiredQtyKG',
        headerName: 'Required (KG)',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '0.00',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'ProducedQtyKG',
        headerName: 'Produced (KG)',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '0.00',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'BalanceQtyKG',
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
        maxWidth: 180,
        cellRenderer: progressRenderer,
        filter: false,
        sortable: false,
      },
    ],
    []
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

  const onFirstDataRendered = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ width: '100%', height: '80vh' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Search MRP, Item Code, Description..."
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
              onFirstDataRendered={onFirstDataRendered}
              domLayout="autoHeight"
            />
          </div>
        </Scrollbar>
      </Box>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete MRP"
        content={`Are you sure you want to delete MRP ${selectedMRP?.MRPNo || ''
          }? This action cannot be undone.`}
        action={
          <Button variant="contained" color="error" onClick={handleDeleteMRP}>
            Delete
          </Button>
        }
      />
    </Box>
  );
};

export default ProductionOpenGridMRP;
ProductionOpenGridMRP.propTypes = {
  setMrpDataLength: PropTypes.func,
};
