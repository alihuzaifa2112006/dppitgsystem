import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Delete, Get } from 'src/api/apibasemethods';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { Box, TextField, InputAdornment, Button, IconButton, Tooltip } from '@mui/material';
import { Stack } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
import { paths } from 'src/routes/paths';
import { useNavigate } from 'react-router';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

const WasteTransferVouchersGrid = () => {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const confirm = useBoolean();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [zoomLevel, setZoomLevel] = useState(1);

  // State for grid data
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedPIID, setSelectedPIID] = useState(null);

  // Fetch waste transfer vouchers
  const fetchWasteTransferVouchers = useCallback(async () => {
    try {
      setLoading(true);
      const orgId = userData?.userDetails?.orgId || 1;
      const branchId = userData?.userDetails?.branchID || 6;

      const response = await Get(`ItemTransfer/GetAll?OrgID=${orgId}&BranchID=${branchId}`);

      if (response?.data?.Success) {
        setReportData(response.data.Data || []);
      } else {
        setReportData([]);
        enqueueSnackbar(response?.data?.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load waste transfer vouchers', { variant: 'error' });
      setReportData([]);
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar]);

  useEffect(() => {
    fetchWasteTransferVouchers();
  }, [fetchWasteTransferVouchers]);

  // Filter data based on search text
  const filteredData = useMemo(() => {
    if (!searchText) return reportData;

    const lowerSearch = searchText.toLowerCase();
    return reportData.filter((item) =>
      Object.values(item).some(
        (val) =>
          val &&
          (typeof val === 'string' || typeof val === 'number') &&
          val.toString().toLowerCase().includes(lowerSearch)
      )
    );
  }, [reportData, searchText]);

  const moveToPDFView = (transferId) => {
    navigate(paths.dashboard.Production.TransferVoucher.pdf(transferId));
  };

  const pdfButtonRenderer = (params) => (
    <Tooltip title="View PDF" arrow>
      <IconButton
        onClick={() => moveToPDFView(params.data.TransferID)}
        size="small"
        sx={{ padding: '4px' }}
      >
        <Iconify icon="mdi:file-pdf-box" width="20" height="20" />
      </IconButton>
    </Tooltip>
  );

  const moveToEditView = (transferId) => {
    navigate(paths.dashboard.Production.TransferVoucher.edit(transferId));
  };

  const editButtonRenderer = (params) => (
    <Tooltip title="Edit" arrow>
      <IconButton
        onClick={() => moveToEditView(params.data.TransferID)}
        size="small"
        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:pen-bold" width="20" height="20" />
      </IconButton>
    </Tooltip>
  );

  const deleteProformaInvoice = async () => {
    if (!selectedPIID) {
      enqueueSnackbar('Proforma ID not selected.', { variant: 'error' });
      return;
    }
    try {
      // const response = await Delete(`ItemTransfer/SoftDelete?TransferID=${selectedPIID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}UserID=${userData?.userDetails?.userId}`);
      // SoftDelete?OrgID=1&BranchID=6&TransferID=1&UserID=8
      const response = await Delete(`ItemTransfer/SoftDelete?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&TransferID=${selectedPIID}&UserID=${userData?.userDetails?.userId}`);
      if (response.status === 200) {
        enqueueSnackbar('Transfer Voucher deleted successfully', { variant: 'success' });
        fetchWasteTransferVouchers();
      } else {
        enqueueSnackbar('Failed to delete Transfer Voucher', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting Transfer Voucher:', error);
      enqueueSnackbar('Error deleting Transfer Voucher', { variant: 'error' });
    }
  };


  const deleteButtonRenderer = (params) => (
    <Tooltip title="Delete" arrow>
      <IconButton
        onClick={() => {
          setSelectedPIID(params.data.TransferID);
          confirm.onTrue();
        }}
        size="small"

        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:trash-bin-trash-bold" width="20" height="20" />
      </IconButton>
    </Tooltip>
  );

  const actionButtonsRenderer = (params) => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {editButtonRenderer(params)}
      {pdfButtonRenderer(params)}
      {deleteButtonRenderer(params)}</div>
  );

  // Master Column Definitions
  // Master Column Definitions
  const [masterColumnDefs] = useState([
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
      field: 'TransferNo',
      headerName: 'Transfer No',
      width: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'TransferDate',
      headerName: 'Date',
      width: 120,
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => fDate(params.value),
    },
    {
      field: 'ToDeptName',
      headerName: 'To Department',
      width: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'SectionName',
      headerName: 'To Section',
      width: 150,
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => params.value || '-',
    },
    {
      field: 'ToLocationName',
      headerName: 'To Location',
      width: 120,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'CreatedByName',
      headerName: 'Created By',
      width: 180,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'actions',
      headerName: '',
      minWidth: 120,
      maxWidth: 120,
      pinned: 'right',
      sortable: false,
      filter: false,
      resizable: false,
      suppressSizeToFit: true,
      cellRenderer: actionButtonsRenderer,
      lockPosition: 'right',
      cellStyle: { textAlign: 'center' },
    },
  ]);

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
  // Detail grid configuration
  const detailCellRendererParams = useMemo(
    () => ({
      detailGridOptions: {
        columnDefs: [
          {
            field: 'Types',
            headerName: 'Type',
            minWidth: 100,
            filter: 'agTextColumnFilter',
            cellStyle: (params) => {
              if (params.value === 'Waste') {
                return { color: '#c62828' };
                // eslint-disable-next-line
              } else if (params.value === 'Output') {
                return { color: '#2e7d32' };
                // eslint-disable-next-line
              } else if (params.value === 'Input') {
                return { color: '#1565c0' };
              }
              return null;
            },
          },
          {
            field: 'ItemCode',
            headerName: 'Item Code',
            width: 150,
            filter: 'agTextColumnFilter',
            valueFormatter: (params) => params.value || '-',
          },
          {
            field: 'ItemDescription',
            headerName: 'Item Description',
            width: 250,
            filter: 'agTextColumnFilter',
            valueFormatter: (params) => params.value || '-',
          },
          {
            field: 'VoucherQty',
            headerName: 'Quantity',
            width: 100,
            filter: 'agNumberColumnFilter',
            cellStyle: { textAlign: 'right' },
            valueFormatter: (params) => fNumber(params.value),
          },
          {
            field: 'UOMName',
            headerName: 'UOM',
            width: 80,
            filter: 'agTextColumnFilter',
            valueFormatter: (params) => params.value || '-',
          },
          {
            field: 'DetailCreatedByName',
            headerName: 'Created By',
            width: 180,
            filter: 'agTextColumnFilter',
          },
        ],
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
    []
  );

  // Handle zoom in/out
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2)); // Max zoom 200%
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5)); // Min zoom 50%
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
          <Tooltip title="Zoom Out">
            <IconButton
              onClick={handleZoomOut}
              color="primary"
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <Iconify icon="si:zoom-out-duotone" width={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Reset Zoom">
            <Button onClick={handleZoomReset} variant="outlined" size="small" sx={{ minWidth: 40 }}>
              {Math.round(zoomLevel * 100)}%
            </Button>
          </Tooltip>

          <Tooltip title="Zoom In">
            <IconButton
              onClick={handleZoomIn}
              color="primary"
              sx={{ border: '1px solid', borderColor: 'divider' }}
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
              domLayout="autoHeight"
              enableCellTextSelection
              ensureDomOrder
            />
          </div>
        </Scrollbar>
      </Box>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
          setSelectedPIID(null); // Clear selected PIID on close
        }}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              deleteProformaInvoice();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </Box>
  );
};

export default WasteTransferVouchersGrid;
