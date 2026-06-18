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
import {
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  ListItemButton,
  Checkbox,
  ListItemText,
  Divider,
  DialogActions,
  List,
} from '@mui/material';
import { Stack, textAlign } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import { APP_API_STORAGE } from 'src/config-global';
import PropTypes from 'prop-types';
import { fDate } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

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
        padding: '0px 6px',
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

const ImageNameRender =
  (id) =>
  // eslint-disable-next-line
  ({ data }) => {
    const name = data?.[`Approver${id}_Name`] || '';
    const image = data?.[`Approver${id}_Image`] || '';

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

const getRowStyle = (params) => {
  if (params.data.ApplyForReapproval === 'Y') {
    return { backgroundColor: 'rgba(99, 145, 58, 0.1)' }; // CYCLO green background
  }
  return null;
};

const PiGrid = ({ superSearch }) => {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const themeDark = themeBalham.withPart(colorSchemeDarkBlue);
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Export Invoice data states
  const [exportInvoiceMasterData, setExportInvoiceMasterData] = useState([]);
  const [exportInvoiceDetailData, setExportInvoiceDetailData] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});

  // Navigation function
  const moveToEditForm = (ExportInvoiceID) => {
    navigate(paths.dashboard.Commercial.export.ExportInvoice.edit(ExportInvoiceID));
  };

  const moveToPDFView = (ExportInvoiceID) => {
    navigate(paths.dashboard.Commercial.export.ExportInvoice.pdf(ExportInvoiceID));
  };

  // State for grid data
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchParams, setSearchParams] = useState({
    ExportInvoiceNo: '',
    customer: '',
    LCNo: '',
  });

  const containerStyle = useMemo(() => ({ width: '100%', height: '500px' }), []);
  // pdf logic
  const [openPDFList, setOpenPDFList] = useState(false);

  const [selectedPDFs, setSelectedPDFs] = useState([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  const handleOpenPDFList = (invoiceData) => {
    setSelectedInvoiceId(invoiceData.ExportInvoiceID);
    setOpenPDFList(true);
  };

  // Update the handleClosePDFList function
  const handleClosePDFList = () => {
    setSelectedInvoiceId(null);
    setSelectedPDFs([]);
    setOpenPDFList(false);
  };

  // 🔹 These are the PDF types you want to show in the dialog
  const availablePDFs = [
    { label: 'Commercial Invoice PDF', type: 'commercial' },
    { label: 'Packing List PDF', type: 'packing' },
    { label: 'Truck Challan PDF', type: 'TC' },
    { label: 'Delievery Challan PDF', type: 'DC' },
    { label: 'Inspection Certificate PDF', type: 'IC' },
    { label: 'Certificate of Origin PDF', type: 'CO' },
    { label: 'Bill of Exchange PDF', type: 'BOE' },
    // Add more if needed, e.g.
    // { label: 'Packing List PDF', type: 'packing' },
  ];
  // const moveToPDF = ({ pdfType, ExportInvoiceID }) => {
  //   // Example: /dashboard/commercial/exportinvoice/pdf/123?type=commercial
  //   navigate(
  //     `${paths.dashboard.Commercial.export.ExportInvoice.pdf(ExportInvoiceID)}?type=${pdfType}`
  //   );
  // };
  const handleTogglePDF = (type) => {
    setSelectedPDFs((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // ✅ When user confirms selection
  const handleViewSelectedPDFs = () => {
    if (selectedPDFs.length === 0 || !selectedInvoiceId) return;
    handleClosePDFList();

    const pdfParam = selectedPDFs.join(',');

    navigate(
      `${paths.dashboard.Commercial.export.ExportInvoice.pdf(selectedInvoiceId)}?type=${pdfParam}`
    );
  };

  // Fetch Export Invoice Master data
  const fetchExportInvoiceMasterData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `CommercialModule/GetExportInvoiceList?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );

      if (response.status === 200 && response.data.Success) {
        const masterData = response.data.Data || [];

        // Format the master data to match your grid structure
        const formattedData = masterData.map((invoice) => ({
          ...invoice,
          ExportInvoiceNo: invoice.ExportInvoiceNo || '-',
          ExportInvoiceDate: invoice.ExportInvoiceDate
            ? invoice.ExportInvoiceDate.split('T')[0]
            : '',
          CustomerName: invoice.CustomerName || '-',
          ExportLCNo: invoice.ExportLCNo || '-',
          LCDate: invoice.LCDate ? invoice.LCDate.split('T')[0] : '',
          ExportLCAmount: invoice.ExportLCAmount ? invoice.ExportLCAmount.toFixed(2) : '0.00',
          GoodsValue: invoice.GoodsValue ? invoice.GoodsValue.toFixed(2) : '0.00',
          Commission: invoice.Commission ? invoice.Commission.toFixed(2) : '0.00',
          AdjustmentAmount: invoice.AdjustmentAmount ? invoice.AdjustmentAmount.toFixed(2) : '0.00',
          ExportInvoiceValue: invoice.ExportInvoiceValue
            ? invoice.ExportInvoiceValue.toFixed(2)
            : '0.00',
          ExchangeRate: invoice.ExchangeRate ? invoice.ExchangeRate.toFixed(4) : '0.0000',
          InvoiceValueInTK: invoice.InvoiceValueInTK ? invoice.InvoiceValueInTK.toFixed(2) : '0.00',
          InvoiceQty: invoice.InvoiceQty || '0',
          Remarks: invoice.Remarks || 'N/A',
        }));

        setExportInvoiceMasterData(formattedData);

        // Initialize detail data structure
        const initialDetailData = {};
        formattedData.forEach((invoice) => {
          initialDetailData[invoice.ExportInvoiceID] = null; // null means not loaded yet
        });
        setExportInvoiceDetailData(initialDetailData);
      } else {
        setExportInvoiceMasterData([]);
        enqueueSnackbar(response.data.Message || 'No export invoice data found', {
          variant: 'info',
        });
      }
    } catch (error) {
      console.error('Error fetching export invoice master data:', error);
      setExportInvoiceMasterData([]);
      enqueueSnackbar('Error fetching export invoice data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar]);

  // Fetch Export Invoice Detail data
  const fetchExportInvoiceDetailData = useCallback(
    async (exportInvoiceId) => {
      if (
        exportInvoiceDetailData[exportInvoiceId] !== null &&
        exportInvoiceDetailData[exportInvoiceId] !== undefined
      ) {
        return; // Already loaded or loading
      }

      try {
        setLoadingDetails((prev) => ({ ...prev, [exportInvoiceId]: true }));

        const response = await Get(
          `CommercialModule/GetExportInvoiceDetailsByID?ExportInvoiceID=${exportInvoiceId}`
        );

        if (response.status === 200 && Array.isArray(response.data)) {
          // API returns array directly
          const detailData = response.data || [];

          setExportInvoiceDetailData((prev) => ({
            ...prev,
            [exportInvoiceId]: detailData,
          }));
        } else {
          setExportInvoiceDetailData((prev) => ({
            ...prev,
            [exportInvoiceId]: [], // Empty array if no details found
          }));
        }
      } catch (error) {
        console.error(`Error fetching details for Export Invoice ${exportInvoiceId}:`, error);
        setExportInvoiceDetailData((prev) => ({
          ...prev,
          [exportInvoiceId]: [], // Empty array on error
        }));
      } finally {
        setLoadingDetails((prev) => ({ ...prev, [exportInvoiceId]: false }));
      }
    },
    [exportInvoiceDetailData]
  );

  useEffect(() => {
    fetchExportInvoiceMasterData();
  }, [fetchExportInvoiceMasterData]);
  // eslint-disable-next-line
  const filteredData = useMemo(() => {
    return exportInvoiceMasterData.filter(
      (item) =>
        item.ExportInvoiceNo?.trim()
          .toLowerCase()
          .includes(searchParams?.ExportInvoiceNo?.trim().toLowerCase()) &&
        item.CustomerName?.toLowerCase().includes(searchParams?.customer?.toLowerCase()) &&
        item.ExportLCNo?.toLowerCase().includes(searchParams?.LCNo?.toLowerCase())
    );
  }, [exportInvoiceMasterData, searchParams]);

  // Action button renderers
  const editButtonRenderer = (params) => (
    <Tooltip title="Edit Export Invoice" arrow>
      <IconButton
        onClick={() => moveToEditForm(params.data.ExportInvoiceID)}
        disabled
        size="small"
        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:pen-bold" width={18} />
      </IconButton>
    </Tooltip>
  );

  const pdfButtonRenderer = (params) => (
    <Tooltip title="View PDF" arrow>
      <IconButton
        onClick={() => params.data?.ExportInvoiceID && handleOpenPDFList(params.data)}
        size="small"
        sx={{ padding: '4px' }}
      >
        <Iconify icon="mdi:file-pdf-box" width="20" height="20" />
      </IconButton>
    </Tooltip>
  );

  const actionButtonsRenderer = (params) => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
      {editButtonRenderer(params)}
      {pdfButtonRenderer(params)}
    </div>
  );

  // Export Invoice Master grid column definitions
  const exportInvoiceColumnDefs = [
    {
      field: 'expand',
      maxWidth: 50,
      headerName: '',
      minWidth: 35,
      filter: false,
      autosize: true,
      sortable: false,
      resizable: false,
      lockPosition: 'left',
      cellRenderer: 'agGroupCellRenderer',
      cellRendererParams: {
        suppressCount: true,
        innerRenderer: (params) => (params.value ? params.value : ''),
      },
      cellStyle: { marginTop: '2px' },
    },
    {
      field: 'ExportInvoiceNo',
      headerName: 'Export Invoice No',
      minWidth: 180,
      filter: 'agTextColumnFilter',
      cellStyle: { marginTop: '2px' },
    },
    {
      field: 'ExportInvoiceDate',
      headerName: 'Invoice Date',
      minWidth: 120,
      valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
      cellStyle: { marginTop: '2px' },
    },
    {
      field: 'CustomerName',
      headerName: 'Customer',
      minWidth: 250,
      filter: 'agTextColumnFilter',
      cellStyle: { marginTop: '2px' },
    },
    {
      field: 'ExportLCNo',
      headerName: 'LC No',
      minWidth: 170,
      filter: 'agTextColumnFilter',
      cellStyle: { marginTop: '2px' },
    },
    {
      field: 'LCDate',
      headerName: 'LC Date',
      minWidth: 120,
      valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
      cellStyle: { marginTop: '2px' },
    },
    {
      field: 'GoodsValue',
      headerName: 'Goods Value',
      minWidth: 140,
      headerClass: 'ag-right-aligned-header',
      cellStyle: { textAlign: 'right', marginTop: '2px' },
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
    },
    {
      field: 'Commission',
      headerName: 'Commission',
      minWidth: 140,
      headerClass: 'ag-right-aligned-header',
      cellStyle: { textAlign: 'right', marginTop: '2px' },
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
    },
    {
      field: 'AdjustmentAmount',
      headerName: 'Adjustment',
      minWidth: 140,
      headerClass: 'ag-right-aligned-header',
      cellStyle: { textAlign: 'right', marginTop: '2px' },
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
    },
    {
      field: 'ExportInvoiceValue',
      headerName: 'Invoice Value',
      minWidth: 140,
      headerClass: 'ag-right-aligned-header',
      cellStyle: { textAlign: 'right', marginTop: '2px' },
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
    },
    {
      field: 'ExchangeRate',
      headerName: 'Exchange Rate',
      minWidth: 120,
      headerClass: 'ag-right-aligned-header',
      cellStyle: { textAlign: 'right', marginTop: '2px' },
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
    },
    {
      field: 'InvoiceValueInTK',
      headerName: 'Value in Tk',
      minWidth: 140,
      headerClass: 'ag-right-aligned-header',
      cellStyle: { textAlign: 'right', marginTop: '2px' },
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
    },
    {
      field: 'Remarks',
      headerName: 'Remarks',
      minWidth: 200,
      filter: 'agTextColumnFilter',
      cellStyle: { marginTop: '2px' },
    },
    {
      field: 'actions',
      headerName: '',
      maxWidth: 100,
      minWidth: 100,
      pinned: 'right',
      sortable: false,
      filter: false,
      resizable: false,
      cellRenderer: actionButtonsRenderer,
      lockPosition: 'right',
      cellStyle: { textAlign: 'right' },
    },
  ];

  // PI Detail grid column definitions
  const piDetailGridOptions = {
    components: {
      statusRenderer: StatusRenderer,
    },
    columnDefs: [
      {
        field: 'expand',
        headerName: '',
        filter: false,
        autosize: true,
        sortable: false,
        resizable: false,
        lockPosition: 'left',
        maxWidth: 50,
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
          suppressCount: true,
          innerRenderer: (params) => (params.value ? params.value : ''),
        },
      },
      {
        field: 'Item_Code',
        headerName: 'Item Code',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ProductDescription',
        headerName: 'Product Description', // Changed from 'Description'
        minWidth: 400,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Quantity',
        headerName: 'Quantity',
        minWidth: 100,
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => `${fNumber(params.value)} ${params.data.UOMName} `,
      },
      // {
      //   field: 'UOMName', // Changed from 'UOMNAME'
      //   headerName: 'Unit',
      //   minWidth: 80,
      // },
      {
        field: 'UnitPrice',
        headerName: 'Unit Price',
        minWidth: 120,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? `${params.value.toFixed(2)}` : ''),
      },
      {
        field: 'Total_Amount',
        headerName: 'Total Amount',
        minWidth: 140,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? `${params.value.toFixed(2)}` : ''),
      },
      // Remove Revision_No field since it's not in your API response
    ],
    defaultColDef: {
      flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
    },
    // Remove masterDetail and detailCellRendererParams from here since you're using single level
  };

  const exportInvoiceDetailGridOptions = {
    components: {
      statusRenderer: StatusRenderer,
    },
    columnDefs: [
      {
        field: 'PINo',
        headerName: 'PI No',
        minWidth: 180,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'WIC_Name',
        headerName: 'WIC Name',
        minWidth: 250,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Item_Code',
        headerName: 'Item Code',
        minWidth: 180,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ProductDescription',
        headerName: 'Product Description',
        minWidth: 350,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Color_and_Code',
        headerName: 'Color',
        minWidth: 120,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'PIQuantity',
        headerName: 'PI Quantity',
        minWidth: 120,
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? params.value.toFixed(2) : '0.00'),
      },
      {
        field: 'DeliveryQty',
        headerName: 'Delivery Qty',
        minWidth: 120,
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? params.value.toFixed(2) : '0.00'),
      },
      {
        field: 'BagQty',
        headerName: 'Bag Qty',
        minWidth: 100,
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? params.value.toFixed(2) : '0.00'),
      },
      {
        field: 'GrossWeight',
        headerName: 'Gross Weight',
        minWidth: 130,
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? params.value.toFixed(2) : '0.00'),
      },
      {
        field: 'NetWeight',
        headerName: 'Net Weight',
        minWidth: 120,
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? params.value.toFixed(2) : '0.00'),
      },
      {
        field: 'UOMName',
        headerName: 'UOM',
        minWidth: 80,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'TotalInvoiceQty',
        headerName: 'Total Invoice Qty',
        minWidth: 150,
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? params.value.toFixed(2) : '0.00'),
      },
      {
        field: 'TotalShippedQty',
        headerName: 'Total Shipped Qty',
        minWidth: 150,
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? params.value.toFixed(2) : '0.00'),
      },
    ],
    defaultColDef: {
      flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
    },
  };

  // Configure master-detail relationship for Export Invoice
  const exportInvoiceDetailCellRendererParams = useMemo(
    () => ({
      detailGridOptions: exportInvoiceDetailGridOptions,
      getDetailRowData: (params) => {
        const exportInvoiceId = params.data.ExportInvoiceID;
        params.node.setDataValue('loading', true);
        // If details not loaded yet, fetch them
        if (exportInvoiceDetailData[exportInvoiceId] === null) {
          fetchExportInvoiceDetailData(exportInvoiceId);
          params.node.setDataValue('loading', false);
          params.successCallback([]); // Show empty initially
        } else {
          params.node.setDataValue('loading', false);
          params.successCallback(exportInvoiceDetailData[exportInvoiceId] || []);
        }
      },
    }),
    // eslint-disable-next-line
    [exportInvoiceDetailData, fetchExportInvoiceDetailData]
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

  const getDetailRowStyle = (params) => {
    params.node.setDataValue('loading', true);
    const id = params.data.ExportInvoiceID;
    params.node.setDataValue('loading', false);
    if (exportInvoiceDetailData[id] === null) {
      return { opacity: 0.6, fontStyle: 'italic', color: '#999' };
    }
    return null;
  };
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
      {/* Header with Title */}
      {/* <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Export Invoice List</Typography>
        <Typography variant="body2" color="text.secondary">
          Total: {exportInvoiceMasterData.length} invoices
        </Typography>
      </Box> */}

      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Search Invoice No"
            variant="outlined"
            size="small"
            value={searchParams.ExportInvoiceNo}
            onChange={handleSearchChange('ExportInvoiceNo')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Search Customer"
            variant="outlined"
            size="small"
            value={searchParams.customer}
            onChange={handleSearchChange('customer')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Search LC No"
            variant="outlined"
            size="small"
            value={searchParams.LCNo}
            onChange={handleSearchChange('LCNo')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} />
                </InputAdornment>
              ),
            }}
          />
          {/* <TextField
            label="Search Quotation No"
            variant="outlined"
            size="small"
            value={searchParams.QuotationNo}
            onChange={handleSearchChange('QuotationNo')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} />
                </InputAdornment>
              ),
            }}
          /> */}
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
          height: `${150 / zoomLevel}%`,
          overflow: 'hidden',
        }}
      >
        <Scrollbar>
          <AgGridReact
            className="ag-theme-material"
            theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
            rowData={filteredData}
            columnDefs={exportInvoiceColumnDefs}
            defaultColDef={defaultColDef}
            rowHeight={35}
            headerHeight={40}
            masterDetail
            detailCellRendererParams={exportInvoiceDetailCellRendererParams}
            animateRows
            pagination
            getRowStyle={getRowStyle}
            paginationPageSize={50}
            domLayout="autoHeight"
            getDetailRowStyle={getDetailRowStyle}
            suppressRowClickSelection
            onFirstDataRendered={onFirstDataRendered}
          />
        </Scrollbar>
        <Dialog open={openPDFList} onClose={handleClosePDFList} maxWidth="xs" fullWidth>
          <DialogTitle>Select PDF(s) to View</DialogTitle>
          <DialogContent dividers>
            <List>
              {availablePDFs.map((pdf) => (
                <div key={pdf.type}>
                  <ListItemButton onClick={() => handleTogglePDF(pdf.type)}>
                    <Checkbox checked={selectedPDFs.includes(pdf.type)} />
                    <ListItemText primary={pdf.label} />
                  </ListItemButton>
                  <Divider />
                </div>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePDFList}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleViewSelectedPDFs}
              disabled={selectedPDFs.length === 0}
            >
              View Selected PDFs
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

PiGrid.propTypes = {
  superSearch: PropTypes.bool,
};

export default PiGrid;
