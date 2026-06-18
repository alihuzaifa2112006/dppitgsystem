import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Delete, Get } from 'src/api/apibasemethods';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import {
  Box,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
} from '@mui/material';
import { Stack } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { paths } from 'src/routes/paths';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useNavigate } from 'react-router-dom';
import { fDate } from 'src/utils/format-time';
import Label from 'src/components/label';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

const ItemReceiveGrid = () => {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const confirm = useBoolean();
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedReceiveID, setSelectedReceiveID] = useState(null);

  // State for grid data
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterTab, setFilterTab] = useState('all');

  // ------------------------------- ?? -------------------------------

  const moveToPDFView = useCallback(
    (GRNID) => {
      navigate(paths.dashboard.InventoryManagement.ItemRecieve.pdf(GRNID));
    },
    [navigate]
  );

  const pdfButtonRenderer = useCallback(
    (params) => (
      <Tooltip title="View PDF" arrow>
        <IconButton
          onClick={() => moveToPDFView(params.data.GRNID)}
          size="small"
          sx={{ padding: '4px' }}
        >
          <Iconify icon="mdi:file-pdf-box" width="20" height="20" />
        </IconButton>
      </Tooltip>
    ),
    [moveToPDFView]
  );

  const moveToEditForm = useCallback(
    (GRNID) => {
      navigate(paths.dashboard.InventoryManagement.ItemRecieve.edit(GRNID));
    },
    [navigate]
  );

  // Edit
  const editButtonRenderer = useCallback(
    (params) => (
      <Tooltip title="Edit" arrow>
        <IconButton
          onClick={() => moveToEditForm(params.data.GRNID)}
          size="small"
          sx={{ padding: '4px' }}
        >
          <Iconify icon="solar:pen-bold" width={18} />
        </IconButton>
      </Tooltip>
    ),
    [moveToEditForm]
  );

  // ------------------------------- ?? -------------------------------
  // Delete

  const deleteButtonRenderer = useCallback(
    (params) => (
      <Tooltip title="Delete" arrow>
        <IconButton
          onClick={() => {
            setSelectedReceiveID(params.data.GRNID);
            confirm.onTrue();
          }}
          size="small"
          sx={{ padding: '4px' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" width="20" height="20" />
        </IconButton>
      </Tooltip>
    ),
    [confirm]
  );

  // All Actions Setup are Here

  const actionButtonsRenderer = useCallback(
    (params) => (
      <div style={{ display: 'flex', gap: '4px' }}>
        {editButtonRenderer(params)}
        {pdfButtonRenderer(params)}
        {deleteButtonRenderer(params)}
      </div>
    ),
    [deleteButtonRenderer, editButtonRenderer, pdfButtonRenderer]
  );

  const DeleteItemReceive = async (GRNID) => {
    if (!GRNID) {
      enqueueSnackbar('GRN ID not found', { variant: 'error' });
      return;
    }

    try {
      const response = await Delete(`DeleteItemReceiving/${GRNID}`);
      if (response.status === 200) {
        enqueueSnackbar('GRN deleted successfully', { variant: 'success' });
        fetchItemReceivingData(); // grid refresh
      } else {
        enqueueSnackbar('Failed to delete GRN', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting GRN:', error);
      enqueueSnackbar('Error deleting GRN', { variant: 'error' });
    }
  };

  // Fetch item receiving data
  const fetchItemReceivingData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `GetALLItemReceiving?BranchID=${userData?.userDetails?.branchID}&OrgID=${userData?.userDetails?.orgId}`
      );

      if (response.status === 200) {
        // Transform the data to match the expected structure
        const transformedData = response.data.map((item) => {
          const TotalQtyInKG = item.Details.filter((dt) => dt.UOMID === 1).reduce(
            (acc, detail) => acc + detail.ReceiveQty,
            0
          );
          const TotalReceiveValue = item.Details.reduce(
            (acc, detail) => acc + detail.ReceiveQty * detail.POUnitPrice,
            0
          );
          return {
            ...item.Master, // Spread all master properties
            TotalQtyInKG,
            TotalReceiveValue,
            CurrencySymbol: item.Details[0]?.CurrencySymbol,
            UOMName: item.Details[0]?.UOMName,
            Details: item.Details || [], // Include details array
          };
        });

        setReportData(transformedData);
      } else {
        setReportData([]);
        enqueueSnackbar(response.data.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load item receiving data', { variant: 'error' });
      setReportData([]);
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar]);

  useEffect(() => {
    fetchItemReceivingData();
  }, [fetchItemReceivingData]);

  // Get counts for each tab based on InvTypeName
  const tabCounts = useMemo(() => {
    const allCount = reportData.length;

    // Get unique InvTypeName values and their counts
    const invTypeCounts = reportData.reduce((acc, item) => {
      const invType = item.InvTypeName || 'Unknown';
      acc[invType] = (acc[invType] || 0) + 1;
      return acc;
    }, {});

    return {
      all: allCount,
      ...invTypeCounts,
    };
  }, [reportData]);

  // Get unique InvTypeName values for tabs
  const invTypeTabs = useMemo(() => {
    const uniqueTypes = [...new Set(reportData.map((item) => item.InvTypeName).filter(Boolean))];
    return uniqueTypes;
  }, [reportData]);

  // Filter data based on search text and InvTypeName tab
  const filteredData = useMemo(() => {
    let data = reportData;

    // Apply InvTypeName filter based on selected tab
    if (filterTab !== 'all') {
      data = data.filter((item) => item.InvTypeName === filterTab);
    }

    // Apply search filter
    if (!searchText) return data;

    const lowerSearch = searchText.toLowerCase();
    return data.filter((item) => {
      // Search in master fields
      const masterMatch = Object.entries(item).some(([key, val]) => {
        if (key === 'Details') return false; // Skip details array for master search
        return (
          val &&
          (typeof val === 'string' || typeof val === 'number') &&
          val.toString().toLowerCase().includes(lowerSearch)
        );
      });

      // Search in detail fields
      const detailMatch = item.Details?.some((detail) =>
        Object.values(detail).some(
          (val) =>
            val &&
            (typeof val === 'string' || typeof val === 'number') &&
            val.toString().toLowerCase().includes(lowerSearch)
        )
      );

      return masterMatch || detailMatch;
    });
  }, [reportData, searchText, filterTab]);

  const handleTabChange = (event, newValue) => {
    setFilterTab(newValue);
  };

  // Master Column Definitions
  const [masterColumnDefs] = useState([
    {
      maxWidth: 60,
      cellRenderer: 'agGroupCellRenderer',
      sortable: false,
      filter: false,
      resizable: false,
      lockPosition: 'left',
      pinned: 'left',
    },
    {
      field: 'GRNNo',
      headerName: 'GRN No',
      minWidth: 120,
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => params.value || '-',
    },
    {
      field: 'GRNDate',
      headerName: 'GRN Date',
      minWidth: 150,
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => {
        if (!params.value) return '-';

        return fDate(params.value);
      },
    },
    {
      field: 'VendorName',
      headerName: 'Vendor',
      minWidth: 200,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'InvTypeName',
      headerName: 'Item Type',
      minWidth: 200,
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => params.value || '-',
    },
    {
      field: 'ChallanNo',
      headerName: 'Challan No',
      minWidth: 120,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'ChallanDate',
      headerName: 'Challan Date',
      minWidth: 150,
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => {
        if (!params.value) return '-';
        return fDate(params.value);
      },
    },
    {
      field: 'VehicleNo',
      headerName: 'Vehicle No',
      minWidth: 120,
      filter: 'agTextColumnFilter',
      hide: true,
    },
    {
      field: 'DriverName',
      headerName: 'Driver Name',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      hide: true,
    },
    {
      field: 'TotalQtyInKG',
      headerName: 'Total Received Qty (KG)',
      minWidth: 150,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => `${fNumber(params.value)} ${params.data?.UOMName}` || '0.00',
    },
    {
      field: 'TotalReceiveValue',
      headerName: 'Total Received Value',
      minWidth: 150,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) =>
        `${params.data?.CurrencySymbol}${fNumber(params.value)}` || '0.00',
    },
    {
      field: 'CreatedByName',
      headerName: 'Created By',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'CreatedDate',
      headerName: 'Created Date',
      minWidth: 150,
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => {
        if (!params.value) return '-';
        return fDate(params.value);
      },
    },

    {
      field: 'StoreName',
      headerName: 'Delivery Point',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => params.value || '-',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 100,
      pinned: 'right',
      sortable: false,
      filter: false,
      resizable: false,
      cellRenderer: actionButtonsRenderer,
      lockPosition: 'right',
      cellStyle: { textAlign: 'center' },
    },
  ]);

  // Detail Column Definitions (Item Details)
  const [detailColumnDefs] = useState([
    {
      field: 'TrackingCode',
      headerName: 'Tracking Code',
      minWidth: 130,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'POCODE',
      headerName: 'PO Code',
      minWidth: 130,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'ItemName',
      headerName: 'Item Name',
      minWidth: 250,
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => params.value || '-',
    },
    {
      field: 'StoreName',
      headerName: 'Store',
      minWidth: 120,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'StoreLocationName',
      headerName: 'Storage Location',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => params.value || '-',
    },
    {
      field: 'POQty',
      headerName: 'PO Qty',
      minWidth: 100,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => `${fNumber(params.value)} ${params.data?.UOMName}` || '0.00',
    },
    {
      field: 'POUnitPrice',
      headerName: 'PO Unit Price',
      minWidth: 100,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => `${fNumber(params.value)} ${params.data?.UOMName}` || '0.00',
    },
    {
      field: 'ReceiveQty',
      headerName: 'Received Qty',
      minWidth: 120,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) => `${fNumber(params.value)} ${params.data?.UOMName}` || '0.00',
    },
    {
      field: 'ReceiveValue',
      headerName: 'Received Value',
      minWidth: 120,
      type: 'numericColumn',
      cellStyle: { textAlign: 'right' },
      valueFormatter: (params) =>
        `${params.data?.CurrencySymbol}${fNumber(
          params.data.ReceiveQty * params.data.POUnitPrice
        )}` || '0.00',
    },
    {
      field: 'Remarks',
      headerName: 'Remarks',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'isClose',
      headerName: 'Status',
      minWidth: 140,
      cellRenderer: (params) => {
        const isOpen = !params.value; // Note: Changed this logic based on your API response
        const status = isOpen ? 'Open' : 'Closed';

        const colors = {
          Open: {
            text: '#e3cf39', // dark red text
            icon: '●',
          },
          Closed: {
            text: '#2E7D32', // dark green text
            icon: '●',
          },
        };

        const { text, icon } = colors[status];

        const cellStyle = {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '0px 0px',
          borderRadius: '2px',
          fontSize: '0.75rem',
          fontWeight: 500,
          color: text,
        };

        return (
          <span style={cellStyle}>
            <span style={{ fontSize: '0.6rem' }}>{icon}</span> {status}
          </span>
        );
      },
      filter: true,
    },
  ]);

  // Default column definitions
  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 100,
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
          resizable: true,
        },
        domLayout: 'normal',
        suppressRowClickSelection: true,
        rowHeight: 30,
      },
      getDetailRowData: (params) => {
        const details = params.data.Details || [];
        params.successCallback(details);
      },
      template: (params) => `
        <div style="padding:10px; height:300px; overflow:auto;">
          <div ref="eDetailGrid"></div>
        </div>
      `,
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
    <Box sx={{ width: '100%', height: '85vh', p: 2 }}>
      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={filterTab} onChange={handleTabChange} aria-label="item type filter tabs">
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
          {invTypeTabs.map((invType) => (
            <Tab
              key={invType}
              value={invType}
              label={invType}
              sx={{ minWidth: 'auto' }}
              icon={
                <Label variant={filterTab === invType ? 'filled' : 'soft'} color="primary">
                  {tabCounts[invType] || 0}
                </Label>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Header Section */}
      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Search GRN, Vendor, Challan..."
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
            sx={{ width: 350 }}
          />
        </Stack>

        <Stack direction="row" spacing={2}>
          <Tooltip title="Zoom out" arrow placement="top">
            <IconButton
              color="primary"
              sx={{ border: '1px solid #eee' }}
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.75))}
            >
              <Iconify icon="si:zoom-out-duotone" width={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom in" arrow placement="top">
            <IconButton
              color="primary"
              sx={{ border: '1px solid #eee' }}
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 2))}
            >
              <Iconify icon="si:zoom-in-duotone" width={20} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Scrollbar>
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            width: `${100 / zoomLevel}%`,
            height: `${100 / zoomLevel}%`,
          }}
        >
          <AgGridReact
            className="ag-theme-material"
            theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
            rowData={filteredData}
            columnDefs={masterColumnDefs}
            defaultColDef={defaultColDef}
            masterDetail
            detailCellRenderer="agDetailCellRenderer"
            detailCellRendererParams={detailCellRendererParams}
            detailRowHeight={200}
            rowHeight={30}
            headerHeight={35}
            animateRows
            pagination
            paginationPageSize={20}
            paginationPageSizeSelector={[20, 50, 100]}
            suppressRowClickSelection
            domLayout="autoHeight"
            onFirstDataRendered={(params) => {
              params.api.sizeColumnsToFit();
            }}
          />
        </div>
      </Scrollbar>

      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          confirm.onFalse();
        }}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              DeleteItemReceive(selectedReceiveID);
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

export default ItemReceiveGrid;
