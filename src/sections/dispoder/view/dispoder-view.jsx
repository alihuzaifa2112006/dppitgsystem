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

import DispoderTableRow from '../dispoder-table-row';
import DispoderTableToolbar from '../dispoder-toolbar';
import DispoderTableFiltersResult from '../dispoder-filters-result';
import axios from 'axios';
import { alpha, Tab, Tabs } from '@mui/material';
import Label from 'src/components/label';
import { APP_API_STORAGE } from 'src/config-global';

// ----------------------------------------------------------------------

const getColors = (priority) => {
  switch (priority) {
    case 'High':
      return 'error';
    case 'HIGH':
      return 'error';
    case 'Medium':
      return 'info';
    case 'Low':
      return 'success';
    default:
      return 'default';
  }
};

const TABLE_HEAD = [
 
  { id: 'DONumber', label: 'Dispatch No', minWidth: 180 },
  { id: 'DODate', label: 'Dispatch Date', minWidth: 180 },
  { id: 'PINo', label: 'PI Number', minWidth: 180 },
  { id: 'ColorName', label: 'Color', minWidth: 140 },
  { id: 'DOQuantity', label: 'Dispatch Order Qty', minWidth: 140 },
  { id: 'LotNo', label: 'Lot Number', minWidth: 140 },
  { id: 'LotLabel', label: 'Lot Label', minWidth: 140 },
  // { id: 'Action', label: 'Action', width: 88, align: "center" },


  
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

const STATUS_OPTIONS = [
  // { value: 'all', label: 'All' },
  // { value: 'Low', label: 'Low' },
  // { value: 'Medium', label: 'Medium' },
  // { value: 'High', label: 'High' },
];

// ----------------------------------------------------------------------

export default function DispoderListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [isLoading, setLoading] = useState(true);

 
const FetchDispoderData = useCallback(async () => {
  try {
    const response = await Get(
      `GetDispatchOrderList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
    );

    const updatedData = response.data.Data?.map((item) => (
      {
        ...item,
        DODate: new Date(item.DODate)
      }
    ));

    setTableData(updatedData);
  } catch (error) {
    console.log(error);
  }
}, [
  userData?.userDetails?.orgId,
  userData?.userDetails?.branchID,
]);

  console.log('tableData', tableData);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchDispoderData()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchDispoderData]);

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

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        status: newValue,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Edit Functions
  const moveToEditForm = (e) => {
    navigate(paths.dashboard.customerClaim.dispoder.edit(e));
  };
  // Approval Functions
  const moveToApprovalForm = (e) => {
    navigate(paths.dashboard.customerClaim.dispoder.approval(e));
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
            heading="Dispatch Order"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              { name: 'Dispatch Order', href: paths.dashboard.customerClaim.dispoder.root },
              { name: 'List' },
            ]}
            action={
              <Button
                component={RouterLink}
                href={paths.dashboard.customerClaim.dispoder.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                color="primary"
              >
                Add Dispatch Order
              </Button>
            }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <Card>
      
            <DispoderTableToolbar
              filters={filters}
              onFilters={handleFilters}
           
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <DispoderTableFiltersResult
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
                      .map((row, id) => (
                        <DispoderTableRow
                          key={id}
                          row={row}
                          selected={table.selected.includes(row?.DOID)}
                          onEditRow={() => moveToEditForm(row?.DOID)}
                          onApprovalRow={() => moveToApprovalForm(row?.DOID)}
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
        yarn?.DONumber.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.PINo.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((supplier) => supplier.Priority === status);
  }

  // if (role.length) {
  //   inputData = inputData.filter((yarn) => role.includes(yarn?.DepartmentName));
  // }

  return inputData;
}

// function applyFilter({ inputData, comparator, filters }) {
//   const { name } = filters;

//   const stabilizedThis = inputData.map((el, index) => [el, index]);
//   stabilizedThis.sort((a, b) => {
//     const order = comparator(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });
//   inputData = stabilizedThis.map((el) => el[0]);

//   if (name) {
//     const search = name.toLowerCase();
//     inputData = inputData.filter(
//       (row) =>
//         row?.DONumber?.toLowerCase().includes(search) ||
//         row?.PINo?.toLowerCase().includes(search) ||
//         row?.Color?.toLowerCase().includes(search) ||
//         row?.LotNo?.toLowerCase().includes(search) ||
//         row?.LotLabel?.toLowerCase().includes(search)
//     );
//   }

//   return inputData;
// }