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
  Card,
  Divider,
} from '@mui/material';
import { Stack } from '@mui/system';
import { APP_API_STORAGE } from 'src/config-global';
import { fDate } from 'src/utils/format-time';
import PropTypes from 'prop-types';
import InvoiceAnalytic from '../QC/invoice-analytic';
import { sumBy } from 'lodash';
import Scrollbar from 'src/components/scrollbar';
import { useTheme } from '@mui/material/styles';

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

const OpportunityGrid = () => {
  const settings = useSettingsContext();
  const theme = useTheme();
  const navigate = useNavigate();
  const themeDark = themeBalham.withPart(colorSchemeDarkBlue);
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const moveToEditForm = (opportunityId) => {
    navigate(paths.dashboard.transaction.opportunity.edit(opportunityId));
  };
  const moveToApprovalForm = (opportunityId) => {
    navigate(paths.dashboard.transaction.opportunity.approval(opportunityId));
  };

  // State for grid data
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchParams, setSearchParams] = useState({
    OpportunityName: '',
    WIC_Name: '',
    Priority: '',
  });
  const containerStyle = useMemo(() => ({ width: '100%', height: '500px' }), []);

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const allProducts = rowData.flatMap((opportunity) => opportunity.OppProduct || []);

    const totalQuantity = sumBy(allProducts, 'Quantity');
    const totalAmount = sumBy(
      allProducts,
      (product) => product.Quantity * (product.Unit_Price || 0)
    );

    const approvedProducts = rowData
      .filter((opportunity) => opportunity.Level1_Approve === 'Approved')
      .flatMap((opportunity) => opportunity.OppProduct || []);
    const approvedQuantity = sumBy(approvedProducts, 'Quantity');
    const approvedAmount = sumBy(
      approvedProducts,
      (product) => product.Quantity * (product.Unit_Price || 0)
    );

    const pendingProducts = rowData
      .filter((opportunity) => opportunity.Level1_Approve === 'Pending')
      .flatMap((opportunity) => opportunity.OppProduct || []);
    const pendingQuantity = sumBy(pendingProducts, 'Quantity');
    const pendingAmount = sumBy(
      pendingProducts,
      (product) => product.Quantity * (product.Unit_Price || 0)
    );

    const rejectedProducts = rowData
      .filter((opportunity) => opportunity.Level1_Approve === 'Rejected')
      .flatMap((opportunity) => opportunity.OppProduct || []);
    const rejectedQuantity = sumBy(rejectedProducts, 'Quantity');
    const rejectedAmount = sumBy(
      rejectedProducts,
      (product) => product.Quantity * (product.Unit_Price || 0)
    );

    return {
      total: {
        count: rowData.length,
        quantity: totalQuantity,
        amount: totalAmount,
      },
      approved: {
        count: rowData.filter((item) => item.Level1_Approve === 'Approved').length,
        quantity: approvedQuantity,
        amount: approvedAmount,
      },
      pending: {
        count: rowData.filter((item) => item.Level1_Approve === 'Pending').length,
        quantity: pendingQuantity,
        amount: pendingAmount,
      },
      rejected: {
        count: rowData.filter((item) => item.Level1_Approve === 'Rejected').length,
        quantity: rejectedQuantity,
        amount: rejectedAmount,
      },
    };
  }, [rowData]);

  // Fetch opportunity data
  const fetchOpportunities = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllactiveOpportunity?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&RoleID=${70}&UserID=${userData?.userDetails?.userId}`
      );
      const res = await Get(
        `getDocumentApproverByID?&ApproverID=${userData?.userDetails?.userId}&DocID=4`
      );

      let approverData = res?.data || [];
      if (res?.data?.Data) {
        approverData = res?.data?.Data || [];
      }

      const updatedData = response.data.map((item) => ({
        ...item,
        Approver1_Image: item.Approver1_Image ? `${APP_API_STORAGE}${item.Approver1_Image}` : '',
        Approver2_Image: item.Approver2_Image ? `${APP_API_STORAGE}${item.Approver2_Image}` : '',
        CreatedDate: item?.CreatedDate ? new Date(item?.CreatedDate) : null,
        EndDate: item?.EndDate ? new Date(item?.EndDate) : null,
        OpportunityDate: item?.OpportunityDate ? new Date(item?.OpportunityDate) : null,
        Level1_Approved_On: item.Level1_Approved_On ? new Date(item.Level1_Approved_On) : null,
        Level2_Approved_On: item.Level2_Approved_On ? new Date(item.Level2_Approved_On) : null,
        Level1_Approve:
          item?.Level1_Approve === 'A'
            ? 'Approved'
            : item?.Level1_Approve === 'R'
              ? 'Rejected'
              : 'Pending',
        Level2_Approve:
          item?.Level2_Approve === 'A'
            ? 'Approved'
            : item?.Level2_Approve === 'R'
              ? 'Rejected'
              : 'Pending',
        Level3_Approve:
          item?.Level3_Approve === 'A'
            ? 'Approved'
            : item?.Level3_Approve === 'R'
              ? 'Rejected'
              : 'Pending',
      }));

      if (approverData?.length > 0) {
        const newUpdatedData = updatedData?.map((item) => {
          const toApprove =
            (approverData[0]?.Approval_Lvl_ID === 1 && !item?.Level1_Approved_ID) ||
            (approverData[0]?.Approval_Lvl_ID === 2 && !item?.Level2_Approved_ID);
          return {
            ...item,
            ToBeApproved: toApprove,
          };
        });
        setRowData(newUpdatedData);
      } else {
        setRowData(updatedData);
      }
    } catch (error) {
      console.log(error);
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Filter data based on search parameters
  const filteredData = useMemo(
    () =>
      rowData.filter(
        (opportunity) =>
          opportunity?.OpportunityName?.toLowerCase()?.includes(
            searchParams.OpportunityName.toLowerCase()
          ) &&
          opportunity?.WIC_Name?.toLowerCase()?.includes(searchParams.WIC_Name.toLowerCase()) &&
          opportunity?.Priority?.toLowerCase()?.includes(searchParams.Priority.toLowerCase())
      ),
    [rowData, searchParams]
  );

  // Action button renderers
  const editButtonRenderer = (params) => (
    <Tooltip title="Edit" arrow>
      <IconButton
        onClick={() => moveToEditForm(params.data.OpportunityID)}
        size="small"
        disabled={
          params.data?.CreatedBy !== userData?.userDetails?.userId || params.data.ToBeApproved
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
        onClick={() => moveToApprovalForm(params.data.OpportunityID)}
        size="small"
        sx={{ padding: '4px' }}
      >
        <Iconify icon="solar:eye-bold" width={18} />
      </IconButton>
    </Tooltip>
  );

  const actionButtonsRenderer = (params) => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {approvalButtonRenderer(params)}
      {editButtonRenderer(params)}
    </div>
  );

  const StatusRenderer = (params) => {
    // eslint-disable-next-line
    const status = params.value;
    let textColor;

    switch (status) {
      case 'Approved':
        textColor = '#63913a';
        break;
      case 'Rejected':
        textColor = '#a80000';
        break;
      case 'Pending':
        textColor = '#cd8f4d';
        break;
      default:
        textColor = '#595959';
    }

    return (
      <div
        style={{
          display: 'inline-block',
          padding: '0px 5px',
          color: textColor,
          textAlign: 'center',
        }}
      >
        {status}
      </div>
    );
  };

  const PriorityRenderer = (params) => {
    // eslint-disable-next-line
    const priority = params.value;
    let backgroundColor;
    let textColor;

    switch (priority) {
      case 'High':
        backgroundColor = '#ffebee';
        textColor = '#d32f2f';
        break;
      case 'Medium':
        backgroundColor = '#fff8e1';
        textColor = '#ff8f00';
        break;
      case 'Low':
        backgroundColor = '#e8f5e9';
        textColor = '#2e7d32';
        break;
      default:
        backgroundColor = '#f5f5f5';
        textColor = '#616161';
    }

    return (
      <div
        style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: '12px',
          backgroundColor,
          color: textColor,
          fontWeight: '500',
        }}
      >
        {priority}
      </div>
    );
  };

  // Detail cell renderer component for products
  const DetailCellRenderer = ({ data }) => {
    // Column definitions for the products grid
    const productColumnDefs = [
      { field: 'Requirement', headerName: 'Requirement', minWidth: 300 },
      { field: 'Yarn_Count_Name', headerName: 'Yarn Count', minWidth: 100 },
      { field: 'Yarn_Type', headerName: 'Yarn Type', minWidth: 150 },
      { field: 'Composition_Name', headerName: 'Composition', minWidth: 250 },
      { field: 'ColorName', headerName: 'Color', minWidth: 120 },
      {
        field: 'Quantity',
        headerName: 'Quantity',
        minWidth: 100,
        valueFormatter: (params) => params.value?.toLocaleString() || '0',
      },
      {
        field: 'Unit_Price',
        headerName: 'Unit Price',
        minWidth: 100,
        valueFormatter: (params) =>
          params.value?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || '0.00',
      },
      {
        field: 'EstimatedDeliveryDate',
        headerName: 'Est. Delivery',
        minWidth: 120,
        valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
      },
    ];

    return (
      <div className="ag-theme-material" style={{ height: '100%', width: '100%', padding: '15px' }}>
        <AgGridReact
          rowData={data.OppProduct}
          columnDefs={productColumnDefs}
          defaultColDef={{
            flex: 1,
            sortable: true,
            resizable: true,
          }}
          domLayout="autoHeight"
        />
      </div>
    );
  };

  DetailCellRenderer.propTypes = {
    data: PropTypes.object,
  };

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
      field: 'OpportunityName',
      headerName: 'Opportunity Name',
      minWidth: 180,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'WIC_Name',
      headerName: 'Customer',
      minWidth: 180,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'Priority',
      headerName: 'Priority',
      minWidth: 120,
      filter: 'agSetColumnFilter',
      cellRenderer: PriorityRenderer,
    },
    {
      field: 'OpportunityDate',
      headerName: 'Start Date',
      minWidth: 120,
      valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
    },
    {
      field: 'EndDate',
      headerName: 'End Date',
      minWidth: 120,
      valueFormatter: (params) => (params.value ? fDate(new Date(params.value)) : ''),
    },
    {
      field: 'KAM_Name',
      headerName: 'KAM',
      minWidth: 150,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'Level1_Approve',
      headerName: '1st Approval',
      minWidth: 120,
      filter: 'agSetColumnFilter',
      cellRenderer: StatusRenderer,
    },
    {
      field: 'Approver1_Name',
      headerName: '1st Approver',
      minWidth: 150,
      cellRenderer: ImageNameRender(1),
    },
    {
      field: 'Level1_Approved_Remarks',
      headerName: '1st Remarks',
      minWidth: 150,
    },
    {
      field: 'Level2_Approve',
      headerName: '2nd Approval',
      minWidth: 120,
      filter: 'agSetColumnFilter',
      cellRenderer: StatusRenderer,
    },
    {
      field: 'Approver2_Name',
      headerName: '2nd Approver',
      minWidth: 150,
      cellRenderer: ImageNameRender(2),
    },
    {
      field: 'Level2_Approved_Remarks',
      headerName: '2nd Remarks',
      minWidth: 150,
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
    },
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
      <Card
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        <Scrollbar>
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
            sx={{ py: 2 }}
          >
            <InvoiceAnalytic
              title="Total Opportunities"
              total={analyticsData.total.count}
              percent={100}
              price={analyticsData.total.amount}
              icon="solar:box-bold-duotone"
              color={theme.palette.info.main}
            />

            <InvoiceAnalytic
              title="Approved"
              total={analyticsData.approved.count}
              percent={rowData.length ? (analyticsData.approved.count / rowData.length) * 100 : 0}
              price={analyticsData.approved.amount}
              icon="solar:file-check-bold-duotone"
              color={theme.palette.success.main}
            />

            <InvoiceAnalytic
              title="Pending"
              total={analyticsData.pending.count}
              percent={rowData.length ? (analyticsData.pending.count / rowData.length) * 100 : 0}
              price={analyticsData.pending.amount}
              icon="solar:clock-circle-bold-duotone"
              color={theme.palette.warning.main}
            />

            <InvoiceAnalytic
              title="Rejected"
              total={analyticsData.rejected.count}
              percent={rowData.length ? (analyticsData.rejected.count / rowData.length) * 100 : 0}
              price={analyticsData.rejected.amount}
              icon="solar:file-bold-duotone"
              color={theme.palette.error.main}
            />
          </Stack>
        </Scrollbar>
      </Card>

      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Search Opportunity"
            variant="outlined"
            size="small"
            value={searchParams.OpportunityName}
            onChange={handleSearchChange('OpportunityName')}
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
            value={searchParams.WIC_Name}
            onChange={handleSearchChange('WIC_Name')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" width={20} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Search Priority"
            variant="outlined"
            size="small"
            value={searchParams.Priority}
            onChange={handleSearchChange('Priority')}
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
      <Scrollbar>
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
            animateRows
            pagination
            paginationPageSize={50}
            domLayout="autoHeight"
            suppressRowClickSelection
            onFirstDataRendered={onFirstDataRendered}
            masterDetail
            detailCellRenderer={DetailCellRenderer}
            detailRowHeight={300}
          />
        </div>
      </Scrollbar>
    </div>
  );
};

export default OpportunityGrid;
