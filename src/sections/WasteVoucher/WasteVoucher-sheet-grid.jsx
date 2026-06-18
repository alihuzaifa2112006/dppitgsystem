import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Delete, Get, Put } from 'src/api/apibasemethods';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { Box, TextField, InputAdornment, Button, IconButton, Tooltip } from '@mui/material';
import { Stack } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { fDate } from 'src/utils/format-time';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

const WasteProductionVouchersGrid = () => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [zoomLevel, setZoomLevel] = useState(1);
  const navigate = useNavigate();
  const confirm = useBoolean();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedPIID, setSelectedPIID] = useState(null);
  // Fetch waste production vouchers
  const fetchWasteProductionVouchers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await Get(
        `ItemVoucher/GetAll?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      if (response.status === 200 && response.data.Success) {
        setReportData(response.data.Data || []);
      } else {
        setReportData([]);
        enqueueSnackbar(response.data?.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load vouchers', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar]);

  useEffect(() => {
    fetchWasteProductionVouchers();
  }, [fetchWasteProductionVouchers]);
  const actionButtonsRenderer = useCallback(
    (params) => (
      <div style={{ display: 'flex', gap: '4px' }}>
        {editButtonRenderer(params)}
        {pdfButtonRenderer(params)}
        {deleteButtonRenderer(params)}

      </div>
    ),
    // eslint-disable-next-line
    []
  );

  const editButtonRenderer = (params) => (
    <Tooltip title="Edit" arrow>
      <IconButton
        onClick={() => moveToEditForm(params.data.VID)}
        size="small"
        // disabled={params.data.AllApproved}
        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:pen-bold" width={18} />
      </IconButton>
    </Tooltip>
  );

  const moveToEditForm = (VID) => {
    navigate(paths.dashboard.Production.WasteVoucher.edit(VID));
  };




  const DeleteVoucher = async () => {
    if (!selectedPIID) {
      enqueueSnackbar('Voucher not selected.', { variant: 'error' });
      return;
    }
    try {
      const response = await Put(
        `ItemVoucher/Delete?VID=${selectedPIID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&UpdatedBy=${userData?.userDetails?.userId}`
      );

      if (response.status === 200 && response.data.Success) {
        enqueueSnackbar('Voucher deleted successfully', { variant: 'success' });
        fetchWasteProductionVouchers();
      } else {
        enqueueSnackbar('Failed to delete voucher', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting Voucher:', error);
      enqueueSnackbar('Error deleting Voucher', { variant: 'error' });
    }
  };

  const deleteButtonRenderer = (params) => (
    <Tooltip title="Delete" arrow>
      <IconButton
        onClick={() => {
          setSelectedPIID(params.data.VID);
          confirm.onTrue();
        }}
        size="small"
        disabled={
          params.data.Level1_Approve === 'Approved' ||
          params.data.Level2_Approve === 'Approved' ||
          params.data.Level3_Approve === 'Approved'
        }
        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:trash-bin-trash-bold" width="20" height="20" />
      </IconButton>
    </Tooltip>
  );

  const pdfButtonRenderer = (params) => (
    <Tooltip title="View PDF" arrow>
      <IconButton onClick={() => moveToPDF(params.data.VID)} size="small" sx={{ padding: '4px' }}>
        <Iconify icon="mdi:file-pdf-box" width={18} />
      </IconButton>
    </Tooltip>
  );

  const moveToPDF = (Voucher_ID) => {
    // navigate(paths.dashboard.Production.WasteVoucher.pdf(Voucher_ID));
    navigate(paths.dashboard.Production.WasteVoucher.pdf(Voucher_ID));
  };
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

  // Master Column Definitions
  const [masterColumnDefs] = useState([
    {
      field: 'expand',
      headerName: '',
      maxWidth: 50,
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: { suppressCount: true },
    },

    { field: 'VoucherNo', headerName: 'Voucher No', minWidth: 150 },
    {
      field: 'VoucherDate',
      headerName: 'Date',
      minWidth: 120,
      valueFormatter: (params) => fDate(params.value),
    },
    { field: 'PDONO', headerName: 'Production No.', minWidth: 150 },
    { field: 'DepartmentName', headerName: 'Department Name', minWidth: 140 },
    { field: 'SectionName', headerName: 'Section Name', minWidth: 140 },
    { field: 'TransferDepartmentName', headerName: 'Transfer to Department', minWidth: 140 },
    { field: 'TransferSectionName', headerName: 'Transfer to Section', minWidth: 140 },
    { field: 'StoreName', headerName: 'Location', minWidth: 140 },

    { field: 'ShiftName', headerName: 'Shift Name', minWidth: 120 },

    {
      field: 'actions',
      headerName: '',
      maxWidth: 100,
      pinned: 'right',
      cellRenderer: actionButtonsRenderer,
    },
  ]);

  // Detail Column Definitions
  const [detailColumnDefs] = useState([
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
    { field: 'ItemCode', headerName: 'Item Code', width: 180 },
    { field: 'ItemDescription', headerName: 'Item Name', width: 260 },
    {
      field: 'TransferQty',
      headerName: 'Transfer Qty',
      width: 120,
      valueFormatter: (p) => fNumber(p.value),
    },
    // {
    //   field: 'RemainingQty',
    //   headerName: 'Remaining Qty',
    //   width: 130,
    //   valueFormatter: (p) => fNumber(p.value),
    // },
    { field: 'UOMName', headerName: 'UOM', width: 100 },
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
          // sx={{ width: 300 }}
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
            <ConfirmDialog
              open={confirm.value}
              onClose={() => {
                confirm.onFalse();
                setSelectedPIID(null);
              }}
              title="Delete"
              content="Are you sure want to delete?"
              action={
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    DeleteVoucher();

                    confirm.onFalse();
                  }}
                >
                  Delete
                </Button>
              }
            />
          </div>
        </Scrollbar>
      </Box>
    </Box>
  );
};

export default WasteProductionVouchersGrid;
