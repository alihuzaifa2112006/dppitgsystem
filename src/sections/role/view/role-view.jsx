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

import RoleTableRow from '../role-table-row';
import RoleTableToolbar from '../role-toolbar';
import RoleTableFiltersResult from '../role-filters-result';
import { alpha, Tab, Tabs } from '@mui/material';
import Label from 'src/components/label';
import AddDialog from '../AddDialog';
import EditDialog from '../EditDialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'Name', label: 'Role Name', minWidth: 140 },
  { id: 'Dpt_Name', label: 'Department', minWidth: 140 },
  { id: 'Description', label: 'Description', minWidth: 240 },
  // { id: 'isActive', label: 'Status', align: 'center', minWidth: 140 },

  { id: '', label: 'Actions', width: 88, align: 'center' },
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
    // case 'Inactive':
    //   return 'error';
    //   case 'Uploaded':
    //     return 'info';
    default:
      return 'default';
  }
};
// ----------------------------------------------------------------------

export default function RoleListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [currentRowData, setCurrentRowData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setLoading] = useState(true);

  // -------------------------------------

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    FetchRole();
    setDialogOpen(false);
  };
  // -------------------------------------

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditDialogOpen = (rowData) => {
    setEditDialogOpen(true);
    setCurrentRowData(rowData);
  };

  const handleEditDialogClose = () => {
    FetchRole();
    setEditDialogOpen(false);
  };
  // -------------------------------------

  const FetchRole = useCallback(async () => {
    try {
      const response = await Get(
        `getActiveRoles?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      const decryptedData = response.data.Data.map((item) => ({
        ...item,
        isActive: item?.isActive === true ? 'Active' : 'Inactive',
      }));

      setTableData(decryptedData);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const FetchAllUsers = useCallback(async () => {
    try {
      const response = await Get(
        `GetHrUsers?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      const decryptedData = response.data.Data.map((item) => ({
        ...item,
        RoleID: item?.Roles ? item?.Roles[0]?.RoleId : 0,
      }));
      setAllUsers(decryptedData);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const FetchFormRole = useCallback(async () => {
    try {
      const response = await Get(
        `GetFormRoles?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      const decryptedData = response.data.Data.map((item) => ({
        ...item,
        isActive: item?.isActive === true ? 'Active' : 'Inactive',
      }));

      setRoles(decryptedData);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchRole(), FetchAllUsers(), FetchFormRole()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchRole, FetchAllUsers, FetchFormRole]);

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

  const uniqueCountry_Name = [...new Set(tableData.map((tb) => tb.Dpt_Name))];

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
  const moveToEditForm = (row) => {
    const roleInUse = allUsers?.some((user) => {
      if (!user.Roles) return false;

      try {
        const rolesArray = JSON.parse(user.Roles);
        return rolesArray.some((role) => role.RoleId === row.RoleId);
      } catch (e) {
        console.error('Failed to parse roles:', e);
        return false;
      }
    });

    if (roles?.flatMap((role) => role?.RoleID).includes(row.RoleId)) {
      enqueueSnackbar('This role is in use', { variant: 'error' });
      return;
    }

    if (roleInUse) {
      enqueueSnackbar('This role is in use', { variant: 'error' });
      return;
    }
    handleEditDialogOpen(row);
    // navigate(paths.dashboard.user.wic.edit(e));
  };

  const DeleteDetailTableRow = async (row) => {
    console.log('DeleteDetailTableRow called with row:', row);
    try {
      // Check if role is in use by any user
      const roleInUse = allUsers?.some((user) => {
        // Check if user has the role directly in their RoleID property
        if (user.RoleID === row.RoleId) {
          console.log('Checking user:', user);
          return true;
        }

        // // Check if user has the role in their Roles array
        // if (Array.isArray(user.Roles)) {
        //   return user.Roles.some((role) => role.RoleId === row.RoleId);
        // }

        return false;
      });

      // Check if role exists in the roles list (your existing check)
      const roleExists = roles?.some((role) => role.RoleID === row.RoleId);
      
      if (roleInUse || roleExists) {
        console.log('Role is in use:', roleInUse);
        console.log('Role exists in roles list:', roleExists);
        enqueueSnackbar('This role is in use and cannot be deleted', {
          variant: 'error',
          autoHideDuration: 3000,
        });
        return;
      }

      // Proceed with deletion if role is not in use
      await Delete(`DeleteRMRole/${row.RoleId}`);
      enqueueSnackbar('Role deleted successfully', {
        variant: 'success',
        autoHideDuration: 2000,
      });
      FetchRole();
    } catch (error) {
      console.error('Error deleting role:', error);
      enqueueSnackbar('Failed to delete role', {
        variant: 'error',
        autoHideDuration: 3000,
      });
    }
  };
  // -------------------------------------

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
            heading="Role"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              { name: 'Role', href: paths.dashboard.admin.role.root },
              { name: 'list' },
            ]}
            action={
              <Button
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                color="primary"
                onClick={handleDialogOpen}
                sx={{
                  mb: 1,
                }}
              >
                Add Role
              </Button>
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
            <RoleTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              roleOptions={uniqueCountry_Name}
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <RoleTableFiltersResult
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
                  sx={{ minWidth: 560 }}
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
                        <RoleTableRow
                          key={row?.RoleId}
                          row={row}
                          selected={table.selected.includes(row?.RoleId)}
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
      <AddDialog uploadClose={handleDialogClose} uploadOpen={dialogOpen} tableData={tableData} />
      <EditDialog
        uploadClose={handleEditDialogClose}
        row={currentRowData}
        uploadOpen={editDialogOpen}
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
        yarn?.Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        // yarn?.Dpt_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.Description.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((supplier) => supplier.isActive === status);
  }

  if (role.length) {
    inputData = inputData.filter((yarn) => role.includes(yarn?.Dpt_Name));
  }

  return inputData;
}
