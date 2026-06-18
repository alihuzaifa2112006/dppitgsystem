import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AgGridReact } from 'ag-grid-react';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { useBoolean } from 'src/hooks/use-boolean';
import { Delete, Get, Put } from 'src/api/apibasemethods';

import { LoadingScreen } from 'src/components/loading-screen';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/custom-dialog';

import OriginFactorDialog from '../AddDialog';
import OriginFactorEditDialog from '../EditDialog';
import { fDate } from 'src/utils/format-time';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

// ----------------------------------------------------------------------

export default function OriginFactorListView() {
  const navigate = useNavigate();
  const gridRef = useRef();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Fetching data:
  const [rowData, setRowData] = useState([]);
  const [currentRowData, setCurrentRowData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);

  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();

  // -------------------------------------

  const [dialogOpen, setDialogOpen] = useState(false);

  const FetchOriginFactor = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `GetAllOriginFactor?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      const data = response?.data || [];

      // Use the data directly from API response
      setRowData(data);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load Origin Factors', { variant: 'error' });
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = useCallback(() => {
    FetchOriginFactor();
    setDialogOpen(false);
  }, [FetchOriginFactor]);
  // -------------------------------------

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditDialogOpen = useCallback((rwData) => {
    setEditDialogOpen(true);
    setCurrentRowData(rwData);
  }, []);

  const handleEditDialogClose = useCallback(() => {
    FetchOriginFactor();
    setEditDialogOpen(false);
  }, [FetchOriginFactor]);
  // -------------------------------------

  

  useEffect(() => {
    FetchOriginFactor();
  }, [FetchOriginFactor]);

  // Filter data based on search text
  const filteredData = useMemo(() => {
    if (!searchText) return rowData;

    const lowerSearch = searchText.toLowerCase();
    return rowData.filter(
      (item) =>
        item.FiberCategoryName?.toLowerCase().includes(lowerSearch) ||
        item.FiberSubCategoryName?.toLowerCase().includes(lowerSearch) ||
        item.PriorityName?.toLowerCase().includes(lowerSearch) ||
        item.OriginName?.toLowerCase().includes(lowerSearch)
    );
  }, [rowData, searchText]);

  // Edit Functions
  const moveToEditForm = useCallback(
    (rwData) => {
      handleEditDialogOpen(rwData);
    },
    [handleEditDialogOpen]
  );

  const DeleteDetailTableRow = async (row) => {
    if (!row?.COP_ID) {
      enqueueSnackbar('Origin Factor ID not found', { variant: 'error' });
      return;
    }

    try {
      const res = await Delete(`DeleteOriginFactor?id=${row.COP_ID}`);
      enqueueSnackbar(res?.data?.Message || 'Deleted successfully', { variant: 'success' });
      FetchOriginFactor();
    } catch (error) {
      console.error('Error deleting Origin Factor:', error);
      enqueueSnackbar(error?.response?.data?.Message || 'Delete failed', { variant: 'error' });
    }
  };

  // Action buttons renderer
  const actionButtonsRenderer = useCallback(
    (params) => (
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
        {/* <Tooltip title="Edit OriginFactor" arrow>
          <IconButton
            size="small"
            onClick={() => moveToEditForm(params.data)}
            sx={{ padding: '4px' }}
          >
            <Iconify icon="solar:pen-bold" width={18} />
          </IconButton>
        </Tooltip> */}
        <Tooltip title="Delete OriginFactor" arrow>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              confirm.onTrue();
              setCurrentRowData(params.data);
            }}
            sx={{ padding: '4px' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
          </IconButton>
        </Tooltip>
      </div>
    ),
    [confirm]
  );

  // Master Column Definitions
  const masterColumnDefs = useMemo(
    () => [
      // CreatedDate
      {
        field: 'CreatedDate',
        headerName: ' Date',
        minWidth: 180,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => {
          if (!params.value) return '-';
          return fDate(params.value).toLocaleString();
        },
      },
      {
        field: 'FiberCategoryName',
        headerName: 'Fiber Category',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'FiberSubCategoryName',
        headerName: 'Fiber Sub Category',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'PriorityName',
        headerName: 'Priority',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'OriginName',
        headerName: 'Origin',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
   
     
      {
        field: 'actions',
        headerName: 'Actions',
        maxWidth: 120,
        pinned: 'right',
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: actionButtonsRenderer,
        lockPosition: 'right',
        cellStyle: { textAlign: 'center' },
      },
    ],
    [actionButtonsRenderer]
  );

  // Detail Column Definitions for Parts
  // const detailColumnDefs = useMemo(
  //   () => [
  //     {
  //       field: 'PartName',
  //       headerName: 'Part Name',
  //       minWidth: 200,
  //       filter: 'agTextColumnFilter',
  //     },
  //     {
  //       field: 'PartNo',
  //       headerName: 'Part No',
  //       minWidth: 150,
  //       filter: 'agTextColumnFilter',
  //       valueFormatter: (params) => params.value || '-',
  //     },
  //     {
  //       field: 'Quantity',
  //       headerName: 'Quantity',
  //       minWidth: 120,
  //       type: 'numericColumn',
  //       filter: 'agNumberColumnFilter',
  //       cellStyle: { textAlign: 'right' },
  //     },
  //     {
  //       field: 'CreatedBy',
  //       headerName: 'Created By',
  //       minWidth: 150,
  //       filter: 'agTextColumnFilter',
  //     },
  //     {
  //       field: 'CreatedDate',
  //       headerName: 'Created Date',
  //       minWidth: 180,
  //       filter: 'agDateColumnFilter',
  //       valueFormatter: (params) => {
  //         if (!params.value) return '-';
  //         return new Date(params.value).toLocaleString();
  //       },
  //     },
  //   ],
  //   []
  // );

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
  // const detailCellRendererParams = useMemo(
  //   () => ({
  //     detailGridOptions: {
  //       columnDefs: detailColumnDefs,
  //       defaultColDef: {
  //         flex: 1,
  //         sortable: true,
  //         filter: true,
  //       },
  //       domLayout: 'autoHeight',
  //     },
  //     getDetailRowData: (params) => {
  //       params.successCallback(params.data.Parts || []);
  //     },
  //   }),
  //   [detailColumnDefs]
  // );

  // -------------------------------------

  const renderLoading = (
    <LoadingScreen
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh',
      }}
    />
  );

  return (
    <>
      {/* {isLoading ? (
        renderLoading
      ) : ( */}
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Origin Factors"
          links={[
            { name: 'Home', href: paths.dashboard.root },
            { name: 'Origin Factor', href: paths.dashboard.powertools.inventory.OriginFactor },
            { name: 'list' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              color="primary"
              onClick={handleDialogOpen}
              
              sx={{
                mb: 1,
              }}
            >
              Add Origin Factor
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="space-between"
            sx={{ p: 2.5, pb: 2 }}
          >
            <TextField
              label="Search Origin Factors..."
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
              height: `${70 / zoomLevel}vh`,
              overflow: 'hidden',
              p: 2.5,
              pt: 0,
            }}
          >
            <Scrollbar>
              <div style={{ width: '100%', height: '60vh' }}>
                <AgGridReact
                  ref={gridRef}
                  className="ag-theme-material"
                  theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
                  rowData={filteredData}
                  columnDefs={masterColumnDefs}
                  defaultColDef={defaultColDef}
                  rowHeight={35}
                  headerHeight={40}
                  animateRows
                  pagination
                  paginationPageSize={20}
                  suppressRowClickSelection
                  loading={isLoading}
                  domLayout="autoHeight"
                />
              </div>
            </Scrollbar>
          </Box>
        </Card>
      </Container>
      {/* )} */}
      <OriginFactorDialog uploadClose={handleDialogClose} uploadOpen={dialogOpen} tableData={rowData} />
      <OriginFactorEditDialog
        uploadClose={handleEditDialogClose}
        row={currentRowData}
        uploadOpen={editDialogOpen}
        tableData={rowData}
      />
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (currentRowData) {
                DeleteDetailTableRow(currentRowData);
              }
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------
