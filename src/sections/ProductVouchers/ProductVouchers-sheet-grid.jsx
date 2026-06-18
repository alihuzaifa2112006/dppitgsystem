import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get } from 'src/api/apibasemethods';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { Box, TextField, InputAdornment, Button, IconButton, Tooltip } from '@mui/material';
import { Stack } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { paths } from 'src/routes/paths';
import { useNavigate } from 'react-router';
import { fDate } from 'src/utils/format-time';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

const ProductVoucherGrid = () => {
  const settings = useSettingsContext();
  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [zoomLevel, setZoomLevel] = useState(1);

  // State for grid data
  const [masterData, setMasterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [detailCache, setDetailCache] = useState(new Map()); // Cache for details

  const actionButtonsRenderer = useCallback(
    (params) => (
      <div style={{ display: 'flex', gap: '4px',justifyContent: 'center' }}>
        {viewButtonRenderer(params)}
        {pdfButtonRenderer(params)}
      </div>
    ),
    // eslint-disable-next-line
    []
  );

  const viewButtonRenderer = (params) => (
    <Tooltip title="View Details" arrow>
      <IconButton
        onClick={() => moveToViewForm(params.data.ProdVoucherID)}
        size="small"
        sx={{ padding: '4px' }}
        disabled
      >
        <Iconify icon="solar:eye-bold" width={18} />
      </IconButton>
    </Tooltip>
  );

  const moveToViewForm = (ProdVoucherID) => {
    navigate(paths.dashboard.Production.ProductRequest.view(ProdVoucherID));
  };

  const pdfButtonRenderer = (params) => (
    <Tooltip title="Edit" arrow>
      <IconButton onClick={() => moveToPDF(params.data.ProdVoucherID)} size="small" sx={{ padding: '4px' }} disabled>
        <Iconify icon="solar:pen-bold" width={18} />
      </IconButton>
    </Tooltip>
  );

  const moveToPDF = (ProdVoucherID) => {
    navigate(paths.dashboard.Production.ProductRequest.pdf(ProdVoucherID));
  };

  // Fetch production PI vouchers
  const fetchProductionVouchers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `Production/GetProductionPIVouchers?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );

      if (response.status === 200 && response.data.Success) {
        const formattedMasterData = (response.data.Data || []).map((masterItem) => ({
          ...masterItem,
        }));

        setMasterData(formattedMasterData);
      } else {
        setMasterData([]);
        enqueueSnackbar(response.data?.Message || 'No production vouchers found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load production vouchers', { variant: 'error' });
      setMasterData([]);
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar]);

  // Fetch detail data for a specific voucher
  const fetchVoucherDetails = useCallback(async (prodVoucherID) => {
    try {
      // Check cache first
      if (detailCache.has(prodVoucherID)) {
        return detailCache.get(prodVoucherID);
      }

      const response = await Get(
        `Production/GetProductionPIVoucherDetails?ProdVoucherID=${prodVoucherID}`
      );

      if (response.status === 200 && response.data.Success) {
        const details = response.data.Data || [];
        // Update cache
        setDetailCache(prev => new Map(prev).set(prodVoucherID, details));
        return details;
      }
      return [];
    } catch (error) {
      console.error(`Failed to load details for voucher ${prodVoucherID}:`, error);
      return [];
    }
  }, [detailCache]);

  useEffect(() => {
    fetchProductionVouchers();
  }, [fetchProductionVouchers]);

  // Prepare row data
  const rowData = useMemo(
    () =>
      masterData.map((masterItem) => ({
        ...masterItem,
      })),
    [masterData]
  );

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
        lockPosition: 'left',
      },
      {
        field: 'VoucherNo',
        headerName: 'Voucher No',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ProductionDate',
        headerName: 'Production Date',
        minWidth: 150,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      {
        field: 'ShiftName',
        headerName: 'Shift',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'CreatedBy',
        headerName: 'Created By',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'CreatedDate',
        headerName: 'Created Date',
        minWidth: 150,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(params.value) : '-'),
      },
      {
        headerName: 'Items Count',
        minWidth: 120,
        valueGetter: (params) => {
          const details = detailCache.get(params.data.ProdVoucherID);
          return details ? details.length : 0;
        },
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'Remarks',
        headerName: 'Remarks',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'actions',
        headerName: 'Actions',
        maxWidth: 100,
        pinned: 'right',
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: actionButtonsRenderer,
        lockPosition: 'center',
        cellStyle: { textAlign: 'center' },
      },
    ],
    [actionButtonsRenderer, detailCache]
  );

  // Detail Column Definitions (Read-only)
  const detailColumnDefs = useMemo(
    () => [
      {
        field: 'PINo',
        headerName: 'PI No',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
      {
        field: 'ColorName',
        headerName: 'Color',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'YarnCountName',
        headerName: 'Yarn Count',
        minWidth: 120,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'YarnType',
        headerName: 'Yarn Type',
        minWidth: 120,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'CompositionName',
        headerName: 'Composition',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      // {
      //   field: 'FabricType',
      //   headerName: 'Fabric Type',
      //   minWidth: 120,
      //   filter: 'agTextColumnFilter',
      //   valueFormatter: (params) => params.value || '-',
      // },
      {
        field: 'IsPly',
        headerName: 'Ply',
        minWidth: 80,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value ? 'Yes' : 'No',
        cellStyle: { textAlign: 'center' },
      },
      {
        field: 'PlyValue',
        headerName: 'Ply Value',
        minWidth: 100,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => fNumber(params.value) || '-',
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'ProducedQty',
        headerName: 'Produced Qty',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => `${fNumber(params.value) || 0} ${params.data.UOMName}`,
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'UOMName',
        headerName: 'UOM',
        minWidth: 80,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Remarks',
        headerName: 'Remarks',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
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
      editable: false, // All columns are read-only
    }),
    []
  );

  // Custom detail cell renderer to fetch details on demand
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
      getDetailRowData: async (params) => {
        const prodVoucherID = params.data.ProdVoucherID;
        
        // Check cache first
        if (detailCache.has(prodVoucherID)) {
          params.successCallback(detailCache.get(prodVoucherID));
          return;
        }

        // Otherwise fetch details
        try {
          const details = await fetchVoucherDetails(prodVoucherID);
          params.successCallback(details);
        } catch (error) {
          console.error('Error fetching details:', error);
          params.successCallback([]);
        }
      },
    }),
    [detailColumnDefs, detailCache, fetchVoucherDetails]
  );

  // Filter data based on search text
  const filteredData = useMemo(() => {
    if (!searchText) return rowData;

    const lowerSearch = searchText.toLowerCase();
    return rowData.filter((item) =>
      Object.values(item).some(
        (val) =>
          val &&
          (typeof val === 'string' || typeof val === 'number') &&
          val.toString().toLowerCase().includes(lowerSearch)
      )
    );
  }, [rowData, searchText]);

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

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ width: '100%', height: '80vh', p: 2 }}>
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
            />
          </div>
        </Scrollbar>
      </Box>
    </Box>
  );
};

export default ProductVoucherGrid;