import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { useBoolean } from 'src/hooks/use-boolean';
import { Delete, Get } from 'src/api/apibasemethods';

import { LoadingScreen } from 'src/components/loading-screen';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { decrypt, encrypt } from 'src/api/encryption';

import InvTypeTableRow from '../ReqMiddleware-table-row';
import InvTypeTableToolbar from '../ReqMiddleware-toolbar';
import InvTypeTableFiltersResult from '../ReqMiddleware-filters-result';
import { alpha, Tab, Tabs } from '@mui/material';
import Label from 'src/components/label';
import ReqMiddlewareAddDialog from '../AddDialog';
import ReqMiddlewareEditDialog from '../EditDialog';
import { Box } from '@mui/system';
import UploadExcelDialog from '../excel-import-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'RequestedBy', label: 'User', minWidth: 140 },
  { id: 'DepartmentName', label: 'Department', minWidth: 140 },
  { id: 'SectionName', label: 'Section', minWidth: 140 },
  { id: 'ClassName', label: 'Item Type', minWidth: 140 },
  { id: 'Inv_Cat_Name', label: 'Category  ', minWidth: 140 },
  // { id: '', label: 'Actions', width: 88, align: 'center' },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  // { value: 'Uploaded', label: 'Uploaded' },
  // { value: 'On Hold', label: 'On Hold' },
];

const getStatusColor = (stID) => {
  switch (stID) {
    case 'Active':
      return 'success';
    // case 'Pending':
    //   return 'warning';
    case 'Inactive':
      return 'error';
    //   case 'Uploaded':
    //     return 'info';
    default:
      return 'default';
  }
};
// ----------------------------------------------------------------------

export default function ReqMiddleware() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [currentRowData, setCurrentRowData] = useState(null);
  const [AllRoles, setAllRoles] = useState([]);
  const [AllSections, setAllSections] = useState([]);
  const [isLoading, setLoading] = useState(true);

  // -------------------------------------

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    FetchInvType();
    setDialogOpen(false);
  };
  // -------------------------------------

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditDialogOpen = (rowData) => {
    setEditDialogOpen(true);
    setCurrentRowData(rowData);
  };

  const handleEditDialogClose = () => {
    FetchInvType();
    setEditDialogOpen(false);
  };
  // -------------------------------------

  const FetchInvType = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllReqmiddleware?branch_ID=${userData?.userDetails?.branchID}&Org_Id=${userData?.userDetails?.orgId}`
      );
      const items = response.data.map((item) => ({
        ...item,
        User: {
          UserId: item.UserID,
          EmployeeName: item.RequestedBy,
          DepartmentName: item?.DepartmentName,
          SectionName: item?.SectionName,
        },
        ClassID: {
          ClassID: item.InvTypeID,
          ClassName: item.ClassName,
        },
        Category: {
          Inv_Cat_ID: item.CategoryID,
          Inv_Cat_Name: item.Inv_Cat_Name,
        },
        Is_Active: item?.Is_Active === true ? 'Active' : 'Inactive',
      }));

      setTableData(items);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.branchID, userData?.userDetails?.orgId]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchInvType()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchInvType]);

  const { enqueueSnackbar } = useSnackbar();

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const uniqueDepartmentName = [...new Set(tableData.map((tb) => tb.DepartmentName))];

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  // Edit Functions
  const moveToEditForm = (e) => {
    handleEditDialogOpen(e);
    // navigate(paths.dashboard.customer.wic.edit(e));
  };
  const DeleteDetailTableRow = async (row) => {
    if (AllRoles?.some((role) => role.DPT_ID === row.Dpt_ID)) {
      enqueueSnackbar('This room is being used in role database', { variant: 'error' });
      return;
    }
    if (AllSections?.some((role) => role.DPT_ID === row.Dpt_ID)) {
      enqueueSnackbar('This room is being used in section database', { variant: 'error' });
      return;
    }
    try {
      await Delete(`DeleteDpt/${row.Dpt_ID}`);
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      FetchInvType();
    } catch (error) {
      console.error('Error deleting detail:', error);
    }
  };
  // -------------------------------------

  // Upload Dialog Functions
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleUploadDialogOpen = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadDialogClose = () => {
    setUploadDialogOpen(false);
  };

  const renderLoading = (
    <LoadingScreen
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh',
      }}
    />
  );

  return (
    <>
      {isLoading ? (
        renderLoading
      ) : (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
          <CustomBreadcrumbs
            heading="Request Middleware"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              {
                name: 'Request Middleware',
                href: paths.dashboard.powertools.inventory.ReqMiddleware,
              },
              { name: 'list' },
            ]}
            action={
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:file-import-line" />}
                  color="primary"
                  onClick={handleUploadDialogOpen}
                >
                  Import Excel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  color="primary"
                  onClick={handleDialogOpen}
                >
                  Add Middleware
                </Button>
              </Box>
            }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <Card>
            {/* <Tabs
              value={filters.status}
              onChange={handleFilterStatus}
              sx={{
                px: 2.5,
                boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
              }}
            >
              {STATUS_OPTIONS.map((tab) => (
                <Tab
                  key={tab.value}
                  iconPosition="end"
                  value={tab.value}
                  label={tab.label}
                  icon={
                    <Label
                      variant={
                        ((tab.value === 'all' || tab.value === filters.status) && 'filled') ||
                        'soft'
                      }
                      color={getStatusColor(tab.value)}
                    >
                      {['Active', 'Inactive'].includes(tab.value)
                        ? tableData.filter((td) => td.isActive === tab.value).length
                        : tableData.length}
                    </Label>
                  }
                />
              ))}
            </Tabs> */}
            <InvTypeTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              roleOptions={uniqueDepartmentName}
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <InvTypeTableFiltersResult
                filters={filters}
                onFilters={handleFilters}
                //
                onResetFilters={handleResetFilters}
                //
                results={dataFiltered.length}
                sx={{ p: 2.5, pt: 0 }}
              />
            )}

            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <TableSelectedAction dense={table.dense} rowCount={dataFiltered.length} />

              <Scrollbar>
                <Table
                  ref={tableComponentRef}
                  size={table.dense ? 'small' : 'medium'}
                  sx={{ minWidth: 240 }}
                >
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={dataFiltered.length}
                    onSort={table.onSort}
                  />

                  <TableBody>
                    {dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <InvTypeTableRow
                          key={row?.MID}
                          row={row}
                          getStatusColor={getStatusColor}
                          selected={table.selected.includes(row?.MID)}
                          onEditRow={() => moveToEditForm(row)}
                          onDeleteRow={() => {
                            DeleteDetailTableRow(row);
                          }}
                        />
                      ))}

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                    />

                    <TableNoData notFound={notFound} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            <TablePaginationCustom
              count={dataFiltered.length}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              //
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />
          </Card>
        </Container>
      )}
      <ReqMiddlewareAddDialog
        uploadClose={handleDialogClose}
        uploadOpen={dialogOpen}
        tableData={tableData}
      />
      <ReqMiddlewareEditDialog
        uploadClose={handleEditDialogClose}
        row={currentRowData}
        uploadOpen={editDialogOpen}
        tableData={tableData}
      />
      <UploadExcelDialog
        uploadOpen={uploadDialogOpen}
        uploadClose={handleUploadDialogClose}
        FetchUpdatedData={() => {
          FetchInvType();
        }}
        tableData={tableData}
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name, status, role } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (yarn) =>
        yarn?.RequestedBy.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.Inv_Cat_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.ClassName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.DepartmentName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.SectionName.toLowerCase().indexOf(name.toLowerCase()) !== -1
      // yarn?.Country_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
      // yarn?.City_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  // if (status !== 'all') {
  //   inputData = inputData.filter((supplier) => supplier.isActive === status);
  // }

  if (role.length) {
    inputData = inputData.filter((yarn) => role.includes(yarn?.DepartmentName));
  }

  return inputData;
}
