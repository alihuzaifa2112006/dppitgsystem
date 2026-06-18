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

const QuotationGrid = () => {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const themeDark = themeBalham.withPart(colorSchemeDarkBlue);
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Navigation function
  const moveToEditForm = (quotationId) => {
    navigate(paths.dashboard.transaction.quotation.edit(quotationId));
  };
  const moveToApprovalForm = (quotationId) => {
    navigate(paths.dashboard.transaction.quotation.approval(quotationId));
  };
  const moveToPDFView = (quotationId) => {
    navigate(paths.dashboard.transaction.quotation.pdf(quotationId));
  };

  // State for grid data
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchParams, setSearchParams] = useState({
    quotationNo: '',
    customer: '',
    opportunity: '',
    status: '',
  });
  const containerStyle = useMemo(() => ({ width: '100%', height: '500px' }), []);

  // Fetch quotation data
  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `GetAllRevisedQuotations?ORGID=${userData?.userDetails?.orgId}&BRANCHID=${userData?.userDetails?.branchID}&RoleID=${70}&UserID=${userData?.userDetails?.userId}`
      );

      if (response.status === 200 && response.data.Success) {
        const res = await Get(
          `getDocumentApproverByID?&ApproverID=${userData?.userDetails?.userId}&DocID=1`
        );

        let data = res?.data || [];
        if (res?.data?.Data) {
          data = res?.data?.Data || [];
        }

        const formattedData = response.data.QuotationMst.map((quotation) => {
          // Find all details for this quotation
          const details = response.data.QuotationDtl.filter(
            (detail) => detail.QuotationID === quotation.QuotationID
          );

          // For each detail, find its history
          const detailsWithHistory = details.map((detail) => ({
            ...detail,
            history: response.data.QuotationDtlHistory.filter(
              (history) => history.Quotation_Dtl_ID === detail.QuotationDtlID
            ),
          }));
          const hasApproved = quotation.Level1_Approve === 'A' || quotation.Level2_Approve === 'A';
          let image1;
          let image2;
          let image3;
          console.log('Quotation:', quotation);
          if (quotation.Level1_Approved_ID !== null) {
            image1 =
              quotation?.Level1_Approve_Image !== ''
                ? `${APP_API_STORAGE}${quotation?.Level1_Approve_Image}`
                : '/assets/images/dummy.jpg';
          }
          if (quotation.Level2_Approved_ID !== null) {
            image2 =
              quotation?.Level2_Approve_Image !== ''
                ? `${APP_API_STORAGE}${quotation?.Level2_Approve_Image}`
                : '/assets/images/dummy.jpg';
          }
          if (quotation.Level3_Approved_ID !== null) {
            image3 =
              quotation?.Level3_Approve_Image !== ''
                ? `${APP_API_STORAGE}${quotation?.Level3_Approve_Image}`
                : '/assets/images/dummy.jpg';
          }

          return {
            ...quotation,
            Level1_Approve_Image: image1,
            Level2_Approve_Image: image2,
            Level3_Approve_Image: image3,
            hasApproved,

            Level1_Approve:
              quotation.Level1_Approve === 'A'
                ? 'Approved'
                : quotation.Level1_Approve === 'R'
                  ? 'Rejected'
                  : 'Pending',
            Level2_Approve:
              quotation.Level2_Approve === 'A'
                ? 'Approved'
                : quotation.Level2_Approve === 'R'
                  ? 'Rejected'
                  : 'Pending',

            QuotationDtl: detailsWithHistory,
          };
        });
        if (data?.length > 0) {
          const updatedData = formattedData?.map((item) => {
            const toApprove =
              (data[0]?.Approval_Lvl_ID === 1 && !item?.Level1_Approved_ID) ||
              (data[0]?.Approval_Lvl_ID === 2 && !item?.Level2_Approved_ID);
            return {
              ...item,
              ToBeApproved: toApprove,
            };
          });
          console.log('Updated Data:', updatedData);
          setRowData(updatedData);
        } else {
          setRowData(formattedData);
        }
      } else {
        setRowData([]);
        enqueueSnackbar(response.data.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      // enqueueSnackbar('Failed to load quotations', { variant: 'error' });
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar]);
  console.log(rowData);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  // Filter data based on search parameters
  const filteredData = useMemo(
    () =>
      rowData.filter(
        (quotation) =>
          quotation?.QuotationNo.toLowerCase()?.includes(searchParams.quotationNo.toLowerCase()) &&
          quotation?.WIC_Name?.toLowerCase()?.includes(searchParams.customer.toLowerCase()) &&
          (quotation?.OpportunityName || '')
            ?.toLowerCase()
            ?.includes(searchParams.opportunity.toLowerCase()) &&
          quotation?.QuotationStatus?.toLowerCase()?.includes(searchParams.status.toLowerCase())
      ),
    [rowData, searchParams]
  );

  // Action button renderers
  const editButtonRenderer = (params) => (
    // if (params.data?.CreatedBy === userData?.userDetails?.userId && !params.data.hasApproved) {
    <Tooltip title="Edit" arrow>
      <IconButton
        onClick={() => moveToEditForm(params.data.QuotationID)}
        size="small"
        disabled={
          params.data?.CreatedBy !== userData?.userDetails?.userId && params.data.hasApproved
        }
        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:pen-bold" width={18} />
      </IconButton>
    </Tooltip>
  );

  const approvalButtonRenderer = (params) => (
    <Tooltip title={params.data.ToBeApproved ? 'View and Approve' : 'View'} arrow>
      <IconButton
        onClick={() => {
          moveToApprovalForm(params.data.QuotationID);
        }}
        size="small"
        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:eye-bold" width={18} />
      </IconButton>
    </Tooltip>
  );

  const pdfButtonRenderer = (params) => (
    <Tooltip title="View PDF" arrow>
      <IconButton
        onClick={() => moveToPDFView(params.data.QuotationID)}
        size="small"
        disabled={
          params.data.Level1_Approve !== 'Approved' && params.data.Level2_Approve !== 'Approved'
        }
        sx={{ padding: '4px' }}
      >
        <Iconify icon="mdi:file-pdf-box" width={18} />
      </IconButton>
    </Tooltip>
  );

  const actionButtonsRenderer = (params) => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {approvalButtonRenderer(params)}
      {editButtonRenderer(params)}
      {pdfButtonRenderer(params)}
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
      field: 'QuotationNo',
      headerName: 'Quotation No',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'WIC_Name',
      headerName: 'Customer',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'OpportunityName',
      headerName: 'Opportunity',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'Level1_Approve',
      headerName: '1st Approval Status',
      minWidth: 120,
      filter: 'agSetColumnFilter',
      cellRenderer: StatusRenderer,
      cellStyle: { marginTop: '2px' },
    },
    {
      field: 'Level1_Approver_Name',
      headerName: '1st Approver',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      // cellStyle: { marginTop: '2px' },
      cellRenderer: ImageNameRender(1),
    },
    // {
    //   field: 'Approver1_Name',
    //   headerName: 'Approver Level 1 Name',
    //   width: 200,
    //   filter: 'agTextColumnFilter',
    // },
    {
      field: 'Level1_Approved_Remarks',
      headerName: '1st Approver Remarks',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      cellStyle: { marginTop: '2px' },
    },
    {
      field: 'Level2_Approve',
      headerName: '2nd Approval Status',
      width: 120,
      minWidth: 120,
      filter: 'agSetColumnFilter',
      cellRenderer: StatusRenderer,
      // cellStyle: { marginTop: '2px' },
    },
    {
      field: 'Level2_Approver_Name',
      headerName: '2nd Approver',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      // cellStyle: { marginTop: '2px' },
      cellRenderer: ImageNameRender(2),
    },
    {
      field: 'Level2_Approved_Remarks',
      headerName: '2nd Approver Remarks',
      minWidth: 150,
      filter: 'agTextColumnFilter',
      cellStyle: { marginTop: '2px' },
    },
    {
      field: 'ValidFrom',
      headerName: 'Valid From',
      minWidth: 120,
      valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
    },
    {
      field: 'ValidUntil',
      headerName: 'Valid Until',
      minWidth: 120,
      valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
    },
    {
      field: 'IsRevised',
      headerName: 'Revised',
      minWidth: 80,
      valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
    },
    {
      field: 'actions',
      headerName: '',
      minWidth: 120,
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
    columnDefs: [
      {
        field: 'expand',
        headerName: '',
        filter: false,
        width: 20,
        lockPosition: 'left',
        sortable: false,
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
          suppressCount: true,
          innerRenderer: (params) => (params.value ? params.value : ''),
        },
      },
      {
        field: 'Description',
        headerName: 'Product Description',
        width: 400,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Remarks',
        headerName: 'Requirement',
        width: 200,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Quantity',
        headerName: 'Quantity',
        width: 100,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
      },
      {
        field: 'UOMName',
        headerName: 'UOM',
        width: 80,
      },
      {
        field: 'UnitPrice',
        headerName: 'Unit Price',
        width: 120,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? `$${params.value.toFixed(2)}` : ''),
      },
      {
        field: 'Total_Amount',
        headerName: 'Total Amount',
        width: 140,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
        valueFormatter: (params) => (params.value ? `$${params.value.toFixed(2)}` : ''),
      },
      {
        field: 'Revision_No',
        headerName: 'Revision',
        width: 100,
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
            width: 100,
          },
          {
            field: 'Revision_Date',
            headerName: 'Date',
            width: 150,
            valueFormatter: (params) =>
              params.value ? new Date(params.value).toLocaleString() : '',
          },
          {
            field: 'Unit_Price',
            headerName: 'Unit Price',
            width: 120,
            valueFormatter: (params) => (params.value ? `$${params.value.toFixed(2)}` : ''),
          },
          {
            field: 'Quantity',
            headerName: 'Quantity',
            width: 100,
          },
          {
            field: 'Amount',
            headerName: 'Amount',
            width: 120,
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
        params.successCallback(params.data.QuotationDtl);
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
    <div style={containerStyle}>
      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Search Quotation No"
            variant="outlined"
            size="small"
            value={searchParams.quotationNo}
            onChange={handleSearchChange('quotationNo')}
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
          />
          <TextField
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

export default QuotationGrid;
