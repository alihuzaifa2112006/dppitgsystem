import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get, Post } from 'src/api/apibasemethods';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import {
  Button,
  TextField,
  InputAdornment,
  Tooltip,
  IconButton,
  Tab,
  Tabs,
  Box,
} from '@mui/material';
import { Stack } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import Card from '@mui/material/Card';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

const getRowStyle = (params) => {
  if (params.node.rowIndex % 2 === 0) {
    return { background: 'rgba(0, 0, 0, 0.02)' };
  }
  return null;
};

const TAB_VALUES = {
  RAW_MATERIAL: 'raw_material',
  FINISHED_GOODS: 'finished_goods',
};

export default function ItemRequisitionGrid() {
  const navigate = useNavigate();
  const gridRef = useRef();
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();
  const [currentTab, setCurrentTab] = useState(TAB_VALUES.RAW_MATERIAL);
  const [rowData, setRowData] = useState({
    [TAB_VALUES.RAW_MATERIAL]: [],
    [TAB_VALUES.FINISHED_GOODS]: [],
  });
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState({
    [TAB_VALUES.RAW_MATERIAL]: true,
    [TAB_VALUES.FINISHED_GOODS]: false,
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchParams, setSearchParams] = useState({ searchTerm: '' });

  const API_ENDPOINTS = useMemo(
    () => ({
      [TAB_VALUES.RAW_MATERIAL]: `GetAllRequestIssueItems?isFG=false`,
      [TAB_VALUES.FINISHED_GOODS]: 'GetAllRequestIssueItems?isFG=true',
    }),
    []
  );

  const moveToEditForm = useCallback(
    (id) => {
      const suffix = currentTab === TAB_VALUES.RAW_MATERIAL ? 'RM' : 'FG';
      navigate(paths.dashboard.InventoryManagement.IssueNote.edit(`${id}&${suffix}`));
    },
    [currentTab, navigate]
  );

  const getActionsColumn = useCallback(
    () => ({
      field: 'actions',
      headerName: 'Actions',
      minWidth: 80,
      pinned: 'right',
      sortable: false,
      filter: false,
      resizable: false,
      suppressMovable: true,
      lockPosition: 'right',
      cellRenderer: (params) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'left' }}>
          <Tooltip title="Edit" arrow>
            <IconButton
              onClick={() => moveToEditForm(params?.data?.RequestDtlID)}
              size="small"
              sx={{ padding: '4px' }}
            >
              <Iconify icon="solar:pen-bold" width={18} />
            </IconButton>
          </Tooltip>
        </div>
      ),
    }),
    [moveToEditForm]
  );

  const submitRow = useCallback(
    async (rData) => {
      if (!rData.currentIssueQty || rData.currentIssueQty <= 0) {
        enqueueSnackbar('Please enter a valid quantity', { variant: 'warning' });
        return;
      }

      try {
        // Prepare data for submission
        const submissionData = {
          RequestDtlID: rData.RequestDtlID,
          IssueQty: rData.currentIssueQty,
        };

        // Call your API to submit the data

        // Simulate successful submission
        const updatedRow = {
          ...rData,
          IssuedQty: (rData.IssuedQty || 0) + rData.currentIssueQty,
          AvailableQty: (rData.AvailableQty || 0) - rData.currentIssueQty,
          currentIssueQty: 0,
        };

        // Update the specific row in the grid
        const rowNode = gridRef.current.api.getRowNode(rData.RequestDtlID);
        if (rowNode) {
          rowNode.setData(updatedRow);
        }

        enqueueSnackbar('Quantity submitted successfully!', { variant: 'success' });
      } catch (error) {
        console.error('Submission failed:', error);
        enqueueSnackbar('Failed to submit quantity', { variant: 'error' });
      }
    },
    [enqueueSnackbar]
  );

  const handleCellKeyDown = useCallback(
    (params) => {
      if (params.colDef.field === 'currentIssueQty' && params.event.key === 'Enter') {
        params.api.stopEditing();
        submitRow(params.data);
      }
    },
    [submitRow]
  );

  const rawMaterialMasterColDefs = useMemo(
    () => [
      { field: 'ItemName', headerName: 'Item Name', minWidth: 150 },
      { field: 'Material_Code', headerName: 'Material Code', minWidth: 150 },
      { field: 'DepartmentName', headerName: 'Department', minWidth: 180 },
      {
        field: 'ReqQty',
        headerName: 'Requested Qty',
        minWidth: 120,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
        valueFormatter: (params) => params.value?.toFixed(2) || '0.00',
      },
      {
        field: 'ReceivedQty',
        headerName: 'Received Qty',
        minWidth: 120,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
        valueFormatter: (params) => params.value?.toFixed(2) || '0.00',
      },
      {
        field: 'PassedQty',
        headerName: 'Passed Qty',
        minWidth: 120,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
        valueFormatter: (params) => params.value?.toFixed(2) || '0.00',
      },
      {
        field: 'IssuedQty',
        headerName: 'Issued Qty',
        minWidth: 120,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
        valueFormatter: (params) => params.value?.toFixed(2) || '0.00',
      },
      {
        field: 'AvailableQty',
        headerName: 'Available Qty',
        minWidth: 120,
        type: 'numericColumn',
        cellStyle: { textAlign: 'right' },
        valueFormatter: (params) => params.value?.toFixed(2) || '0.00',
      },
      // {
      //   field: 'currentIssueQty',
      //   headerName: 'Current Issue Qty',
      //   minWidth: 150,
      //   editable: true,
      //   type: 'numericColumn',
      //   cellStyle: { textAlign: 'right' },
      //   valueFormatter: (params) => params.value?.toFixed(2) || '0.00',
      //   cellEditor: 'agNumberCellEditor',
      //   cellEditorParams: {
      //     min: 0,
      //     max: (params) => params.data.AvailableQty,
      //     precision: 2,
      //   },
      //   valueSetter: (params) => {
      //     const newValue = parseFloat(params.newValue) || 0;
      //     const availableQty = parseFloat(params.data.AvailableQty) || 0;

      //     if (newValue > availableQty) {
      //       params.data.currentIssueQty = availableQty;
      //       return false; // Reject the change
      //     }

      //     params.data.currentIssueQty = newValue;
      //     return true; // Accept the change
      //   },
      //   onCellKeyDown: handleCellKeyDown,
      // },
      { field: 'UOMName', headerName: 'UOM', minWidth: 100 },
      { field: 'Remarks', headerName: 'Remarks', minWidth: 200 },
      getActionsColumn(),
    ],
    [getActionsColumn]
  );

  const COLUMN_DEFINITIONS = useMemo(
    () => ({
      [TAB_VALUES.RAW_MATERIAL]: rawMaterialMasterColDefs,
      [TAB_VALUES.FINISHED_GOODS]: rawMaterialMasterColDefs,
    }),
    [rawMaterialMasterColDefs]
  );

  const fetchTabData = useCallback(
    async (tab) => {
      try {
        setIsLoading((prev) => ({ ...prev, [tab]: true }));
        const response = await Get(API_ENDPOINTS[tab]);

        if (response?.status === 200) {
          const data =
            response.data?.map((item) => ({
              ...item,
              currentIssueQty: 0, // Initialize currentIssueQty to 0 for all items
            })) || [];

          setRowData((prev) => ({ ...prev, [tab]: data }));
          setFilteredData(data);
        }
      } catch (error) {
        console.error(error);
        // enqueueSnackbar(`Failed to load ${tab.replace('_', ' ')} data`, { variant: 'error' });
        setRowData((prev) => ({ ...prev, [tab]: [] }));
        setFilteredData([]);
      } finally {
        setIsLoading((prev) => ({ ...prev, [tab]: false }));
      }
    },
    [API_ENDPOINTS]
  );

  useEffect(() => {
    if (!rowData[currentTab]?.length) {
      fetchTabData(currentTab);
    }
    // eslint-disable-next-line
  }, [currentTab]);

  useEffect(() => {
    if (!rowData[currentTab]?.length) return;

    const searchTerm = searchParams.searchTerm.toLowerCase();
    const filtered = rowData[currentTab].filter(
      (item) =>
        item.ItemName?.toLowerCase().includes(searchTerm) ||
        item.Material_Code?.toLowerCase().includes(searchTerm) ||
        item.DepartmentName?.toLowerCase().includes(searchTerm)
    );

    setFilteredData(filtered);
  }, [searchParams, rowData, currentTab]);

  const handleTabChange = useCallback((event, newValue) => {
    setCurrentTab(newValue);
    setSearchParams({ searchTerm: '' });
  }, []);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      suppressMovable: false,
    }),
    []
  );

  const onFirstDataRendered = useCallback((params) => params.api.sizeColumnsToFit(), []);

  const handleSearchChange = useCallback(
    (event) => setSearchParams({ searchTerm: event.target.value }),
    []
  );

  return (
    <Card>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': {
              height: 4,
              backgroundColor: 'primary.main',
            },
          }}
        >
          <Tab
            label="Items"
            value={TAB_VALUES.RAW_MATERIAL}
            sx={{ textTransform: 'none', fontWeight: 'fontWeightBold' }}
          />
          <Tab
            label="Finished Goods"
            value={TAB_VALUES.FINISHED_GOODS}
            sx={{ textTransform: 'none', fontWeight: 'fontWeightBold' }}
          />
        </Tabs>
      </Box>

      {isLoading[currentTab] ? (
        <LoadingScreen
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh',
          }}
        />
      ) : (
        <>
          <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Search Item Name, Material Code or Department"
                variant="outlined"
                size="small"
                value={searchParams.searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" width={20} />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 350 }}
              />
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
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

          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left',
              width: `${100 / zoomLevel}%`,
              height: `${100 / zoomLevel}%`,
              overflow: 'hidden',
            }}
          >
            <Scrollbar>
              <div style={{ width: '100%', height: '70vh', padding: 10 }}>
                <AgGridReact
                  className="ag-theme-material"
                  theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
                  ref={gridRef}
                  rowData={filteredData}
                  columnDefs={COLUMN_DEFINITIONS[currentTab]}
                  defaultColDef={defaultColDef}
                  rowHeight={35}
                  headerHeight={40}
                  animateRows
                  pagination
                  paginationPageSize={50}
                  getRowStyle={getRowStyle}
                  onFirstDataRendered={onFirstDataRendered}
                  onCellKeyDown={handleCellKeyDown}
                  suppressRowClickSelection
                  singleClickEdit
                  stopEditingWhenCellsLoseFocus
                />
              </div>
            </Scrollbar>
          </div>
        </>
      )}
    </Card>
  );
}
