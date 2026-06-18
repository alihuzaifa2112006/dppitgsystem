import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Delete, Get } from 'src/api/apibasemethods';
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
import { IconButton, Tooltip, TextField, InputAdornment, Button } from '@mui/material';
import { Box, Stack, textAlign } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import { APP_API_STORAGE } from 'src/config-global';
import PropTypes from 'prop-types';
import { fDate } from 'src/utils/format-time';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import DialogHistory from './DialogHistory';
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
      // eslint-disable-next-line
      if (data?.PiFor === 'C') {
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
            <span style={{ textOverflow: 'ellipsis' }}>No approver required</span>
          </div>
        );
      }
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
  if (params.data.PiFor === 'C') {
    return { backgroundColor: 'rgba(255, 165, 0, 0.1)' }; // Orange tint
  }
  return null;
};

const PiGrid = ({ superSearch, setAllPI }) => {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const themeDark = themeBalham.withPart(colorSchemeDarkBlue);
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Navigation function
  const moveToEditForm = (PIID) => {
    navigate(paths.dashboard.transaction.pi.edit(PIID));
  };
  const moveToRevisionForm = (PIID) => {
    navigate(paths.dashboard.transaction.pi.revision(PIID));
  };
  const moveToApproverForm = (PIID) => {
    navigate(paths.dashboard.transaction.pi.approver(PIID));
  };
  const moveToPDFView = (PIID) => {
    navigate(paths.dashboard.transaction.pi.pdf(PIID));
  };

  const deleteProformaInvoice = async () => {
    if (!selectedPIID) {
      enqueueSnackbar('Proforma ID not selected.', { variant: 'error' });
      return;
    }
    try {
      const response = await Delete(`DeleteProformaInvoice?piid=${selectedPIID}`);
      if (response.status === 200) {
        enqueueSnackbar('Proforma invoice deleted successfully', { variant: 'success' });
        fetchPis();
      } else {
        enqueueSnackbar('Failed to delete proforma invoice', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting proforma invoice:', error);
      enqueueSnackbar('Error deleting proforma invoice', { variant: 'error' });
    }
  };

  // State for grid data
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchParams, setSearchParams] = useState({
    PINo: '',
    customer: '',
    QuotationNo: '',
    opportunity: '',
    status: '',
  });
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  const confirm = useBoolean();
  const [selectedPIID, setSelectedPIID] = useState(null);
  const [selectedPIRow, setSelectedPIRow] = useState(null);

  const containerStyle = useMemo(() => ({ width: '100%', height: '500px' }), []);

  // Fetch pi data
  const fetchPis = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `GetAllRevisePIList?ORGID=${userData?.userDetails?.orgId}&BRANCHID=${userData?.userDetails?.branchID}&RoleID=${70}&UserID=${userData?.userDetails?.userId}`
      );

      if (response.status === 200 && response.data.Success) {
        const res = await Get(
          `getDocumentApproverByID?&ApproverID=${userData?.userDetails?.userId}&DocID=2`
        );

        let data = res?.data || [];
        if (res?.data?.Data) {
          data = res?.data?.Data || [];
        }
        const formattedData = response.data.ProformaMst.map((pi) => {
          // Find all details for this pi
          const details = response.data.ProformaDtl.filter((detail) => detail.PIID === pi.PIID);

          // For each detail, find its history
          const detailsWithHistory = details.map((detail) => ({
            ...detail,
            Symbol: pi?.Symbol,
            history: response.data.ProformaDtlHistory.filter(
              (history) => history.PIDtlID === detail.PIDtlID
            ),
          }));

          const hasApproved =
            pi?.Level1_Approve === 'A' && pi?.Level2_Approve === 'A' && pi?.Level3_Approve === 'A';
          let image1;
          let image2;
          let image3;

          if (pi.Level1_Approved_ID !== null) {
            image1 =
              pi?.Approver1_Image !== ''
                ? `${APP_API_STORAGE}${pi?.Approver1_Image}`
                : '/assets/images/dummy.jpg';
          }
          if (pi.Level2_Approved_ID !== null) {
            image2 =
              pi?.Approver2_Image !== ''
                ? `${APP_API_STORAGE}${pi?.Approver2_Image}`
                : '/assets/images/dummy.jpg';
          }
          if (pi.Level3_Approved_ID !== null) {
            image3 =
              pi?.Approver3_Image !== ''
                ? `${APP_API_STORAGE}${pi?.Approver3_Image}`
                : '/assets/images/dummy.jpg';
          }

          return {
            ...pi,
            PINo: pi?.ApplyForReapproval ? `${pi?.PINo}-R${pi?.HistoryCount}` : pi?.PINo,
            hasApproved,
            Approver1_Image: image1,
            Approver2_Image: image2,
            Approver3_Image: image3,
            Level1_Approve:
              pi?.Level1_Approve === 'A'
                ? 'Approved'
                : pi?.Level1_Approve === 'R'
                  ? 'Rejected'
                  : 'Pending',
            Level2_Approve:
              pi?.Level2_Approve === 'A'
                ? 'Approved'
                : pi?.Level2_Approve === 'R'
                  ? 'Rejected'
                  : 'Pending',
            Level3_Approve:
              pi?.Level3_Approve === 'A'
                ? 'Approved'
                : pi?.Level3_Approve === 'R'
                  ? 'Rejected'
                  : 'Pending',

            ProformaDtl: detailsWithHistory,
          };
        });
        if (data?.length > 0) {
          const updatedData = formattedData?.map((item) => {
            // Get the current approval level from data[0]
            const currentApprovalLevel = data[0]?.Approval_Lvl_ID;

            let toApprove = false;

            // Only check conditions for the current approval level
            if (currentApprovalLevel === 1) {
              toApprove = item?.Level1_Approve !== 'Approved';
            } else if (currentApprovalLevel === 2) {
              toApprove = item?.Level2_Approve !== 'Approved';
            } else if (currentApprovalLevel === 3) {
              toApprove = item?.Level3_Approve !== 'Approved';
            }

            return {
              ...item,
              ToBeApproved: toApprove,
            };
          });
          setRowData(updatedData);
          setAllPI(response.data.ProformaMst);
        } else {
          setRowData(formattedData);
          setAllPI(response.data.ProformaMst);
        }
      } else {
        setRowData([]);
        enqueueSnackbar(response.data.Message || 'No data found', { variant: 'info' });
        setAllPI([]);
      }
    } catch (error) {
      console.error(error);
      // enqueueSnackbar('Failed to load pis', { variant: 'error' });
      setRowData([]);
      setAllPI([]);
    } finally {
      setLoading(false);
    }
  }, [setAllPI, userData, enqueueSnackbar]);

  useEffect(() => {
    fetchPis();
  }, [fetchPis]);

  // Filter data based on search parameters
  const filteredData = useMemo(
    () =>
      rowData.filter(
        (pi) =>
          pi.PINo.trim().toLowerCase().includes(searchParams?.PINo?.trim().toLowerCase()) &&
          pi?.WIC_Name?.toLowerCase().includes(searchParams?.customer?.toLowerCase()) &&
          pi?.QuotationNo?.toLowerCase().includes(searchParams?.QuotationNo.toLowerCase()) &&
          (pi?.OpportunityName || '')
            .toLowerCase()
            .includes(searchParams?.opportunity?.toLowerCase()) &&
          pi.PIStatus.toLowerCase().includes(searchParams?.status?.toLowerCase())
      ),
    [rowData, searchParams]
  );

  // Action button renderers
  const editButtonRenderer = (params) => (
    <Tooltip title="Edit" arrow>
      <IconButton
        onClick={() => moveToEditForm(params.data.PIID)}
        disabled={params.data.hasApproved}
        size="small"
        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:pen-bold" width={18} />
      </IconButton>
    </Tooltip>
  );
  const revisionButtonRenderer = (params) => (
    <Tooltip title="Revision" arrow>
      <IconButton
        onClick={() => moveToRevisionForm(params.data.PIID)}
        disabled={params.data.hasApproved}
        size="small"
        sx={{ padding: '4px' }}
      >
        <Iconify icon="ic:twotone-new-label" width={18} />
      </IconButton>
    </Tooltip>
  );
  const approverButtonRenderer = (params) => (
    <Tooltip title={params.data.ToBeApproved ? 'View and Approve' : 'View'} arrow>
      <IconButton
        onClick={() => moveToApproverForm(params.data.PIID)}
        size="small"
        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:eye-bold" width={18} />
      </IconButton>
    </Tooltip>
  );

  const pdfButtonRenderer = (params) => (
    <Tooltip title="View PDF" arrow>
      {params.data.PiFor === 'C' ?
        <IconButton
          onClick={() => moveToPDFView(params.data.PIID)}
          size="small"
          sx={{ padding: '4px' }}
        >
          <Iconify icon="mdi:file-pdf-box" width="20" height="20" />
        </IconButton> : <IconButton
          onClick={() => moveToPDFView(params.data.PIID)}
          size="small"
          disabled={params.data.Level1_Approve === 'Pending'}
          sx={{ padding: '4px' }}
        >
          <Iconify icon="mdi:file-pdf-box" width="20" height="20" />
        </IconButton>}
    </Tooltip>
  );

  const deleteButtonRenderer = (params) => (
    <Tooltip title="Delete" arrow>
      <IconButton
        onClick={() => {
          setSelectedPIID(params.data.PIID);
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

  const historyButtonRenderer = (params) => (
    <Tooltip title="Reopen History" arrow>
      <IconButton
        onClick={() => {
          setSelectedPIID(params.data.PIID);
          setSelectedPIRow(params.data);
          setHistoryDialogOpen(true);
        }}
        size="small"
        sx={{ padding: '4px' }}
        // This is the key change.
        // If params.data.ApplyForReapproval is not 'Y', the disabled prop is true.
        disabled={params.data.ApplyForReapproval !== 'Y'}
      >
        <Iconify icon="uil:clock" width="20" height="20" />
      </IconButton>
    </Tooltip>
  );
  const handleCloseHistoryDialog = () => {
    setHistoryDialogOpen(false);
    setSelectedPIID(null);
    setSelectedPIRow(null);
  };

  const actionButtonsRenderer = (params) => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {approverButtonRenderer(params)}
      {revisionButtonRenderer(params)}
      {editButtonRenderer(params)}
      {pdfButtonRenderer(params)}
      {deleteButtonRenderer(params)}
      {historyButtonRenderer(params)}
    </div>
  );

  // Master grid column definitions
  const [columnDefs] = useState([
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
      field: 'PINo',
      headerName: 'PI No',
      minWidth: 170,
      filter: 'agTextColumnFilter',
      cellStyle: { marginTop: '2px' },
    },
    {
      field: 'WIC_Name',
      headerName: 'Customer',
      minWidth: 200,
      filter: 'agTextColumnFilter',
      cellStyle: { marginTop: '2px' },
    },
    {
      field: 'End_Cust_Name',
      headerName: 'Main Buyer',
      minWidth: 200,
      filter: 'agTextColumnFilter',
      cellStyle: { marginTop: '2px' },
    },
    {
      field: 'QuotationNo',
      headerName: 'Quotation No.',
      minWidth: 120,
      filter: 'agTextColumnFilter',
      cellStyle: { marginTop: '2px' },
      hide: true,
    },
    {
      field: 'OpportunityName',
      headerName: 'Opportunity',
      minWidth: 120,
      filter: 'agTextColumnFilter',
      cellStyle: { marginTop: '2px' },
      hide: true,
    },
    {
      field: 'Level1_Approve',
      headerName: 'Status Prepared By',
      minWidth: 120,
      filter: 'agSetColumnFilter',
      cellRenderer: StatusRenderer,
      cellStyle: { marginTop: '2px' },
      hide: true,
    },
    {
      field: 'Approver1_Name',
      headerName: 'Prepared By',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      // cellStyle: { marginTop: '2px' },
      cellRenderer: ImageNameRender(1),
      // hide: true,
    },
    {
      field: 'Level1_Approved_Remarks',
      headerName: '1st Approver Remarks',
      minWidth: 150,
      filter: 'agTextColumnFilter',

      cellStyle: { marginTop: '2px' },
      hide: true,
    },
    {
      field: 'Level2_Approve',
      headerName: 'Checked Status',
      minWidth: 120,
      filter: 'agSetColumnFilter',
      cellRenderer: StatusRenderer,
      cellStyle: { marginTop: '2px' },
      // hide: true,
    },
    {
      field: 'Approver2_Name',
      headerName: 'Checked By',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      cellRenderer: ImageNameRender(2),
      // hide: true,

      // cellStyle: { marginTop: '2px' },
    },
    {
      field: 'Level2_Approved_Remarks',
      headerName: '2nd Approver Remarks',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      cellStyle: { marginTop: '2px' },
      hide: true,
    },
    {
      field: 'Level3_Approve',
      headerName: 'Approved Status',
      minWidth: 120,
      filter: 'agSetColumnFilter',
      cellRenderer: StatusRenderer,
      cellStyle: { marginTop: '2px' },
    },
    {
      field: 'Approver3_Name',
      headerName: 'Approved By',
      minWidth: 120,
      filter: 'agTextColumnFilter',
      cellRenderer: ImageNameRender(3),
      // cellStyle: { marginTop: '2px' },
    },
    {
      field: 'Level3_Approved_Remarks',
      headerName: '3rd Approver Remarks',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      cellStyle: { marginTop: '2px' },
      hide: true,
    },

    {
      field: 'PIDate',
      headerName: 'PI Date',
      minWidth: 120,
      valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
      cellStyle: { marginTop: '2px' },
    },
    {
      field: 'ValidFrom',
      headerName: 'Valid From',
      minWidth: 120,
      valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
      cellStyle: { marginTop: '2px' },
    },
    {
      field: 'ValidUntil',
      headerName: 'Valid Until',
      minWidth: 120,
      valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
      cellStyle: { marginTop: '2px' },
    },
    {
      field: 'IsRevised',
      headerName: 'Revised',
      minWidth: 100,
      valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
      cellStyle: { marginTop: '2px' },
    },
    // {
    //   field: 'PIStatus',
    //   headerName: 'Status',
    //   minWidth: 120,
    //   filter: 'agSetColumnFilter',
    //   cellRenderer: StatusRenderer,
    //   cellStyle: { marginTop: '2px' },
    // },
    {
      field: 'actions',
      headerName: '',
      minWidth: 200,
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

  // Detail grid column definitions
  const detailGridOptions = {
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
        minWidth: 300,
        filter: 'agTextColumnFilter',
      },
      // {
      //   field: 'Product_Name',
      //   headerName: 'Product',
      //   minWidth: 300,
      //   filter: 'agTextColumnFilter',
      // },
      {
        field: 'Description',
        headerName: 'Product Description',
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
        valueFormatter: (params) => `${fNumber(params.value)} ${params.data.UOMNAME} `,
      },
      // {
      //   field: 'UOMNAME',
      //   headerName: 'Unit',
      //   minWidth: 80,
      // },
      {
        field: 'UnitPrice',
        headerName: 'Unit Price',
        minWidth: 120,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) =>
          params.value ? `${params.data.Symbol}${fNumber(params.value)}` : '',
      },
      {
        field: 'Total_Amount',
        headerName: 'Total Amount',
        minWidth: 140,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) =>
          params.value ? `${params.data.Symbol}${fNumber(params.value)}` : '',
      },
      {
        field: 'Revision_No',
        headerName: 'Revision',
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        minWidth: 100,
      },
    ],
    defaultColDef: {
      flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
    },
    masterDetail: true,
    detailCellRendererParams: {
      detailGridOptions: {
        columnDefs: [
          {
            field: 'Revision_No',
            headerName: 'Revision',
            minWidth: 100,
          },
          {
            field: 'Description',
            headerName: 'Product Description',
            minWidth: 400,
            filter: 'agTextColumnFilter',
          },
          {
            field: 'Revision_Date',
            headerName: 'Date',
            minWidth: 150,
            valueFormatter: (params) =>
              params.value ? new Date(params.value).toLocaleString() : '',
          },
          {
            field: 'Quantity',
            headerName: 'Quantity',
            headerClass: 'ag-right-aligned-header',
            cellStyle: { textAlign: 'right' },
            minWidth: 100,
          },
          {
            field: 'Unit_Price',
            headerName: 'Unit Price',
            headerClass: 'ag-right-aligned-header',
            cellStyle: { textAlign: 'right' },
            minWidth: 120,
            valueFormatter: (params) => (params.value ? `$${params.value.toFixed(2)}` : ''),
          },
          {
            field: 'Amount',
            headerName: 'Amount',
            headerClass: 'ag-right-aligned-header',
            cellStyle: { textAlign: 'right' },
            minWidth: 120,
            valueFormatter: (params) => (params.value ? `$${params.value.toFixed(2)}` : ''),
          },
        ],
        defaultColDef: {
          flex: 1,
          sortable: true,
          filter: true,
          resizable: true,
        },
      },
      getDetailRowData: (params) => {
        params.successCallback(params.data.history);
      },
    },
  };

  // Configure master-detail relationship
  const detailCellRendererParams = useMemo(
    () => ({
      // eslint-disable-next-line
      detailGridOptions: detailGridOptions,
      getDetailRowData: (params) => {
        params.successCallback(params.data.ProformaDtl);
      },
    }),
    // eslint-disable-next-line
    []
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
    // <div style={containerStyle}>
    <>
      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Search PI No"
            variant="outlined"
            size="small"
            value={searchParams.PINo}
            onChange={handleSearchChange('PINo')}
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
          />
          {/* <TextField
            label="Search Opportunity"
            variant="outlined"
            size="small"
            value={searchParams.opportunity}
            onChange={handleSearchChange('opportunity')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} />
                </InputAdornment>
              ),
            }}
          /> */}
          {/* <TextField
            label="Search Status"
            variant="outlined"
            size="small"
            value={searchParams.status}
            onChange={handleSearchChange('status')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} />
                </InputAdornment>
              ),
            }}
          /> */}
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
      <Box
        sx={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top left',
          width: `${100 / zoomLevel}%`,
          height: `${100 / zoomLevel}%`,
        }}
      >
        <Scrollbar>
          <div style={{ width: '100%' }}>
            <AgGridReact
              className="ag-theme-material"
              theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
              rowData={filteredData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              rowHeight={35}
              headerHeight={40}
              masterDetail
              detailCellRendererParams={detailCellRendererParams}
              animateRows
              pagination
              getRowStyle={getRowStyle}
              paginationPageSize={20}
              domLayout="autoHeight"
              suppressRowClickSelection
              onFirstDataRendered={onFirstDataRendered}
              loading={loading}
            />
          </div>
        </Scrollbar>

        <ConfirmDialog
          open={confirm.value}
          onClose={() => {
            confirm.onFalse();
            setSelectedPIID(null); // Clear selected PIID on close
          }}
          title="Delete"
          content="Are you sure want to delete?"
          action={
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                deleteProformaInvoice();
                confirm.onFalse();
              }}
            >
              Delete
            </Button>
          }
        />

        <DialogHistory
          open={historyDialogOpen}
          onClose={handleCloseHistoryDialog}
          piId={selectedPIID}
          currentPi={selectedPIRow}
        />
      </Box>
      {/* // </div> */}
    </>
  );
};

export default PiGrid;

PiGrid.propTypes = {
  superSearch: PropTypes.any,
  setAllPI: PropTypes.func,
};
