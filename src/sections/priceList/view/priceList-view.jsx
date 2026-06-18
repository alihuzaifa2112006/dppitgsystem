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

import PriceListTableRow from '../priceList-table-row';
import PriceListTableToolbar from '../priceList-toolbar';
import PriceListTableFiltersResult from '../priceList-filters-result';
import axios from 'axios';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'PriceListName', label: 'Name', minWidth: 240 },
  { id: 'PriceListVer', label: 'Version', minWidth: 140 },
  {
    id: 'PriceListDescription',
    label: 'Description',
    minWidth: 240,
  },
  { id: 'Valid_From', label: 'Validity from', minWidth: 160, align: 'center' },
  { id: 'Valid_Until', label: 'Validity till', minWidth: 140, align: 'center' },
  { id: 'IsActive', label: 'Status', minWidth: 140, align: 'center' },
  { id: '',  width: 88, align: 'center' },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

const formatPriceListData = (data) => {
  const grouped = {};

  // Group by PriceListName
  data.forEach((item) => {
    if (!grouped[item.PriceListName]) {
      grouped[item.PriceListName] = [];
    }
    grouped[item.PriceListName].push({
      ...item,
      Valid_From: new Date(item.Valid_From),
      Valid_Until: new Date(item.Valid_Until),
    });
  });

  const formatted = [];

  Object.values(grouped).forEach((group) => {
    const active = group.find((item) => item.IsActive);
    if (active) {
      const children = group
        .filter((item) => !item.IsActive)
        .sort((a, b) => new Date(b.UpdatedDate) - new Date(a.UpdatedDate)); // latest first

      formatted.push({
        ...active,
        children,
      });
    }
  });

  return formatted;
};

// ----------------------------------------------------------------------

export default function PriceListListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const FetchPriceListData = useCallback(async () => {
    try {
      const response = await Get(
        `getActiveInactivepriceList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      const formattedData = formatPriceListData(response.data.Data);
      setTableData(formattedData);
      console.log(formattedData);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchPriceListData()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchPriceListData]);

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
    navigate(paths.dashboard.transaction.priceList.edit(e));
  };
  const moveToNewVersionForm = (e) => {
    navigate(paths.dashboard.transaction.priceList.newVersion(e));
  };

  const DeleteDetailTableRow = async (id) => {
    // const updatedDetails = yarnContractDetails.filter((row) => row !== rowToDelete);
    // setYarnContractDetails(updatedDetails);
    try {
      await Delete(`DeletePriceList?YarnDatabaseID=${id}`);
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      FetchPriceListData();
    } catch (error) {
      console.error('Error deleting detail:', error);
    }
  };

  // -------------------------------------

  const renderLoading = (
    <LoadingScreen
      sx={{
        borderRadius: 1.5,
        bgpricelist: 'background.default',
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
            heading="Pricelist"
            links={[{ name: 'Home', href: paths.dashboard.root }, { name: 'Pricelist' }]}
            action={
              <Button
                component={RouterLink}
                href={paths.dashboard.transaction.priceList.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                color="primary"
              >
                Add PriceList
              </Button>
            }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <Card>
            <PriceListTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <PriceListTableFiltersResult
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
                        <PriceListTableRow
                          key={row?.PriceListID}
                          row={row}
                          selected={table.selected.includes(row?.PriceListID)}
                          onEditRow={()=> moveToEditForm(row?.PriceListID)}
                          onNewVersion={() => moveToNewVersionForm(row?.PriceListID)}
                          onDeleteRow={() => DeleteDetailTableRow(row?.PriceListID)}
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
        yarn?.PriceListName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.PriceListDescription.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.PriceListVer.toLowerCase().indexOf(name.toLowerCase()) !== -1
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
