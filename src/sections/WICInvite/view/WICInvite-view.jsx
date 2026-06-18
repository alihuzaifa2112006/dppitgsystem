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

import WICInviteTableRow from '../WICInvite-table-row';
import WICInviteTableToolbar from '../WICInvite-toolbar';
import WICInviteTableFiltersResult from '../WICInvite-filters-result';
import { alpha, Tab, Tabs } from '@mui/material';
import Label from 'src/components/label';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'WICInviteName', label: 'Name', minWidth: 140 },
  { id: 'Country_Name', label: 'Country', minWidth: 140 },
  { id: 'City_Name', label: 'City', minWidth: 140 },
  // { id: 'BusinessType_Name', label: 'Buisiness Type', minWidth: 140 },
  { id: 'Matured_Before_Date', label: 'Best Before', minWidth: 140 },
  { id: 'Email_Status', label: 'Status', align: 'center', minWidth: 140 },
  { id: 'Copy', label: 'Copy', align: 'center', minWidth: 140 },
  { id: 'Mail', label: 'Mail', align: 'center', minWidth: 140 },
  // { id: 'UnitName', label: 'Unit Name', align: 'center', minWidth: 140 },
  // { id: 'CurrencyName', label: 'CurrencyName' },
  // { id: 'Quantity', label: 'Quantity' },

  // { id: '',  width: 88, align: 'center' },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Invited', label: 'Invited' },
  { value: 'Not-Invited', label: 'Not-Invited' },
  // { value: 'Responded', label: 'Responded' },
  // { value: 'On Hold', label: 'On Hold' },
];

const getStatusColor = (stID) => {
  switch (stID) {
    case 'Invited':
      return 'info';
    case 'Not-Invited':
      return 'warning';
    // case 'On Hold':
    //   return 'error';
    case 'Responded':
      return 'success';
    default:
      return 'default';
  }
};
// ----------------------------------------------------------------------

export default function WICInviteListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const FetchWICInviteData = useCallback(async () => {
    try {
      const response = await Get(
        `getinvitedWICList?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      const formatedData = response.data.map((data) => ({
        ...data,
        Matured_Before_Date: new Date(data.Matured_Before_Date),
      }));
      setTableData(formatedData);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchWICInviteData()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchWICInviteData]);

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
    navigate(paths.dashboard.customer.inviteWIC.edit(e));
  };

  // Upload Dialog Functions
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleUploadDialogOpen = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadDialogClose = () => {
    setUploadDialogOpen(false);
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
            heading="Onboard Customer"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              { name: 'Onboard Customer ', href: paths.dashboard.customer.inviteWIC.root },
              { name: 'List' },
            ]}
            action={
              <div className="flex-buttons">
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  color="primary"
                  onClick={() => {
                    router.push(paths.dashboard.customer.inviteWIC.new);
                  }}
                  sx={{
                    mb: 1,
                  }}
                >
                  Add for Onboard
                </Button>
              </div>
            }
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
                      color={getStatusColor(tab.value)}
                    >
                      {['Not-Invited', 'Invited', 'Responded'].includes(tab.value)
                        ? tableData.filter((td) => td.Email_Status === tab.value).length
                        : tableData.length}
                    </Label>
                  }
                />
              ))}
            </Tabs>
            <WICInviteTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              roleOptions={uniqueRegions}
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <WICInviteTableFiltersResult
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
                  sx={{ minWidth: 660 }}
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
                        <WICInviteTableRow
                          key={row?.WIC_ID}
                          row={row}
                          selected={table.selected.includes(row?.WIC_ID)}
                          onEditRow={() => moveToEditForm(row?.WIC_ID)}
                          FetchWICInviteData={FetchWICInviteData}
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
        yarn?.WIC_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.Country_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.City_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 
        // yarn?.BusinessType_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1
      // yarn?.Matured_Before_Date.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((supplier) => supplier.Email_Status === status);
  }

  if (role.length) {
    inputData = inputData.filter((yarn) => role.includes(yarn?.Country_Name));
  }

  return inputData;
}
