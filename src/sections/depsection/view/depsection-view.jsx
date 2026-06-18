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

import DepsectionTableRow from '../depsection-table-row';
import DepsectionTableToolbar from '../depsection-toolbar';
import DepsectionTableFiltersResult from '../depsection-filters-result';
import { alpha, Tab, Tabs } from '@mui/material';
import Label from 'src/components/label';
import AddDialog from '../AddDialog';
import EditDialog from '../EditDialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'SectionName', label: 'Section Name', minWidth: 140 },
  { id: 'DPT_Name', label: 'Department', minWidth: 140 },
  // { id: 'Description', label: 'Description', minWidth: 240 },
  // { id: 'isActive', label: 'Status', align: 'center', minWidth: 140 },

  { id: '', label: 'Actions', width: 88, align: 'center' },
];

const defaultFilters = {
  name: '',
  depsection: [],
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

export default function DepsectionListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [currentRowData, setCurrentRowData] = useState(null);
  const [allCustomers, setAllCustomers] = useState([]);
  const [isLoading, setLoading] = useState(true);

  // -------------------------------------

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    FetchDepsection();
    setDialogOpen(false);
  };
  // -------------------------------------

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditDialogOpen = (rowData) => {
    setEditDialogOpen(true);
    setCurrentRowData(rowData);
  };

  const handleEditDialogClose = () => {
    FetchDepsection();
    setEditDialogOpen(false);
  };
  // -------------------------------------

  const FetchDepsection = useCallback(async () => {
    try {
      const response = await Get(
        `GetSections?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
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

  const FetchAllCustomers = useCallback(async () => {
    try {
      const response = await Get(
        `getAllcustomers?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      const decryptedData = response.data.Data;
      setAllCustomers(decryptedData);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchDepsection(), FetchAllCustomers()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchDepsection, FetchAllCustomers]);

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

  const uniqueCountry_Name = [...new Set(tableData.map((tb) => tb.DPT_Name))];

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
    if (allCustomers?.flatMap((customer) => customer?.Section_ID).includes(row.Section_ID)) {
      enqueueSnackbar('This depsection is in use', { variant: 'error' });
      return;
    }
    try {
      await Delete(`DeleteRMDepsection/${row.Section_ID}`);
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      FetchDepsection();
    } catch (error) {
      console.error('Error deleting detail:', error);
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
            heading="Department Section"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              { name: 'Department Sections', href: paths.dashboard.admin.depsection.root },
              { name: 'List' },
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
                Add Section
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
            <DepsectionTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              depsectionOptions={uniqueCountry_Name}
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <DepsectionTableFiltersResult
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
                        <DepsectionTableRow
                          key={row?.Section_ID}
                          row={row}
                          selected={table.selected.includes(row?.Section_ID)}
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
  const { name, status, depsection } = filters;

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
        yarn?.SectionName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.DPT_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 
        // yarn?.Description.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((supplier) => supplier.isActive === status);
  }

  if (depsection.length) {
    inputData = inputData.filter((yarn) => depsection.includes(yarn?.DPT_Name));
  }

  return inputData;
}
