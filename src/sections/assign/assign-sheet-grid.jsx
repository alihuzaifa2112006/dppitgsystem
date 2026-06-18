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

const AssignGrid = () => {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const themeDark = themeBalham.withPart(colorSchemeDarkBlue);
  const { enqueueSnackbar } = useSnackbar();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const moveToEditForm = (AssignId) => {
    navigate(paths.dashboard.transaction.Assign.edit(AssignId));
  };
  const moveToApprovalForm = (AssignId) => {
    navigate(paths.dashboard.transaction.Assign.approval(AssignId));
  };

  // State for grid data
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchParams, setSearchParams] = useState({
    AssignName: '',
    WIC_Name: '',
    Priority: '',
  });
  const containerStyle = useMemo(() => ({ width: '100%', height: '500px' }), []);

  // Fetch Assign data
  const fetchOpportunities = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllActiveinactiveOpportunities?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&RoleID=${70}&UserID=${userData?.userDetails?.userId}`
      );
      const res = await Get(
        `getDocumentApproverByID?&ApproverID=${userData?.userDetails?.userId}&DocID=4`
      );

      let approverData = res?.data || [];
      if (res?.data?.Data) {
        approverData = res?.data?.Data || [];
      }

      const updatedData = response.data.Data.map((item) => ({
        ...item,
        Approver1_Image: item.Approver1_Image ? `${APP_API_STORAGE}${item.Approver1_Image}` : '',
        Approver2_Image: item.Approver2_Image ? `${APP_API_STORAGE}${item.Approver2_Image}` : '',
        CreatedDate: new Date(item?.CreatedDate),
        EndDate: new Date(item?.EndDate),
        AssignDate: new Date(item?.AssignDate),
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
        (Assign) =>
          Assign?.AssignName?.toLowerCase()?.includes(
            searchParams.AssignName.toLowerCase()
          ) &&
          Assign?.WIC_Name?.toLowerCase()?.includes(searchParams.WIC_Name.toLowerCase()) &&
          Assign?.Priority?.toLowerCase()?.includes(searchParams.Priority.toLowerCase())
      ),
    [rowData, searchParams]
  );

  // Action button renderers
  const editButtonRenderer = (params) => (
    <Tooltip title="Edit" arrow>
      <IconButton
        onClick={() => moveToEditForm(params.data.AssignID)}
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
        onClick={() => moveToApprovalForm(params.data.AssignID)}
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
          // borderRadius: '8px',
          color: textColor,
          // border: `1px solid ${textColor}20`,
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

  // Updated column definitions for opportunities
  const [columnDefs] = useState([
    // {
    //   field: 'AssignID',
    //   headerName: 'ID',
    //   width: 80,
    //   filter: 'agNumberColumnFilter',
    // },
    {
      field: 'AssignName',
      headerName: 'Assign Name',
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
      field: 'AssignDate',
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
      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Search Assign"
            variant="outlined"
            size="small"
            value={searchParams.AssignName}
            onChange={handleSearchChange('AssignName')}
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
          rowData={filteredData} // Changed from rowData to filteredData
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
        />
      </div>
    </div>
  );
};

export default AssignGrid;
