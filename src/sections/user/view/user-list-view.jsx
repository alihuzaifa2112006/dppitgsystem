import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect, useMemo } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { _roles, _userList, USER_STATUS_OPTIONS } from 'src/_mock';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
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

import UserTableRow from '../user-table-row';
import UserTableToolbar from '../user-table-toolbar';
import UserTableFiltersResult from '../user-table-filters-result';
import { Get, Put } from 'src/api/apibasemethods';
import { APP_API_STORAGE } from 'src/config-global';
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Registered', label: 'Registered' },
  { value: 'NotRegistered', label: 'Not Registered' },
];

const TABLE_HEAD = [
  { id: '', width: 20 },
  { id: 'EmployeeName', label: 'Employee Name', minWidth: 220 },
  { id: 'MobilePhoneNumber', label: 'Contact Number', width: 200 },
  { id: 'Designation', label: 'Designation', width: 220 },
  { id: 'DepartmentName', label: 'Department', width: 180 },
  { id: 'role', label: 'Role', width: 100 },
  { id: 'status', label: 'Registration', width: 100 },
  { id: 'active', label: 'Status', width: 100 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function UserListView() {
  const { enqueueSnackbar } = useSnackbar();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const FetchProfileData = useCallback(async () => {
    try {
      const response = await Get(
        `GetHrUsers?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      const updatedData = response.data.Data.map((item) => ({
        ...item,
        status: item?.isRegisterd === 'Y' ? 'Registered' : 'NotRegistered',
        active: item.IsActive === true ? 'Active' : 'Banned',
        avatarUrl: `${APP_API_STORAGE}${item?.Image}`,
        Roles: item.Roles === null ? [] : item?.Roles,
      }));
      setTableData(updatedData);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      // setLoading(true);
      await Promise.all([FetchProfileData()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchProfileData]);

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

  const uniqueRDpt = [...new Set(tableData.map((tb) => tb.DepartmentName))];

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);

      enqueueSnackbar('Delete success!');

      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, enqueueSnackbar, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    enqueueSnackbar('Delete success!');

    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const updatePrivilege = async (updatedData) => {
    try {
      const payload = {
        ...updatedData,
        UpdatedBy: userData?.userDetails?.userId,
      };

      const response = await Put('updateprivileges', payload);

      if (response.status !== 200) {
        throw new Error('Failed to update privilege');
      }

      console.log('Privilege updated:', response.data);
      FetchProfileData();
      return response.data;
    } catch (error) {
      console.error('Error updating privilege:', error);
      enqueueSnackbar('Error updating privilege', { variant: 'error' });
      throw error; // Re-throw to allow caller to handle the error if needed
    }
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
      {loading ? (
        renderLoading
      ) : (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
          <CustomBreadcrumbs
            heading="Employee"
            links={[
              {
                name: 'Dashboard',
                href: paths.dashboard.root,
              },
              {
                name: 'Employee',
                href: paths.dashboard.user.root,
              },
              { name: 'List' },
            ]}
            // action={
            //   <Button
            //     component={RouterLink}
            //     href={paths.dashboard.user.new}
            //     variant="contained"
            //     color="primary"
            //     startIcon={<Iconify icon="mingcute:add-line" />}
            //   >
            //     New Employee
            //   </Button>
            // }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <Card>
            <Tabs
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
                      color={
                        (tab.value === 'Registered' && 'success') ||
                        (tab.value === 'pending' && 'warning') ||
                        (tab.value === 'NotRegistered' && 'error') ||
                        'default'
                      }
                    >
                      {['Registered', 'NotRegistered'].includes(tab.value)
                        ? tableData.filter((user) => user.status === tab.value).length
                        : tableData.length}
                    </Label>
                  }
                />
              ))}
            </Tabs>

            <UserTableToolbar
              filters={filters}
              onFilters={handleFilters}
              //
              roleOptions={uniqueRDpt}
            />

            {canReset && (
              <UserTableFiltersResult
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
              <TableSelectedAction
                dense={table.dense}
                numSelected={table.selected.length}
                rowCount={dataFiltered.length}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    dataFiltered.map((row) => row.id)
                  )
                }
                action={
                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={confirm.onTrue}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                }
              />

              <Scrollbar>
                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={dataFiltered.length}
                    numSelected={table.selected.length}
                    onSort={table.onSort}
                    // onSelectAllRows={(checked) =>
                    //   table.onSelectAllRows(
                    //     checked,
                    //     dataFiltered.map((row) => row.id)
                    //   )
                    // }
                  />

                  <TableBody>
                    {dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <UserTableRow
                          key={row.UserId}
                          row={row}
                          selected={table.selected.includes(row.UserId)}
                          // onSelectRow={() => table.onSelectRow(row.UserId)}
                          onDeleteRow={() => handleDeleteRow(row.UserId)}
                          onEditRow={() => handleEditRow(row.UserId)}
                          updatePrivilege={updatePrivilege}
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

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
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
      (user) =>
        user.EmployeeName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        // user.EmailAddress.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        user.Designation.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        user.status.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        user.active.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        user.DepartmentName.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  if (role.length) {
    inputData = inputData.filter((user) => role.includes(user.DepartmentName));
  }

  return inputData;
}
