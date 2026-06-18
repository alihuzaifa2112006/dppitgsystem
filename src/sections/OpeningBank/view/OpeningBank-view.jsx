import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
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

import CountryTableRow from '../country-table-row';
import CountryTableToolbar from '../countrytoolbar';
import CountryTableFiltersResult from '../country-filters-result';
import CountryDialog from '../AddDialog';
import CountryEditDialog from '../EditDialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'BankName', label: 'Bank Name', minWidth: 200 },
  { id: 'BranchName', label: 'Branch Name', minWidth: 140 },
  { id: 'Address', label: 'Address', minWidth: 250 },
  { id: '', label: 'Actions', width: 88, align: 'center' },
];

const defaultFilters = {
  name: '',
  role: [],
};
// ----------------------------------------------------------------------

export default function OpeningBankListView() {
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [currentRowData, setCurrentRowData] = useState(null);
  const [isLoading, setLoading] = useState(true);

  // -------------------------------------

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    FetchBanks();
    setDialogOpen(false);
  };
  // -------------------------------------

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditDialogOpen = (rowData) => {
    setEditDialogOpen(true);
    setCurrentRowData(rowData);
  };

  const handleEditDialogClose = () => {
    FetchBanks();
    setEditDialogOpen(false);
  };
  // -------------------------------------

  const FetchBanks = useCallback(async () => {
    try {
      const orgId = userData?.userDetails?.orgId;
      const branchID = userData?.userDetails?.branchID;
      // const response = await Get(`CommercialModule/GetBankDropdown?Org_ID=${orgId}&Branch_ID=${branchID}`);
      // CommercialModule/GetBankList?Org_ID=1&Branch_ID=6
      const response = await Get(`CommercialModule/GetBankList?Org_ID=${orgId}&Branch_ID=${branchID}`);
      setTableData(response.data?.Data || []);
    } catch (error) {
      console.log(error);
    }
  }, [userData]);

  useEffect(() => {
    const fetchData = async () => {
      await FetchBanks();
      setLoading(false);
    };
    fetchData();
  }, [FetchBanks]);

  const { enqueueSnackbar } = useSnackbar();

  const table = useTable();

  const settings = useSettingsContext();

  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const uniqueBankNames = [...new Set(tableData.map((tb) => tb.BankName))];

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


  // Edit Functions
  const moveToEditForm = (e) => {
    handleEditDialogOpen(e);
  };
  const DeleteDetailTableRow = async (row) => {
    try {
      await Delete(`DeleteDpt/${row.BankID}`);
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      FetchBanks();
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
            heading="Bank"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              { name: 'Bank', href: paths.dashboard.powertools.country },
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
                Add Bank
              </Button>
            }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <Card>
            <CountryTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              roleOptions={uniqueBankNames}
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <CountryTableFiltersResult
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
                        <CountryTableRow
                          key={row?.BankID}
                          row={row}
                          selected={table.selected.includes(row?.BankID)}
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
      <CountryDialog
        uploadClose={handleDialogClose}
        uploadOpen={dialogOpen}
        tableData={tableData}
      />
      <CountryEditDialog
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
  const { name, role } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (bank) =>
        bank?.BankName?.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        bank?.BranchName?.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        bank?.DisplayText?.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (role.length) {
    inputData = inputData.filter((bank) => role.includes(bank?.BankName));
  }

  return inputData;
}
