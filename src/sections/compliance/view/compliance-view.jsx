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

import ComplianceTableRow from '../compliance-table-row';
import ComplianceTableToolbar from '../compliance-toolbar';
import ComplianceTableFiltersResult from '../compliance-filters-result';
import { alpha, Tab, Tabs } from '@mui/material';
import Label from 'src/components/label';
import { APP_API_STORAGE } from 'src/config-global';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'Cust_Name', label: 'Customer Name', minWidth: 140 },
  { id: 'Country_Name', label: 'Country', minWidth: 140 },
  { id: 'Document_Type', label: 'Certificate Type', minWidth: 180 },
  { id: 'ExpiryDate', label: 'Expiry Date', minWidth: 140 },
  { id: 'Status', label: 'Status', minWidth: 140 },
  { id: 'Reminder', label: 'Email Status', align: 'center', minWidth: 140 },

  // { id: 'Quantity', label: 'Quantity' },

  { id: '', label: 'Email', width: 128, align: 'center' },
];

const defaultFilters = {
  name: '',
  role: [],
  type: [],
  status: 'all',
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Expired', label: 'Expired' },
  // { value: 'Not Uploaded', label: 'Not Uploaded' },
];

const getStatusColor = (stID) => {
  switch (stID) {
    case 'Y':
      return 'success';
    case 'N':
      return 'info';
    case 'R':
      return 'error';
    //   case 'Uploaded':
    //     return 'info';
    default:
      return 'default';
  }
};
// ----------------------------------------------------------------------

export default function ComplianceListView() {
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

  const FetchComplianceData = useCallback(async () => {
    try {
      const response = await Get(
        `getMautreCustomerCompliancesheet?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      const currentDate = new Date();

      const updatedData = response.data.Data.map((item) => {
        const issueDate = new Date(item.IssueDate);
        const expiryDate = new Date(item.ExpiryDate);
        const timeDiff = expiryDate.getTime() - currentDate.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        let status = '';
        if (daysLeft < 0) {
          status = 'Expired';
        } else if (daysLeft <= 90) {
          status = `${daysLeft} days left`;
        } else {
          status = 'Active';
        }

        return {
          ...item,
          DocFilePath: APP_API_STORAGE + item.DocFilePath,
          Status: status,
          IssueDate: issueDate,
          ExpiryDate: expiryDate,
        };
      });

      setTableData(updatedData);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      // setLoading(true);
      await Promise.all([FetchComplianceData()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchComplianceData]);

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
  const uniqueTypes = [...new Set(tableData.map((tb) => tb.Document_Type))];

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
    navigate(paths.dashboard.customer.compliance.view(e));
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
          heading="Compliance Status"
          links={[
            { name: 'Home', href: paths.dashboard.root },
            { name: 'Compliance Status', href: paths.dashboard.customer.compliance.root },
            { name: 'List' },
          ]}
          // action={
          //   <Button
          //     component={RouterLink}
          //     href={paths.dashboard.customer.compliance.new}
          //     variant="contained"
          //     startIcon={<Iconify icon="mingcute:add-line" />}
          //     color="primary"
          //   >
          //     Add Customer
          //   </Button>
          // }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        {isLoading ? (
          renderLoading
        ) : (
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
                        (tab.value === 'Active' && 'success') ||
                        (tab.value === 'Expired' && 'error') ||
                        (tab.value === 'Not Uploaded' && 'error') ||
                        (tab.value === 'Pending' && 'warning') || // Set color for Pending tab
                        'default'
                      }
                    >
                      {tab.value === 'Pending'
                        ? tableData.filter(
                            (supplier) =>
                              supplier.Status !== 'Active' &&
                              supplier.Status !== 'Expired' &&
                              supplier.Status !== 'Not Uploaded'
                          ).length // Count Pending items
                        : ['Active', 'Expired', 'Not Uploaded'].includes(tab.value)
                          ? tableData.filter((supplier) => supplier.Status === tab.value).length
                          : tableData.length}
                    </Label>
                  }
                />
              ))}
            </Tabs>
            <ComplianceTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              roleOptions={uniqueRegions}
              typeOptions={uniqueTypes}
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <ComplianceTableFiltersResult
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
                      .map((row, index) => (
                        <ComplianceTableRow
                          getStatusColor={getStatusColor}
                          key={index}
                          row={row}
                          selected={table.selected.includes(row?.Cust_ID)}
                          onEditRow={() => moveToEditForm(row?.Cust_ID)}
                          FetchData={() => FetchComplianceData()}
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
  const { name, status, role, type } = filters;

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
        yarn?.Cust_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.Country_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.Document_Type.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.Status.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.Reminder.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    if (status === 'Pending') {
      inputData = inputData.filter(
        (onboarding) =>
          onboarding.Status !== 'Active' &&
          onboarding.Status !== 'Expired' &&
          onboarding.Status !== 'Not Uploaded'
      );
    } else {
      inputData = inputData.filter((onboarding) => onboarding.Status === status);
    }
  }

  if (role.length) {
    inputData = inputData.filter((yarn) => role.includes(yarn?.Country_Name));
  }
  if (type.length) {
    inputData = inputData.filter((yarn) => type.includes(yarn?.Document_Type));
  }

  return inputData;
}
