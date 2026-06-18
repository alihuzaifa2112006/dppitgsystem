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
  // Fetch Material Price data
  const fetchWasteProductionVouchers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `CostingPlan/GetAll?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      if (response.status === 200) {
        // Response is directly an array or wrapped in data
        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.Data || response.data?.data || [];
        setReportData(data);
      } else {
        setReportData([]);
        enqueueSnackbar(response.data?.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load Material Price data', { variant: 'error' });
      setReportData([]);
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar]);

  const moveToEditForm = useCallback(
    (CostingPlanID) => {
      navigate(paths.dashboard.AIPlans.CostingPlan.edit(CostingPlanID));
    },
    [navigate]
  );

  const editButtonRenderer = useCallback(
    (params) => (
      <Tooltip title="Edit" arrow>
        <IconButton
          onClick={() => moveToEditForm(params.data.CostingPlanID)}
          size="small"
          sx={{ padding: '4px' }}
        >
          <Iconify icon="solar:pen-bold" width={18} />
        </IconButton>
      </Tooltip>
    ),
    [moveToEditForm]
  );

  useEffect(() => {
    fetchWasteProductionVouchers();
  }, [fetchWasteProductionVouchers]);
  const actionButtonsRenderer = useCallback(
    (params) => (
      <div style={{ display: 'flex', gap: '2px' }}>
        {/* {pdfButtonRenderer(params)} */}
        {deleteButtonRenderer(params)}
        {editButtonRenderer(params)}
      </div>
    ),
    // eslint-disable-next-line
    []
  );

  const DeleteVoucher = async () => {
    if (!selectedPIID) {
      enqueueSnackbar('Material Price not selected.', { variant: 'error' });
      return;
    }
    console.log(selectedPIID);
    try {
      const response = await Delete(`AICosting/Delete/${selectedPIID}`);
      if (response.status === 200) {
        enqueueSnackbar('Material Price deleted successfully', { variant: 'success' });
        fetchWasteProductionVouchers();
      } else {
        enqueueSnackbar('Failed to delete Material Price', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting Material Price:', error);
      enqueueSnackbar('Error deleting Material Price', { variant: 'error' });
    }
  };

  const deleteButtonRenderer = (params) => (
    <Tooltip title="Delete" arrow>
      <IconButton
        onClick={() => {
          setSelectedPIID(params.data.CostingPlanID);
          confirm.onTrue();
        }}
        size="small"
        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:trash-bin-trash-bold" width="20" height="20" />
      </IconButton>
    </Tooltip>
  );

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
      field: 'Blend_Type_Name',
      headerName: 'Fiber Class',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'Inv_Cat_Name',
      headerName: 'Fiber Category',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'SubCat_Name',
      headerName: 'Fiber Sub Category',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    // ColorFamilyName
    {
      field: 'ColorFamilyName',
      headerName: 'Color Family',
      minWidth: 120,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'Origin_Name',
      headerName: 'Origin',
      minWidth: 120,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'price',
      headerName: 'Price per Kg',
      minWidth: 40,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => {
        if (params.value !== null && params.value !== undefined) {
          return `$${fNumber(params.value, 5)}`;
        }
        return '';
      },
    },
    {
      field: 'actions',
      headerName: '',
      maxWidth: 220,
      pinned: 'right',
      sortable: false,
      filter: false,
      resizable: false,
      // suppressSizeToFit: true,
      cellRenderer: actionButtonsRenderer,
      lockPosition: 'right',
      cellStyle: { textAlign: 'center' },
    },
  ]);

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
              defaultColDef={{
                resizable: true,
                sortable: true,
                filter: true,
              }}
              // masterDetail
              // detailCellRendererParams={detailCellRendererParams}
              rowHeight={30}
              headerHeight={30}
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
