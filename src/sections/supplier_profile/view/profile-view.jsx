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
import { Get } from 'src/api/apibasemethods';

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

import ProfileTableRow from '../profile-table-row';
import ProfileTableToolbar from '../profile-toolbar';
import ProfileTableFiltersResult from '../profile-filters-result';
import { alpha, Tab, Tabs } from '@mui/material';
import Label from 'src/components/label';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'Supplier_Name', label: 'Name', minWidth: 140 },
  { id: 'Short_Name', label: 'Short Name', minWidth: 140 },
  { id: 'Phone', label: 'Phone', minWidth: 140 },
  { id: 'Email', label: 'Email', minWidth: 140 },
  { id: 'Address', label: 'Address', minWidth: 140 },
  { id: 'Is_Active', label: 'Status', align: 'center', minWidth: 140 },
  // { id: 'UnitName', label: 'Unit Name', align: 'center', minWidth: 140 },
  // { id: 'CurrencyName', label: 'CurrencyName' },
  // { id: 'Quantity', label: 'Quantity' },

  { id: '', label: 'View', width: 88, align: 'center' },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
  // { value: 'Uploaded', label: 'Uploaded' },
  // { value: 'On Hold', label: 'On Hold' },
];

const getStatusColor = (stID) => {
  switch (stID) {
    case true:
      return 'success';
    case false:
      return 'default';
    // case 'On Hold':
    //   return 'error';
    //   case 'Uploaded':
    //     return 'info';
    default:
      return 'default';
  }
};
// ----------------------------------------------------------------------

export default function ProfileListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const decryptObjectKeys = (data, keysToExclude = []) => {
    const decryptedData = data.map((item) => {
      const decryptedItem = {};
      Object.keys(item).forEach((key) => {
        if (!keysToExclude.includes(key)) {
          decryptedItem[key] = decrypt(item[key]);
        } else {
          decryptedItem[key] = item[key];
        }
      });
      return decryptedItem;
    });
    return decryptedData;
  };

const FetchProfileData = useCallback(async () => {
  try {
    const response = await Get(
      `GetAllRMSuppliers?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
    );

    const updatedData = response.data.map((item) => {
      const master = item.Master || {};
      const bankDetails = item.BankDetails || [];
      const inventoryTypes = item.InventoryTypes || [];

      return {
        ...master,
        CreatedDate: new Date(master.CreatedDate),
        UpdatedDate: new Date(master.UpdatedDate),
        BankDetails: bankDetails,
        InventoryTypes: inventoryTypes,
      };
    });

    // Optional filter if you want only "mature" entries (you must clarify how "isMature" is determined)
    // const filteredData = updatedData.filter((item) => item.isMature === 'Y');

    setTableData(updatedData); // or setTableData(filteredData) if filtered
  } catch (error) {
    console.log('Error fetching supplier profiles:', error);
  }
}, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);
console.log(tableData,'table')

  useEffect(() => {
    const fetchData = async () => {
      // setLoading(true);
      await Promise.all([FetchProfileData()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchProfileData]);

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

  const uniqueRegions = [...new Set(tableData.map((tb) => tb.Country_Name))];

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
    navigate(paths.dashboard.admin.SupplierProfile.edit(e));
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
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Supplier"
          links={[
            { name: 'Home', href: paths.dashboard.root },
            { name: 'Supplier', href: paths.dashboard.admin.SupplierProfile.root },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.admin.SupplierProfile.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              color="primary"
            >
              Add Supplier
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        {isLoading ? (
          renderLoading
        ) : (
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
                      {[true, false].includes(tab.value)
                        ? tableData.filter((td) => td.Is_Active === tab.value).length
                        : tableData.length}
                    </Label>
                  }
                />
              ))}
            </Tabs> */}
            <ProfileTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              roleOptions={uniqueRegions}
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <ProfileTableFiltersResult
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
                  sx={{ minWidth: 960 }}
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
                        <ProfileTableRow
                          getStatusColor={getStatusColor}
                          key={row?.Cust_ID}
                          row={row}
                          selected={table.selected.includes(row?.Supplier_ID)}
                          onEditRow={() => moveToEditForm(row?.Supplier_ID)}
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
        )}
      </Container>
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
         yarn?.Supplier_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1||
         yarn?.Short_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1||
         yarn?.Phone.toLowerCase().indexOf(name.toLowerCase()) !== -1||
         yarn?.Email.toLowerCase().indexOf(name.toLowerCase()) !== -1
     
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((supplier) => supplier.Is_Active === status);
  }

  if (role.length) {
    inputData = inputData.filter((yarn) => role.includes(yarn?.Country_Name));
  }

  return inputData;
}
