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

import ImportInvoiceEntryTableRow from '../ImportInvoiceEntry-table-row';
import ImportInvoiceEntryTableToolbar from '../ImportInvoiceEntry-toolbar';
import ImportInvoiceEntryTableFiltersResult from '../ImportInvoiceEntry-filters-result';
import axios from 'axios';

const TABLE_HEAD = [
  { id: 'ImportInvoiceEntryNo', label: 'Import Invoice Entry No.', minWidth: 145 },
  { id: 'CustomerName', label: 'Customer', minWidth: 140 },
  { id: 'ValidFrom', label: 'Valid From', minWidth: 140 },
  { id: 'ValidUntil', label: 'Valid Until', minWidth: 140 },
  { id: '', width: 88, align: 'center' },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function ImportInvoiceEntryListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const FetchImportInvoiceEntryData = useCallback(async () => {
    try {
      const response = await Get(
        `GetImportInvoiceEntryActiveinActiveList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      const res = await Get(
        `getDocumentApproverByID?&ApproverID=${userData?.userDetails?.userId}&DocID=1`
      );

      let data = res.data || [];
      if (!res.data?.Data) {
        data = [];
      }
      // Add a column 'ToBeApproved' = 'Yes' if Sample_Code exists in data, otherwise 'No'
      // const updatedDataWithToBeApproved = updatedData.map((item) => {
      //   const isMatching = data.some((resItem) => resItem.Doc_App_Dtl_ID === item.Sample_Code);
      //   return {
      //     ...item,
      //     ToBeApproved: isMatching ? 'Yes' : 'No',
      //   };
      // });

      const updatedData = response.data.Data.map((item) => ({
        ...item.ImportInvoiceEntryMst,
        CreatedDate: new Date(item.QuotationMst?.CreatedDate),
        ValidFrom: new Date(item.ImportInvoiceEntryMst?.ValidFrom),
        ValidUntil: new Date(item.ImportInvoiceEntryMst?.ValidUntil),
      }));
      console.log(updatedData);

      setTableData(updatedData);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID, userData?.userDetails?.userId]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchImportInvoiceEntryData()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchImportInvoiceEntryData]);

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
    navigate(paths.dashboard.Commercial.import.ImportInvoiceEntry.edit(e));
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
            heading="Import Invoice Entry"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              { name: 'Import Invoice Entry', href: paths.dashboard.Commercial.import.ImportInvoiceEntry.root },
              { name: 'List' },
            ]}
            action={
              <Button
                component={RouterLink}
                href={paths.dashboard.Commercial.import.ImportInvoiceEntry.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                color="primary"
              >
                Import Invoice Entry
              </Button>
            }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <Card>
            <ImportInvoiceEntryTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <ImportInvoiceEntryTableFiltersResult
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
                        <ImportInvoiceEntryTableRow
                          key={row?.ImportInvoiceEntryID}
                          row={row}
                          selected={table.selected.includes(row?.ImportInvoiceEntryID)}
                          onEditRow={() => moveToEditForm(row?.ImportInvoiceEntryID)}
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
        yarn?.ImportInvoiceEntryNo.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.CustomerName.toLowerCase().indexOf(name.toLowerCase()) !== -1
      // yarn?.PaymentTerm.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
      // yarn?.ContractDate.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
      // yarn?.YarnCount.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  // if (status !== 'all') {
  //   inputData = inputData.filter((supplier) => supplier.SupplierStatus === status);
  // }

  // if (role.length) {
  //   inputData = inputData.filter((yarn) => role.includes(yarn?.DepartmentName));
  // }

  return inputData;
}
