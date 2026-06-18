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

import PiTableRow from '../pi-table-row';
import PiTableToolbar from '../pi-toolbar';
import PiTableFiltersResult from '../pi-filters-result';
import axios from 'axios';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'ExportInvoiceNo', label: 'Export Invoice No', minWidth: 150 },
  { id: 'ExportInvoiceDate', label: 'Export Invoice Date', minWidth: 180 },
  { id: 'CustomerName', label: 'Customer Name', minWidth: 170 },
  { id: 'ExportLCNo', label: 'Export L/C No', minWidth: 160 },
  { id: 'LCDate', label: 'LC Date', minWidth: 140 },
  { id: 'ExportLCAmount', label: 'Export L/C Amount', minWidth: 160 },
  { id: 'GoodsValue', label: 'Goods Value', minWidth: 140, align: 'right' },
  { id: 'InvoiceQty', label: 'Invoice Qty', align: 'right', minWidth: 120 },
  { id: 'Commission', label: 'Commission', align: 'right', minWidth: 150 },
  { id: 'AdjustmentAmount', label: 'Adjustment Amount', align: 'right', minWidth: 170 },
  { id: 'ExportInvoiceValue', label: 'Export Invoice Value', align: 'right', minWidth: 170 },
  { id: 'ExchangeRate', label: 'Exchange Rate', align: 'right', minWidth: 140 },
  { id: 'InvoiceValueInTK', label: 'Invoice Value In TK', align: 'right', minWidth: 160 },

  // { id: 'Quantity', label: 'Quantity' },

  { id: '', label: 'Action', width: 88, align: 'center' },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function PiListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  // const FetchPiData = useCallback(async () => {
  //   try {
  //     const response = await Get(
  //       `GetPILIST?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
  //     );
  //     const updatedData = response.data.PendingPIList.map((item) => ({
  //       ...item,
  //       CreatedDate: new Date(item?.CreatedDate),
  //       ValidFrom: new Date(item?.ValidFrom),
  //       ValidUntil: new Date(item?.ValidUntil),
  //     }));

  //     setTableData(updatedData);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const FetchEIData = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetExportInvoiceList?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      const data = response.data.Data || [];

      console.log('data', data);
      setTableData(data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchEIData()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchEIData]);

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
    navigate(paths.dashboard.Commercial.export.ExportInvoice.edit(e));
  };
  const moveToViewForm = (e) => {
    navigate(paths.dashboard.Commercial.export.ExportInvoice.pdf(e));
  };

  const moveToPDF = ({ pdfType, ExportInvoiceID }) => {
    // Example: /dashboard/commercial/exportinvoice/pdf/123?type=commercial
    navigate(
      `${paths.dashboard.Commercial.export.ExportInvoice.pdf(ExportInvoiceID)}?type=${pdfType}`
    );
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
            heading="Export Invoice "
            links={[
              { name: 'Home', href: paths.dashboard.root },
              {
                name: 'Export Invoice',
                href: paths.dashboard.Commercial.export.ExportInvoice.root,
              },
              { name: 'List' },
            ]}
            action={
              <Button
                component={RouterLink}
                href={paths.dashboard.Commercial.export.ExportInvoice.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                color="primary"
              >
                Add Export Invoice
              </Button>
            }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <Card>
            <PiTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <PiTableFiltersResult
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
                        <PiTableRow
                          key={row?.ExportInvoiceID}
                          row={row}
                          selected={table.selected.includes(row?.ExportInvoiceID)}
                          onEditRow={() => moveToEditForm(row?.ExportInvoiceID)}
                          onPDFView={moveToPDF}
                          onViewRow={() => moveToViewForm(row?.ExportInvoiceID)}
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
        yarn?.ExportInvoiceNo.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.ExportInvoiceNo.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.CustomerName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.ExportLCNo.toLowerCase().indexOf(name.toLowerCase()) !== -1
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
