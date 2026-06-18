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
import { fNumber } from 'src/utils/format-number';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/custom-dialog';

import QualityFactorDialog from '../AddDialog';
import QualityFactorEditDialog from '../EditDialog';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

// ----------------------------------------------------------------------

export default function QualityFactorListView() {
  const navigate = useNavigate();
  const gridRef = useRef();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Fetching data:
  const [rowData, setRowData] = useState([]);
  const [QualityFactor, setQualityFactor] = useState([]);
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

  const FetchQualityFactor = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get('GetAllQualityFactors');
      // New API returns data directly as an array
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];

      // Use the data directly from API response
      setRowData(data);
    } catch (error) {
      console.error(error);
      // enqueueSnackbar('Failed to load QualityFactors', { variant: 'error' });
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = useCallback(() => {
    FetchQualityFactor();
    setDialogOpen(false);
  }, [FetchQualityFactor]);
  // -------------------------------------

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditDialogOpen = useCallback((rwData) => {
    setEditDialogOpen(true);
    setCurrentRowData(rwData);
  }, []);

  const handleEditDialogClose = useCallback(() => {
    FetchQualityFactor();
    setEditDialogOpen(false);
  }, [FetchQualityFactor]);
  // -------------------------------------

  

  useEffect(() => {
    FetchQualityFactor();
  }, [FetchQualityFactor]);

  // Filter data based on search text
  const filteredData = useMemo(() => {
    if (!searchText) return rowData;

    const lowerSearch = searchText.toLowerCase();
    return rowData.filter(
      (item) =>
        item.InvCatName?.toLowerCase().includes(lowerSearch) ||
        item.OFGradeName?.toLowerCase().includes(lowerSearch) ||
        item.Grade?.toString().includes(lowerSearch)
    );
  }, [rowData, searchText]);

  // Edit Functions
  const moveToEditForm = useCallback(
    (rwData) => {
      if (QualityFactor.find((city) => city.QualityFactorID === rwData.QualityFactorID)) {
        enqueueSnackbar('This QualityFactor is in use!', { variant: 'error' });
        return;
      }
      handleEditDialogOpen(rwData);
    },
    [QualityFactor, enqueueSnackbar, handleEditDialogOpen]
  );

  const DeleteDetailTableRow = async (row) => {
    // Check if QualityFactor is in use
    if (QualityFactor.some((city) => city.QualityFactorID === row.QualityFactorID)) {
      enqueueSnackbar('This QualityFactor is in use!', { variant: 'error' });
      return;
    }

    // Prepare payload
    const dataToSend = {
      QualityFactorID: row?.QualityFactorID,
      UpdatedBy: userData?.userDetails?.userId,
    };

    console.log('Sending DELETE Payload (via PUT):', dataToSend);

    try {
      const res = await Put('DeleteQualityFactor', dataToSend);
      enqueueSnackbar(res?.data?.Message || 'Deleted successfully', { variant: 'success' });
      FetchQualityFactor();
    } catch (error) {
      console.error('Error deleting QualityFactor:', error);
      enqueueSnackbar(error?.response?.data?.Message || 'Delete failed', { variant: 'error' });
    }
  };

  // Action buttons renderer
  const actionButtonsRenderer = useCallback(
    (params) => (
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
        <Tooltip title="Edit QualityFactor" arrow>
          <IconButton
            size="small"
            onClick={() => moveToEditForm(params.data)}
            sx={{ padding: '4px' }}
          >
            <Iconify icon="solar:pen-bold" width={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete QualityFactor" arrow>
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
    [confirm, moveToEditForm]
  );

  // Master Column Definitions
  const masterColumnDefs = useMemo(
    () => [
      {
        field: 'InvCatName',
        headerName: 'Fiber Category',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'OFGradeName',
        headerName: 'Grade',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Grade',
        headerName: 'Percentage',
        minWidth: 150,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        cellStyle: { textAlign: 'right' },
        valueFormatter: (params) => {
          if (params.value !== null && params.value !== undefined) {
            return `${fNumber(params.value, 2)}%`;
          }
          return '';
        },
      },
      // {
      //   field: 'ModelNo',
      //   headerName: 'Model No',
      //   minWidth: 150,
      //   filter: 'agTextColumnFilter',
      //   valueFormatter: (params) => params.value || '-',
      // },
     
      // {
      //   field: 'actions',
      //   headerName: 'Actions',
      //   maxWidth: 120,
      //   pinned: 'right',
      //   sortable: false,
      //   filter: false,
      //   resizable: false,
      //   cellRenderer: actionButtonsRenderer,
      //   lockPosition: 'right',
      //   cellStyle: { textAlign: 'center' },
      // },
    ],
    []
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
          heading="Quality Factors"
          links={[
            { name: 'Home', href: paths.dashboard.root },
            { name: 'Quality Factor', href: paths.dashboard.powertools.inventory.QualityFactor },
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
              Add Quality Factor
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
              label="Search QualityFactors..."
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
              transformQuality: 'top left',
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
      <QualityFactorDialog uploadClose={handleDialogClose} uploadOpen={dialogOpen} tableData={rowData} />
      <QualityFactorEditDialog
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
