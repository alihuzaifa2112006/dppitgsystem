import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get, Delete } from 'src/api/apibasemethods';
import { colorSchemeDarkBlue, themeBalham } from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { TextField, InputAdornment, Tooltip, IconButton, Button } from '@mui/material';
import { Stack } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';
import { paths } from 'src/routes/paths';
import { useNavigate } from 'react-router';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';

const StatusRenderer = (params) => {
  // eslint-disable-next-line
  const status = params.data?.isClosed;
  let textColor;
  let statusText;

  if (status === true) {
    textColor = '#63913a';
    statusText = 'Closed';
  } else if (status === false) {
    textColor = '#cd8f4d';
    statusText = 'Open';
  } else {
    textColor = '#595959';
    statusText = 'Unknown';
  }

  return (
    <div
      style={{
        display: 'inline-block',
        // padding: '4px 12px',
        // borderRadius: '12px',
        color: textColor,
        // border: `1px solid ${textColor}30`,
        fontSize: '12px',
        fontWeight: '500',
        textAlign: 'center',
      }}
    >
      {statusText}
    </div>
  );
};

const GoodsReceivedConfirmationGrid = () => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const orgId = userData?.userDetails?.orgId || 1;
  const branchId = userData?.userDetails?.branchID || 6;

  // State for grid data
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchParams, setSearchParams] = useState({
    issueCode: '',
    itemCode: '',
    itemDescription: '',
  });
  const [selectedInvRecConfirmID, setSelectedInvRecConfirmID] = useState(null);
  const deleteConfirm = useBoolean();

  const containerStyle = useMemo(() => ({ width: '100%', height: '500px' }), []);

  // Fetch goods received confirmation data
  const fetchGoodsReceivedConfirmations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `InvReceiveConfirmationandReturn/GetAll?orgId=${orgId}&branchId=${branchId}`
      );

      if (response.status === 200 && response.data) {
        const formattedData = response.data.map((item) => ({
          ...item,
          ReceiveDate: item.ReceiveDate ? fDate(new Date(item.ReceiveDate)) : '',
          IssueDate: item.IssueDate ? fDate(new Date(item.IssueDate)) : '',
          UpdatedDate: item.UpdatedDate ? fDate(new Date(item.UpdatedDate)) : '',
          CreatedDate: item.CreatedDate ? fDate(new Date(item.CreatedDate)) : '',
        }));
        setRowData(formattedData);
      } else {
        setRowData([]);
        enqueueSnackbar('No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error('Error fetching goods received confirmations:', error);
      enqueueSnackbar('Failed to load goods received confirmations', { variant: 'error' });
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, [orgId, branchId, enqueueSnackbar]);

  useEffect(() => {
    fetchGoodsReceivedConfirmations();
  }, [fetchGoodsReceivedConfirmations]);

  // Delete function
  const handleDelete = useCallback(async () => {
    if (!selectedInvRecConfirmID) {
      enqueueSnackbar('Record ID not selected.', { variant: 'error' });
      return;
    }

    try {
      const userId = userData?.userDetails?.userId || userData?.userDetails?.userID;
      const response = await Delete(
        `InvReceiveConfirmationandReturn/Delete?invRecConfirmId=${selectedInvRecConfirmID}&deletedBy=${userId}`
      );

      if (response.status === 200) {
        enqueueSnackbar('Goods received confirmation deleted successfully', { variant: 'success' });
        fetchGoodsReceivedConfirmations();
      } else {
        enqueueSnackbar('Failed to delete goods received confirmation', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting goods received confirmation:', error);
      enqueueSnackbar(
        error?.response?.data?.Message || 'Error deleting goods received confirmation',
        { variant: 'error' }
      );
    } finally {
      deleteConfirm.onFalse();
      setSelectedInvRecConfirmID(null);
    }
  }, [selectedInvRecConfirmID, userData, enqueueSnackbar, fetchGoodsReceivedConfirmations, deleteConfirm]);

  // Filter data based on search parameters
  const filteredData = useMemo(
    () =>
      rowData.filter(
        (item) =>
          item.IssueCode?.toLowerCase().includes(searchParams.issueCode.toLowerCase()) &&
          item.ItemCode?.toLowerCase().includes(searchParams.itemCode.toLowerCase()) &&
          item.ItemDescription?.toLowerCase().includes(searchParams.itemDescription.toLowerCase())
      ),
    [rowData, searchParams]
  );
  // Edit button renderer
  const editButtonRenderer = useCallback(
    (params) => (
      <Tooltip title="Edit" arrow>
        <IconButton
          onClick={() => navigate(paths.dashboard.Production.GoodsRecievedConfirmation.edit(params.data.Inv_Rec_ConfirmID))}
          size="small"
          sx={{ padding: '4px' }}
        >
          <Iconify icon="solar:pen-bold" width={18} />
        </IconButton>
      </Tooltip>
    ),
    [navigate]
  );

  // PDF button renderer
  const pdfButtonRenderer = useCallback(
    (params) => (
      <Tooltip title="View PDF" arrow>
        <IconButton
          onClick={() => navigate(paths.dashboard.Production.GoodsRecievedConfirmation.pdf(params.data.Inv_Rec_ConfirmID))}
          size="small"
          sx={{ padding: '4px' }}
        >
          <Iconify icon="solar:file-text-bold" width={18} />
        </IconButton>
      </Tooltip>
    ),
    [navigate]
  );

 
  // Combined actions renderer (Edit + PDF + Delete)
  const actionsRenderer = useCallback(
    (params) => (
      <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
        <Tooltip title="Edit" arrow>
          <IconButton
            onClick={() => navigate(paths.dashboard.Production.GoodsRecievedConfirmation.edit(params.data.Inv_Rec_ConfirmID))}
            size="small"
            sx={{ padding: '4px' }}
          >
            <Iconify icon="solar:pen-bold" width={18} />
          </IconButton>
        </Tooltip>

        <Tooltip title="View PDF" arrow>
          <IconButton
            onClick={() => navigate(paths.dashboard.Production.GoodsRecievedConfirmation.pdf(params.data.Inv_Rec_ConfirmID))}
            size="small"
            sx={{ padding: '4px' }}
          >
             <Iconify icon="mdi:file-pdf-box" width="20" height="20" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete" arrow>
          <IconButton
            onClick={() => {
              setSelectedInvRecConfirmID(params.data.Inv_Rec_ConfirmID);
              deleteConfirm.onTrue();
            }}
            size="small"
            sx={{ padding: '4px', color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
    [navigate, deleteConfirm]
  );

  // Column definitions
  const [columnDefs] = useState([
    {
      field: 'ReqCode',
      headerName: 'Request Code',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => params.value || '-',
    },
    {
      field: 'ReqDate',
      headerName: 'Request Date',
      minWidth: 120,
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => fDate(params.value) || '-',
    },
    {
      field: 'IssueCode',
      headerName: 'Issue Code',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      valueFormatter: (params) => params.value || '-',
    },
    {
      field: 'IssueDate',
      headerName: 'Issue Date',
      minWidth: 120,
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => fDate(params.value) || '-',
    },
    {
      field: 'ReceiveDate',
      headerName: 'Receive Date',
      minWidth: 130,
      filter: 'agDateColumnFilter',
    },
    {
      field: 'ItemCode',
      headerName: 'Item Code',
      minWidth: 180,
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
      field: 'TotalRequestedQty',
      headerName: 'Requested Qty',
      minWidth: 130,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => `${fNumber(params.value) || '0'} ${params.data.UOMName || ''}`,
      cellStyle: { textAlign: 'right' },
    },
    {
      field: 'IssueQty',
      headerName: 'Issued Qty',
      minWidth: 120,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => `${fNumber(params.value) || '0'} ${params.data.UOMName || ''}`,
      cellStyle: { textAlign: 'right' },
    },
    {
      field: 'AcceptedQty',
      headerName: 'Accepted Qty',
      minWidth: 130,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => `${fNumber(params.value) || '0'} ${params.data.UOMName || ''}`,
      cellStyle: { textAlign: 'right' },
    },
    {
      field: 'ReturnQty',
      headerName: 'Returned Qty',
      minWidth: 130,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      valueFormatter: (params) => `${fNumber(params.value) || '0'} ${params.data.UOMName || ''}`,
      cellStyle: { textAlign: 'right' },
    },

    {
      field: 'Remarks',
      headerName: 'Remarks',
      minWidth: 200,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'isClosed',
      headerName: 'is Closed',
      minWidth: 120,
      filter: 'agSetColumnFilter',
      cellRenderer: StatusRenderer,
    },
    {
      field: 'actions',
      headerName: '',
      minWidth: 120,
      maxWidth: 150,
      filter: false,
      sortable: false,
      cellRenderer: actionsRenderer,
      cellStyle: { textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' },
      pinned: 'right',
    },
    // {
    //   field: 'UpdatedDate',
    //   headerName: 'Last Updated',
    //   minWidth: 140,
    //   filter: 'agDateColumnFilter',
    // },
  ]);

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  const onFirstDataRendered = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  const handleSearchChange = (field) => (event) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div style={containerStyle}>
      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Search Issue Code"
            variant="outlined"
            size="small"
            value={searchParams.issueCode}
            onChange={handleSearchChange('issueCode')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Search Item Code"
            variant="outlined"
            size="small"
            value={searchParams.itemCode}
            onChange={handleSearchChange('itemCode')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Search Item Description"
            variant="outlined"
            size="small"
            value={searchParams.itemDescription}
            onChange={handleSearchChange('itemDescription')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} />
                </InputAdornment>
              ),
            }}
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
          height: `${150 / zoomLevel}%`,
          overflow: 'hidden',
        }}
      >
        <Scrollbar>
          <AgGridReact
            className="ag-theme-material"
            theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
            rowData={filteredData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowHeight={35}
            headerHeight={40}
            animateRows
            pagination
            paginationPageSize={20}
            domLayout="autoHeight"
            suppressRowClickSelection
            onFirstDataRendered={onFirstDataRendered}
          />
        </Scrollbar>
      </div>

      <ConfirmDialog
        open={deleteConfirm.value}
        onClose={() => {
          deleteConfirm.onFalse();
          setSelectedInvRecConfirmID(null);
        }}
        title="Delete"
        content="Are you sure you want to delete this goods received confirmation?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
          >
            Delete
          </Button>
        }
      />
    </div>
  );
};

export default GoodsReceivedConfirmationGrid;
