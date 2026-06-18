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
import { Stack, textAlign } from '@mui/system';
import Scrollbar from 'src/components/scrollbar';
import { fDate, fYear } from 'src/utils/format-time';

// Create a file called StatusRenderer.js or add this to your existing file
const StatusRenderer = (params) => {
  // eslint-disable-next-line
  const status = params.value;
  // eslint-disable-next-line
  let backgroundColor, textColor, borderColor;

  switch (status) {
    case 'Approved':
      backgroundColor = 'rgba(208, 245, 216, 0.5)';
      textColor = '#00a854';
      // borderColor = '#00a854';
      borderColor = 'rgba(208, 245, 216, 0.5)';
      break;
    case 'Rejected':
      backgroundColor = 'rgba(255, 204, 204, 0.5)';
      textColor = '#a80000';
      borderColor = 'rgba(255, 204, 204, 0.5)';
      break;
    case 'Pending':
      backgroundColor = '#fff7e6';
      textColor = '#fa8c16';
      // borderColor = '#fa8c16';
      break;
    default:
      backgroundColor = 'rgba(208, 245, 216, 0.5)';
      textColor = '#00a854';
      // borderColor = '#00a854';
      borderColor = 'rgba(208, 245, 216, 0.5)';
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

const PricelistGrid = () => {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const themeDark = themeBalham.withPart(colorSchemeDarkBlue);
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Navigation function
  const moveToEditForm = (PriceListID) => {
    navigate(paths.dashboard.transaction.priceList.newVersion(PriceListID));
  };
  const moveToPDFView = (PriceListID) => {
    navigate(paths.dashboard.transaction.priceList.pdf(PriceListID));
  };

  // State for grid data
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchParams, setSearchParams] = useState({
    PriceListName: '',
    // customer: '',
    // QuotationNo: '',
    // opportunity: '',
    // status: '',
  });
  const containerStyle = useMemo(() => ({ width: '100%', height: '500px' }), []);

  // Fetch pi data
  const fetchPis = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `GetProductPriceListVersions?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      if (response.status === 200) {
        // const decryptedData = decryptSpecialArray(response.data.ServiceRes);
        // const formattedData = formatPriceListData(response.data);
        const formattedData = response.data.PriceLists.map((pi) => {
          const currencySymbol = pi.Currency_ID === 2 ? '৳' : '$';

          const details = response.data.ProductPLVolume.filter(
            (detail) => detail.PriceListID === pi.PriceListID
          ).map((dtl) => ({
            ...dtl,
            Currency: currencySymbol,
            ColorNameCode: `${dtl.ColorName} - ${dtl.Color_Code}`,
            // Format prices with currency
            formattedProductPrice: `${currencySymbol} ${dtl.Product_Price?.toFixed(2) || '0.00'}`,
            formattedPriceRangeFrm: `${currencySymbol} ${
              dtl.Price_Range_Frm?.toFixed(2) || '0.00'
            }`,
            formattedPriceRangeTo: `${currencySymbol} ${dtl.Price_Range_To?.toFixed(2) || '0.00'}`,
          }));

          const detailsWithHistory = details.map((detail) => ({
            ...detail,
            history: response.data.ProductPLVolumeHistory.filter(
              (history) => history.ProductpriceListID === detail.ProductpriceListID
            ).map((his) => ({
              ...his,
              Currency: currencySymbol,
              ColorNameCode: `${his.ColorName} - ${his.Color_Code}`,
              // Format history prices with currency

              formattedProductPrice: `${currencySymbol} ${his.Product_Price?.toFixed(2) || '0.00'}`,
              formattedPriceRangeFrm: `${currencySymbol} ${
                his.Price_Range_Frm?.toFixed(2) || '0.00'
              }`,
              formattedPriceRangeTo: `${currencySymbol} ${
                his.Price_Range_To?.toFixed(2) || '0.00'
              }`,
            })),
          }));

          return {
            ...pi,
            Currency: currencySymbol,
            ProductPLVolume: detailsWithHistory,
          };
        });
        setRowData(formattedData);
      } else {
        setRowData([]);
        enqueueSnackbar(response.data.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load pis', { variant: 'error' });
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar]);

  useEffect(() => {
    fetchPis();
  }, [fetchPis]);

  // Filter data based on search parameters
  const filteredData = useMemo(
    () =>
      rowData.filter(
        (pi) =>
          pi.PriceListName.trim()
            .toLowerCase()
            .includes(searchParams?.PriceListName?.trim().toLowerCase())
        //   pi?.WIC_Name?.toLowerCase().includes(searchParams?.customer?.toLowerCase()) &&
        //   pi?.QuotationNo?.toLowerCase().includes(searchParams?.QuotationNo.toLowerCase()) &&
        //   (pi?.OpportunityName || '')
        //     .toLowerCase()
        //     .includes(searchParams?.opportunity?.toLowerCase()) &&
        //   pi.PIStatus.toLowerCase().includes(searchParams?.status?.toLowerCase())
      ),
    [rowData, searchParams]
  );

  // Action button renderers
  const editButtonRenderer = (params) => (
    <Tooltip title="Edit" arrow>
      <IconButton
        onClick={() => moveToEditForm(params.data.PriceListID)}
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
        onClick={() => moveToPDFView(params.data.PriceListID)}
        size="small"
        sx={{ padding: '4px' }}
      >
        <Iconify icon="mdi:file-pdf-box" width="20" height="20" />
      </IconButton>
    </Tooltip>
  );

  const actionButtonsRenderer = (params) => {
    console.log('params', params);
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {editButtonRenderer(params)}
        {params.data.PIStatus === 'Approved' && pdfButtonRenderer(params)}
      </div>
    );
  };

  // Master grid column definitions
  const [columnDefs] = useState([
    {
      field: 'expand',
      maxWidth: 50,
      headerName: '',
      width: 20,
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
      cellStyle: { paddingTop: '2px' },
    },
    {
      field: 'PriceListName',
      headerName: 'Pricelist Name',
      width: 150,
      filter: 'agTextColumnFilter',
      cellStyle: { paddingTop: '2px' },
    },
    {
      field: 'PriceListVer',
      headerName: 'Version',
      width: 120,
      filter: 'agSetColumnFilter',
      cellRenderer: StatusRenderer,
      cellStyle: { paddingTop: '2px' },
    },
    // {
    //   field: 'QuotationNo',
    //   headerName: 'Quotation No.',
    //   width: 250,
    //   filter: 'agTextColumnFilter',
    //   cellStyle: { marginTop: '2px' },
    // },
    // {
    //   field: 'OpportunityName',
    //   headerName: 'Opportunity',
    //   width: 250,
    //   filter: 'agTextColumnFilter',
    //   cellStyle: { marginTop: '2px' },
    // },
    {
      field: 'Valid_From',
      headerName: 'Valid From',
      width: 120,
      valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
      cellStyle: { paddingTop: '2px' },
    },
    {
      field: 'Valid_Until',
      headerName: 'Valid Until',
      width: 120,
      valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
      cellStyle: { paddingTop: '2px' },
    },
    {
      field: 'Currency_Name',
      headerName: 'Currency',
      width: 80,
      cellStyle: { paddingTop: '2px' },
    },
    // {
    //   field: 'IsRevised',
    //   headerName: 'Revised',
    //   width: 100,
    //   valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
    //   cellStyle: { paddingTop: '2px' },
    // },
    // {
    //   field: 'PIStatus',
    //   headerName: 'Status',
    //   width: 120,
    //   filter: 'agSetColumnFilter',
    //   cellRenderer: StatusRenderer,
    //   cellStyle: { marginTop: '2px' },
    // },
    {
      field: 'actions',
      headerName: '',
      width: 40,
      minWidth: 80,
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
        field: 'Year',
        headerName: 'Year',
        valueFormatter: (params) => (params.value ? fYear(new Date(params.value)) : ''),
        width: 60,
      },
      {
        field: 'Cust_Name',
        headerName: 'Customer',
        width: 140,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'End_Cust_Name',
        headerName: 'End Customer',
        width: 140,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Yarn_Count_Name',
        headerName: 'Yarn Count',
        width: 140,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Yarn_Type',
        headerName: 'Yarn Type',
        width: 140,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ColorNameCode',
        headerName: 'Color',
        width: 200,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Composition_Name',
        headerName: 'Composition Name',
        width: 400,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'formattedProductPrice',
        headerName: 'Product Price',
        width: 100,
        // valueFormatter: (params) =>
        //   params.value && `${rowData?.ProductPLVolume?.Currency} ${params.value}`,
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
      },
      {
        field: 'formattedPriceRangeFrm',
        headerName: 'Price Range From',
        width: 100,
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
      },
      {
        field: 'formattedPriceRangeTo',
        headerName: 'Price Range To',
        width: 100,
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
      },
      // {
      //   field: 'Currency',
      //   headerName: 'Currency',
      //   width: 80,
      // },
      {
        field: 'VersionNo',
        headerName: 'Revision',
        headerClass: 'ag-right-aligned-header',
        cellStyle: { textAlign: 'right' },
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
            field: 'VersionNo',
            headerName: 'Revision',
            width: 100,
          },
          //   {
          //     field: 'Description',
          //     headerName: 'Product Description',
          //     width: 400,
          //     filter: 'agTextColumnFilter',
          //   },
          // {
          //   field: 'Revision_Date',
          //   headerName: 'Date',
          //   width: 150,
          //   valueFormatter: (params) =>
          //     params.value ? new Date(params.value).toLocaleString() : '',
          // },
          {
            field: 'Yarn_Count_Name',
            headerName: 'Yarn Count',
            width: 140,
            filter: 'agTextColumnFilter',
          },
          {
            field: 'Yarn_Type',
            headerName: 'Yarn Type',
            width: 140,
            filter: 'agTextColumnFilter',
          },
          {
            field: 'ColorNameCode',
            headerName: 'Color',
            width: 200,
            filter: 'agTextColumnFilter',
          },
          {
            field: 'Composition_Name',
            headerName: 'Composition Name',
            width: 400,
            filter: 'agTextColumnFilter',
          },
          {
            field: 'formattedProductPrice',
            headerName: 'Product Price',
            width: 100,
            headerClass: 'ag-right-aligned-header',
            cellStyle: { textAlign: 'right' },
            filter: 'agNumberColumnFilter',
            type: 'numericColumn',
          },
          {
            field: 'formattedPriceRangeFrm',
            headerName: 'Price Range From',
            width: 100,
            headerClass: 'ag-right-aligned-header',
            cellStyle: { textAlign: 'right' },

            filter: 'agNumberColumnFilter',
            type: 'numericColumn',
          },
          {
            field: 'formattedPriceRangeTo',
            headerName: 'Price Range To',
            width: 100,
            headerClass: 'ag-right-aligned-header',
            cellStyle: { textAlign: 'right' },
            filter: 'agNumberColumnFilter',
            type: 'numericColumn',
          },
          // {
          //   field: 'Currency',
          //   headerName: 'Currency',
          //   width: 80,
          // },
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
        params.successCallback(params.data.ProductPLVolume);
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
            label="Search by Pricelist Name"
            variant="outlined"
            size="small"
            value={searchParams.PriceListName}
            onChange={handleSearchChange('PriceListName')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} />
                </InputAdornment>
              ),
            }}
          />
          {/* <TextField
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
          /> */}
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
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowHeight={35}
            headerHeight={40}
            masterDetail
            detailCellRendererParams={detailCellRendererParams}
            animateRows
            pagination
            paginationPageSize={50}
            domLayout="autoHeight"
            suppressRowClickSelection
            onFirstDataRendered={onFirstDataRendered}
          />
        </Scrollbar>
      </div>
    </div>
  );
};

export default PricelistGrid;
