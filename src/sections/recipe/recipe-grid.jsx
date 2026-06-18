import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useSnackbar } from 'src/components/snackbar';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get } from 'src/api/apibasemethods';
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
import Label from 'src/components/label';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';
import { fDate } from 'src/utils/format-time';

const themeDark = themeBalham.withPart(colorSchemeDarkBlue);

const RecipeGrid = () => {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [zoomLevel, setZoomLevel] = useState(1);

  // State for grid data
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterTab, setFilterTab] = useState('all');

  // Fetch Recipes
  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Get(
        `Production/GetAllRecipes?Org_ID=${userData?.userDetails?.orgId || 1}&Branch_ID=${userData?.userDetails?.branchID || 6
        }`
      );

      if (response.status === 200) {


        const newdata = response.data.map((item) => {
          const [day, month, year] = item.CreationDate.split("/");
          const date = new Date(year, month - 1, day);
          return ({
            ...item,
            RevisionNoAndDate: `v${item.RevisionNo} - ${fDate(date)}`,
            CreationDate: date,
          })
        });
        setRowData(newdata);
      } else {
        setRowData([]);
        enqueueSnackbar(response.data?.Message || 'No data found', { variant: 'info' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to load recipes', { variant: 'error' });
      setRowData([]);
    } finally {
      setLoading(false);
    }
  }, [userData, enqueueSnackbar]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Get counts for each tab
  const tabCounts = useMemo(() => {
    const allCount = rowData.length;
    const standardCount = rowData.filter((item) => item.RecipeType === 'standard').length;
    const customerCount = rowData.filter((item) => item.RecipeType === 'customer').length;

    return {
      all: allCount,
      standard: standardCount,
      customer: customerCount,
    };
  }, [rowData]);

  // Filter data based on search text and recipe type tab
  const filteredData = useMemo(() => {
    let data = rowData;

    // Apply recipe type filter based on selected tab
    if (filterTab === 'standard') {
      data = data.filter((item) => item.RecipeType === 'standard');
    } else if (filterTab === 'customer') {
      data = data.filter((item) => item.RecipeType === 'customer');
    }
    // 'all' tab shows all data

    // Apply search filter
    if (!searchText) return data;

    const lowerSearch = searchText.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some(
        (val) =>
          val &&
          (typeof val === 'string' || typeof val === 'number') &&
          val.toString().toLowerCase().includes(lowerSearch)
      )
    );
  }, [rowData, searchText, filterTab]);

  // Recipe Type renderer
  const recipeTypeRenderer = (params) => {
    let bgColor;
    let label;
    switch (params.value) {
      case 'standard':
        bgColor = '#4CAF50'; // Green
        label = 'Standard';
        break;
      case 'customer':
        bgColor = '#FF9800'; // Orange
        label = 'Customer';
        break;
      default:
        bgColor = '#9E9E9E'; // Grey
        label = params.value || 'Unknown';
    }

    return (
      <div
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: `${bgColor}20`,
          color: bgColor,
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        {label}
      </div>
    );
  };

  // Image renderer for recipe pictures (supports images and PDFs)
  const imageRenderer = (params) => {
    if (!params.value) {
      return (
        <div
          style={{
            width: '30px',
            height: '30px',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            color: '#999',
            fontSize: '12px',
          }}
        >
          No Image
        </div>
      );
    }

    // Check if the URL is a PDF
    const isPdf = params.value.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      return (
        <Tooltip title="View PDF" arrow>
          {/* eslint-disable-next-line */}
          <div
            style={{
              width: '30px',
              height: '30px',
              backgroundColor: '#e3f2fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              cursor: 'pointer',
              border: '1px solid #ddd',
            }}
            onClick={() => window.open(params.value, '_blank')}
          >
            <Iconify icon="mdi:file-pdf-box" width={24} style={{ color: '#d32f2f' }} />
          </div>
        </Tooltip>
      );
    }

    return (
      <Tooltip title="View Image" arrow>
        {/* eslint-disable-next-line */}
        <img
          src={params.value}
          alt="Recipe"
          style={{
            width: '30px',
            height: '30px',
            objectFit: 'cover',
            borderRadius: '4px',
            cursor: 'pointer',
            border: '1px solid #ddd',
          }}
          onClick={() => window.open(params.value, '_blank')}
        />
      </Tooltip>
    );
  };

  // Details count renderer
  const detailsCountRenderer = (params) => {
    const count = params.data.Details?.length || 0;
    return <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{count}</div>;
  };

  // Action buttons renderer
  const actionButtonsRenderer = useCallback(
    (params) => (
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
        {/* <Tooltip title="View Details" arrow>
          <IconButton
            size="small"
            onClick={() => console.log('View recipe:', params.data.RecipeID)}
            sx={{ padding: '4px' }}
          >
            <Iconify icon="mdi:eye-outline" width={18} />
          </IconButton>
        </Tooltip> */}
        <Tooltip title="Edit Recipe" arrow>
          <IconButton
            size="small"
            onClick={() => navigate(paths.dashboard.rdLab.recipe.edit(params.data.RecipeID))}
            sx={{ padding: '4px' }}
          >
            <Iconify icon="solar:pen-bold" width={18} />
          </IconButton>
        </Tooltip>
      </div>
    ),
    [navigate]
  );

  // Master Column Definitions
  const masterColumnDefs = useMemo(
    () => [
      {
        field: 'expand',
        headerName: '',
        maxWidth: 50,
        cellRenderer: 'agGroupCellRenderer',
        cellRendererParams: {
          suppressCount: true,
        },
        sortable: false,
        filter: false,
        resizable: false,
        lockPosition: 'left',
      },
      {
        field: 'RecipePictureURL',
        headerName: 'Cyclo Recipe Card',
        minWidth: 80,
        // maxWidth: 80,
        cellRenderer: imageRenderer,
        filter: false,
      },
      {
        field: 'RecipeAutoNo',
        headerName: 'Recipe Code',
        minWidth: 180,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'RecipeName',
        headerName: 'Recipe Name',
        minWidth: 250,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'RecipeType',
        headerName: 'Type',
        minWidth: 120,
        filter: 'agSetColumnFilter',
        cellRenderer: recipeTypeRenderer,
      },
      {
        field: 'Color_and_Code',
        headerName: 'Color & Code',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Composition_Name',
        headerName: 'Composition',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Cust_Name',
        headerName: 'Customer',
        minWidth: 200,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
        hide: filterTab === 'standard',
      },
      {
        field: 'BuyerName',
        headerName: 'Buyer',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
        hide: filterTab === 'standard',
      },
      {
        field: 'RevisionNoAndDate',
        headerName: 'Recipe Version & Date',
        minWidth: 200,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'FinalGoalColorName',
        headerName: 'Final Color',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Yarn_Type',
        headerName: 'Yarn Type',
        minWidth: 120,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Yarn_Count_Name',
        headerName: 'Yarn Count',
        minWidth: 120,
        filter: 'agTextColumnFilter',
      },

      {
        field: 'ColorFamilyName',
        headerName: 'Color Family',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      // {
      //   field: 'TechUserName',
      //   headerName: 'Approved By',
      //   minWidth: 150,
      //   filter: 'agTextColumnFilter',
      //   valueFormatter: (params) => params.value || '-',
      // },
      {
        field: 'CreationDate',
        headerName: 'Created Date',
        minWidth: 120,
        filter: 'agDateColumnFilter',
        valueFormatter: (params) => fDate(params.value),
      },
      {
        field: 'CreatedByName',
        headerName: 'Created By',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      // {
      //   headerName: 'Materials',
      //   minWidth: 100,
      //   valueGetter: (params) => params.data.Details?.length || 0,
      //   cellRenderer: detailsCountRenderer,
      //   type: 'numericColumn',
      //   cellStyle: { textAlign: 'center' },
      // },
      {
        field: 'actions',
        headerName: 'Actions',
        maxWidth: 100,
        pinned: 'right',
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: actionButtonsRenderer,
        lockPosition: 'right',
        cellStyle: { textAlign: 'center' },
      },
    ],
    [actionButtonsRenderer, filterTab]
  );

  // Detail Column Definitions
  const detailColumnDefs = useMemo(
    () => [
      {
        field: 'ClassName',
        headerName: 'Item Type',
        minWidth: 120,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'CategoryName',
        headerName: 'Category',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'SubCategoryName',
        headerName: 'Sub Category',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ItemCode',
        headerName: 'Item Code',
        minWidth: 150,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'ItemDescription',
        headerName: 'Item Description',
        minWidth: 250,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'Color_and_Code',
        headerName: 'Color & Code',
        minWidth: 120,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'RmLotNo',
        headerName: 'Lot No',
        minWidth: 120,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'RequiredPercentage',
        headerName: 'Percentage',
        minWidth: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        valueFormatter: (params) => `${params.value}%`,
        cellStyle: { textAlign: 'right' },
      },
      {
        field: 'ColorPictureURL',
        headerName: 'Color Image',
        minWidth: 100,
        cellRenderer: (params) => {
          if (!params.value) return '-';
          return (
            <Tooltip title="View Color" arrow>
              {/* eslint-disable-next-line */}
              <img
                src={params.value}
                alt="Color"
                style={{
                  width: '30px',
                  height: '30px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: '1px solid #ddd',
                }}
                onClick={() => window.open(params.value, '_blank')}
              />
            </Tooltip>
          );
        },
        filter: false,
        sortable: false,
      },
      {
        field: 'Remarks',
        headerName: 'Remarks',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        valueFormatter: (params) => params.value || '-',
      },
    ],
    []
  );

  // Default column definitions
  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
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
        },
        domLayout: 'autoHeight',
      },
      getDetailRowData: (params) => {
        params.successCallback(params.data.Details);
      },
    }),
    [detailColumnDefs]
  );

  const handleTabChange = (event, newValue) => {
    setFilterTab(newValue);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ width: '100%', height: '80vh', p: 2 }}>
      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={filterTab} onChange={handleTabChange} aria-label="recipe type filter tabs">
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
          <Tab
            value="standard"
            label="Standard"
            sx={{ minWidth: 'auto' }}
            icon={
              <Label variant={filterTab === 'standard' ? 'filled' : 'soft'} color="primary">
                {tabCounts.standard}
              </Label>
            }
          />
          <Tab
            value="customer"
            label="Customer"
            sx={{ minWidth: 'auto' }}
            icon={
              <Label variant={filterTab === 'customer' ? 'filled' : 'soft'} color="warning">
                {tabCounts.customer}
              </Label>
            }
          />
        </Tabs>
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Search Recipes..."
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
            sx={{ width: { xs: '100%', sm: '300px' } }}
          />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
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
          <div style={{ width: '100%', height: '70vh' }}>
            <AgGridReact
              className="ag-theme-material"
              theme={settings.themeMode === 'dark' ? themeDark : themeBalham}
              rowData={filteredData}
              columnDefs={masterColumnDefs}
              defaultColDef={defaultColDef}
              masterDetail
              detailCellRendererParams={detailCellRendererParams}
              rowHeight={35}
              headerHeight={40}
              animateRows
              pagination
              paginationPageSize={20}
              suppressRowClickSelection
              domLayout="autoHeight"
            />
          </div>
        </Scrollbar>
      </Box>
    </Box>
  );
};

export default RecipeGrid;
