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

import SparePartsTableRow from '../sp-table-row';
import SparePartsTableToolbar from '../sptoolbar';
import SparePartsTableFiltersResult from '../sp-filters-result';
import { alpha, Tab, Tabs } from '@mui/material';
import Label from 'src/components/label';
import SparePartsDialog from '../AddDialog';
import SparePartsEditDialog from '../EditDialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'SpareNo', label: 'Spare Parts No.', minWidth: 160 },
  { id: 'SpareName', label: 'Spare Parts Name', minWidth: 160 },
  { id: 'SpareNameAndNo', label: 'Spare Parts Name & No.', minWidth: 160 },

  { id: '', label: 'Actions', width: 88, align: 'center' },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  // { value: 'Active', label: 'Active' },
  // { value: 'Inactive', label: 'Inactive' },
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

export default function SparePartsListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [allCities, setAllCities] = useState([]);
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
    FetchSpareParts();
    setDialogOpen(false);
  };
  // -------------------------------------

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditDialogOpen = (rowData) => {
    setEditDialogOpen(true);
    setCurrentRowData(rowData);
  };

  const handleEditDialogClose = () => {
    FetchSpareParts();
    setEditDialogOpen(false);
  };
  // -------------------------------------

  const FetchSpareParts = useCallback(async () => {
    try {
      const response = await Get(
        `SparePartGetAll?Org_Id=${userData?.userDetails?.orgId}&Branch_Id=${userData?.userDetails?.branchID}`
      );
      const decryptedData = response.data.map((item) => ({
        ...item,
        IsActive: item?.IsActive === true ? 'Active' : 'Inactive',
      }));

      setTableData(decryptedData);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.branchID, userData?.userDetails?.orgId]);

  const FetchCity = useCallback(async () => {
    try {
      const response = await Get(`city/active`);
      setAllCities(response.data?.Data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchSpareParts(), FetchCity()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchSpareParts, FetchCity]);

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

  const uniqueSpareName = [...new Set(tableData.map((tb) => tb.SpareName))];

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
    if (allCities.find((city) => city.SpareParts_ID === e.SpareParts_ID)) {
      enqueueSnackbar('This Spare Parts is in use!', { variant: 'error' });
      return;
    }
    handleEditDialogOpen(e);
    // navigate(paths.dashboard.customer.wic.edit(e));
  };
  const DeleteDetailTableRow = async (row) => {
    if (allCities.some((city) => city.SpareParts_ID === row.SpareParts_ID)) {
      enqueueSnackbar('This Spare Parts is in use!', { variant: 'error' });
      return;
    }
    try {
      await Delete(`DeleteDpt/${row.Dpt_ID}`);
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      FetchSpareParts();
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
            heading="Spare Parts"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              { name: 'Spare Parts', href: paths.dashboard.powertools.inventory.spareparts },
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
                Add Spare Parts
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
                        ? tableData.filter((td) => td.IsActive === tab.value).length
                        : tableData.length}
                    </Label>
                  }
                />
              ))}
            </Tabs> */}
            <SparePartsTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              roleOptions={uniqueSpareName}
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <SparePartsTableFiltersResult
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
                        <SparePartsTableRow
                          key={row?.Dpt_ID}
                          row={row}
                          selected={table.selected.includes(row?.Dpt_ID)}
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
      <SparePartsDialog
        uploadClose={handleDialogClose}
        uploadOpen={dialogOpen}
        tableData={tableData}
      />
      <SparePartsEditDialog
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
        // yarn?.SpareName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.SpareNameAndNo.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.IsActive.toLowerCase().indexOf(name.toLowerCase()) !== -1
      // yarn?.City_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((supplier) => supplier.IsActive === status);
  }

  if (role.length) {
    inputData = inputData.filter((yarn) => role.includes(yarn?.SpareParts_Code));
  }

  return inputData;
}
