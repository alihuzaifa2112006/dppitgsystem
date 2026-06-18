import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get } from 'src/api/apibasemethods';
import {
  colorSchemeDarkBlue,
  themeAlpine,
  themeBalham,
  themeMaterial,
  themeQuartz,
} from 'ag-grid-enterprise';
import { useSettingsContext } from 'src/components/settings';
import { useNavigate } from 'react-router-dom';
import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import { IconButton, Tooltip, TextField, InputAdornment } from '@mui/material';
import { Stack } from '@mui/system';
import { APP_API_STORAGE } from 'src/config-global';
import { fDate } from 'src/utils/format-time';

const ImageNameRender =
  (id) =>
    // eslint-disable-next-line
    ({ data }) => {
      const name = data?.[`Level${id}_Approver_Name`] || '';
      const image = data?.[`Level${id}_Approve_Image`] || '';

      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            textAlign: 'left',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            // padding: '0 8px',
          }}
        >
          {image && (
            <img
              src={image}
              alt="Approver"
              style={{ width: '25px', height: '25px', marginRight: '8px', borderRadius: '50%' }}
            />
          )}
          <span style={{ textOverflow: 'ellipsis' }}>{name}</span>
        </div>
      );
    };

const ImportLCBillPaymentSheetGrid = () => {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const themeDark = themeBalham.withPart(colorSchemeDarkBlue);
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Navigation function
  const moveToEditForm = (importPaymentId) => {
    navigate(paths.dashboard.Commercial.import.ImportLCBillPayment.edit(importPaymentId));
  };
  // const moveToApprovalForm = (piId) => {
  //   navigate(paths.dashboard.Commercial.ImportInvoiceEntry.approval(piId));
  // };
  // const moveToPDFView = (piId) => {
  //   navigate(paths.dashboard.Commercial.ImportPIRegister.pdf(piId));
  // };

  // State for grid data
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchParams, setSearchParams] = useState({
    paymentNo: '',
  });
  const containerStyle = useMemo(() => ({ width: '100%', height: '500px' }), []);

  // Fetch Import Payment data
  const fetchImportPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `CommercialModule/GetImportPaymentList?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6}`
      );

      if (Array.isArray(response.data)) {
        const formattedData = response.data.map((payment) => ({
          ...payment,
          PaymentInvoices: [],
          // totalInvoiceValue: payment.TotalInvoiceValue.toFixed(2), // Will be loaded on demand
          TotalPaidAmount: payment.TotalPaidAmount.toFixed(2),
        }));
        setRowData(formattedData);

      } else {
        setRowData([]);
        enqueueSnackbar('No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load Import Payments', { variant: 'error' });
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar]);

  useEffect(() => {
    fetchImportPayments();
  }, [fetchImportPayments]);

  // Filter data based on search parameters
  const filteredData = useMemo(
    () =>
      rowData.filter(
        (payment) =>
          (payment?.PaymentNo || '').toLowerCase().includes(searchParams.paymentNo.toLowerCase())
      ),
    [rowData, searchParams]
  );

  // Action button renderers
  const editButtonRenderer = (params) => (
    <Tooltip title="Edit" arrow>
      <IconButton
        onClick={() => moveToEditForm(params.data.ImportPaymentID)}
        size="small"
        sx={{ padding: '4px' }}
        disabled
      >
        <Iconify icon="solar:pen-bold" width={18} />
      </IconButton>
    </Tooltip>
  );

  // const approvalButtonRenderer = (params) => (
  //   <Tooltip title="View" arrow>
  //     <IconButton disabled
  //       onClick={() => {
  //         moveToApprovalForm(params.data.PIID);
  //       }}
  //       size="small"
  //       sx={{ padding: '4px' }}
  //     >
  //       <Iconify icon="solar:eye-bold" width={18} />
  //     </IconButton>
  //   </Tooltip>
  // );

  // const pdfButtonRenderer = (params) => (
  //   <Tooltip title="View PDF" arrow>
  //     <IconButton
  //       onClick={() => moveToPDFView(params.data.PIID)}
  //       size="small"
  //       sx={{ padding: '4px' }}
  //     >
  //       <Iconify icon="mdi:file-pdf-box" width={18} />
  //     </IconButton>
  //   </Tooltip>
  // );

  const actionButtonsRenderer = (params) => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {/* {approvalButtonRenderer(params)} */}
      {editButtonRenderer(params)}
      {/* {pdfButtonRenderer(params)} */}
    </div>
  );

  // Create a file called StatusRenderer.js or add this to your existing file
  const StatusRenderer = (params) => {
    // eslint-disable-next-line
    const status = params.value;
    // eslint-disable-next-line
    let backgroundColor, textColor, borderColor;

    switch (status) {
      case 'Approved':
        // backgroundColor = 'rgba(208, 245, 216, 0.5)';
        textColor = '#63913a';
        // borderColor = '#00a854';
        // borderColor = 'rgba(208, 245, 216, 0.5)';
        break;
      case 'Rejected':
        // backgroundColor = 'rgba(255, 204, 204, 0.5)';
        textColor = '#a80000';
        // borderColor = 'rgba(255, 204, 204, 0.5)';
        break;
      case 'Pending':
        // backgroundColor = '#fff7e6';
        textColor = '#cd8f4d';
        // borderColor = '#fa8c16';
        break;
      default:
        // backgroundColor = '#f5f5f5';
        textColor = '#595959';
      // borderColor = '#d9d9d9';
    }

    return (
      <div
        style={{
          display: 'inline-block',
          padding: '0px 5px',
          borderRadius: '8px',
          backgroundColor,
          color: textColor,
          border: `1px solid ${borderColor}`,
          // fontSize: '8px',
          textAlign: 'center',
        }}
      >
        {status}
      </div>
    );
  };
  // Master grid column definitions
  const [columnDefs] = useState([
    {
      field: 'expand',
      headerName: '',
      width: 20,
      filter: false,
      sortable: false,
      resizable: false,
      lockPosition: 'left',
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: {
        suppressCount: true,
        innerRenderer: (params) => (params.value ? params.value : ''),
      },
    },
    {
      field: 'PaymentNo',
      headerName: 'Payment No',
      minWidth: 180,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'PaymentDate',
      headerName: 'Payment Date',
      minWidth: 150,
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
    },
    {
      field: 'TotalInvoiceValue',
      headerName: 'Total Invoice Value',
      minWidth: 150,
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
      valueFormatter: (params) => (params.value ? parseFloat(params.value).toFixed(2) : ''),
    },
    {
      field: 'TotalPaidAmount',
      headerName: 'Total Paid Amount',
      minWidth: 150,
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
      valueFormatter: (params) => (params.value ? parseFloat(params.value).toFixed(2) : ''),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 30,
      pinned: 'right',
      sortable: false,
      filter: false,
      resizable: false,
      cellRenderer: actionButtonsRenderer,
      lockPosition: 'right',
      cellStyle: { textAlign: 'center' },
    },
  ]);

  // Function to fetch Import Payment Invoices
  const fetchImportPaymentInvoices = useCallback(async (importPaymentId) => {
    try {
      const response = await Get(
        `CommercialModule/GetImportPaymentInvoices?ImportPaymentID=${importPaymentId}`
      );
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching Import Payment Invoices:', error);
      return [];
    }
  }, []);

  // Detail grid column definitions
  const detailGridOptions = {
    columnDefs: [
      {
        field: 'CommercialInvoiceNo',
        headerName: 'Commercial Invoice No',
        width: 180,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'InvoiceNo',
        headerName: 'Invoice No',
        width: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'InvoiceDate',
        headerName: 'Invoice Date',
        width: 120,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
      },
      {
        field: 'SupplierName',
        headerName: 'Supplier',
        width: 200,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'BBImportLCNo',
        headerName: 'BB/Import LC No',
        width: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'InvoiceValue',
        headerName: 'Invoice Value',
        width: 130,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? parseFloat(params.value).toFixed(2) : ''),
      },
      {
        field: 'AcceptanceValue',
        headerName: 'Acceptance Value',
        width: 150,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? parseFloat(params.value).toFixed(2) : ''),
      },
      {
        field: 'AdvancedPaid',
        headerName: 'Advanced Paid',
        width: 130,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? parseFloat(params.value).toFixed(2) : ''),
      },
      {
        field: 'AlreadyPaid',
        headerName: 'Already Paid',
        width: 130,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? parseFloat(params.value).toFixed(2) : ''),
      },
      {
        field: 'PayableAmount',
        headerName: 'Payable Amount',
        width: 140,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? parseFloat(params.value).toFixed(2) : ''),
      },
      {
        field: 'PaidAmount',
        headerName: 'Paid Amount',
        width: 130,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? parseFloat(params.value).toFixed(2) : ''),
      },
      {
        field: 'ConversionRate',
        headerName: 'Conversion Rate',
        width: 150,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? parseFloat(params.value).toFixed(6) : ''),
      },
    ],
    defaultColDef: {
      flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
    },
  };

  // Configure master-detail relationship
  const detailCellRendererParams = useMemo(
    () => ({
      // eslint-disable-next-line
      detailGridOptions: detailGridOptions,
      getDetailRowData: async (params) => {
        // Fetch details on demand
        if (!params.data.PaymentInvoices || params.data.PaymentInvoices.length === 0) {
          const details = await fetchImportPaymentInvoices(params.data.ImportPaymentID);
          // Update the row data with fetched details
          params.data.PaymentInvoices = details;
        }
        params.successCallback(params.data.PaymentInvoices || []);
      },
    }),
    // eslint-disable-next-line
    [fetchImportPaymentInvoices]
  );

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
            label="Search Payment No"
            variant="outlined"
            size="small"
            value={searchParams.paymentNo}
            onChange={handleSearchChange('paymentNo')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
        <Stack direction="row" spacing={2}>
          <Tooltip title="Zoom in" arrow placement="top">
            <IconButton
              color="primary"
              sx={{ border: '1px solid #eee' }}
              onClick={() => setZoomLevel((prev) => prev + 0.1)}
            >
              <Iconify icon="si:zoom-in-duotone" width={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom out" arrow placement="top">
            <IconButton
              color="primary"
              sx={{ border: '1px solid #eee' }}
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.1))}
            >
              <Iconify icon="si:zoom-out-duotone" width={20} />
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
        <AgGridReact
          className="ag-theme-material"
          theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
          rowData={filteredData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowHeight={35}
          headerHeight={40}
          autoSizeStrategy
          masterDetail
          detailCellRendererParams={detailCellRendererParams}
          animateRows
          pagination
          paginationPageSize={50}
          domLayout="autoHeight"
          suppressRowClickSelection
          onFirstDataRendered={onFirstDataRendered}
        />
      </div>
    </div>
  );
};

export default ImportLCBillPaymentSheetGrid;
