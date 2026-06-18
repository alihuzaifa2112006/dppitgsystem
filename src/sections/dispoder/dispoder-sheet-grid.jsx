import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Box, TextField, InputAdornment, Button, IconButton, Tooltip, Stack } from '@mui/material';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get } from 'src/api/apibasemethods';
import { themeBalham, colorSchemeDarkBlue } from 'ag-grid-enterprise';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

const DispatchOrdersGrid = () => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);

  // --- Fetch Dispatch Orders ---
  const FetchDispoderData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `GetDispatchOrderList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      if (response.status === 200 && response.data?.Data) {
        // Group lots under each DOID
        const grouped = response.data.Data.reduce((acc, item) => {
          const existing = acc.find((x) => x.DOID === item.DOID);
          if (existing) {
            existing.Details.push(item);
          } else {
            acc.push({
              ...item,
              DODate: new Date(item.DODate),
              Details: [item],
            });
          }
          return acc;
        }, []);

        setTableData(grouped);
      } else {
        enqueueSnackbar('No Dispatch Orders found', { variant: 'info' });
        setTableData([]);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load Dispatch Orders', { variant: 'error' });
      setTableData([]);
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar]);

  useEffect(() => {
    FetchDispoderData();
  }, [FetchDispoderData]);

  // --- Search filter ---
  const filteredData = useMemo(() => {
    if (!searchText) return tableData;
    const lower = searchText.toLowerCase();
    return tableData.filter((item) =>
      Object.values(item).some(
        (val) =>
          val &&
          (typeof val === 'string' || typeof val === 'number') &&
          val.toString().toLowerCase().includes(lower)
      )
    );
  }, [tableData, searchText]);

  // --- Master Grid Columns ---
  const masterColumnDefs = [
    {
      field: 'expand',
      headerName: '',
      maxWidth: 50,
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: { suppressCount: true },
    },
    {
      headerName: 'Dispatch Order Info',
      children: [
        { field: 'DONumber', headerName: 'DO Number', minWidth: 150 },
        {
          field: 'DODate',
          headerName: 'Date',
          minWidth: 120,
          valueFormatter: (p) => new Date(p.value).toLocaleDateString(),
        },
        { field: 'PINo', headerName: 'PI No', minWidth: 150 },
        // { field: 'DO_Remarks', headerName: 'Remarks', minWidth: 120 },
      ],
    },
  ];

  // --- Detail Grid Columns ---
  const detailColumnDefs = useMemo(
    () => [
      {
        headerName: 'Lot Details',
        children: [
          { field: 'LotNo', headerName: 'Lot No', minWidth: 100 },
          { field: 'LotLabel', headerName: 'Lot Label', minWidth: 200 },
          { field: 'Quantity', headerName: 'Quantity', minWidth: 120 },
          { field: 'ColorName', headerName: 'Color', minWidth: 150 },
          { field: 'DetailRemarks', headerName: 'Detail Remarks', minWidth: 200 },
        ],
      },
    ],
    []
  );

  // --- Default Columns ---
  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  // --- Detail Grid Setup ---
  const detailCellRendererParams = useMemo(
    () => ({
      detailGridOptions: {
        columnDefs: detailColumnDefs,
        defaultColDef,
        domLayout: 'autoHeight',
      },
      getDetailRowData: (params) => {
        params.successCallback(params.data.Details || []);
      },
    }),
    [detailColumnDefs, defaultColDef]
  );

  // --- Zoom Controls ---
  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.1, 0.5));
  const handleZoomReset = () => setZoomLevel(1);

  if (loading) return <LoadingScreen />;

  return (
    <Box sx={{ width: '100%', height: '80vh', p: 2 }}>
      {/* Toolbar */}
      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
        <TextField
          label="Search..."
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

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} color="primary" sx={{ border: '1px solid #eee' }}>
              <Iconify icon="si:zoom-out-duotone" width={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset Zoom">
            <Button onClick={handleZoomReset} variant="outlined" size="small">
              {Math.round(zoomLevel * 100)}%
            </Button>
          </Tooltip>
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} color="primary" sx={{ border: '1px solid #eee' }}>
              <Iconify icon="si:zoom-in-duotone" width={20} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* AG Grid */}
      <Box
        sx={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top left',
          width: `${100 / zoomLevel}%`,
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

export default DispatchOrdersGrid;
