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
import { Delete, Get, Put } from 'src/api/apibasemethods';

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

import YarnTypeTableRow from '../yarn-type-table-row';
import YarnTypeTableToolbar from '../yarn-type-toolbar';
import YarnTypeTableFiltersResult from '../yarn-type-filters-result';
import axios from 'axios';
import AddDialog from '../AddDialog';
import EditDialog from '../EditDialog';
import UploadExcelDialog from '../excel-import-dialog';
import { Box } from '@mui/system';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'Yarn_Code', label: 'Yarn Code', minWidth: 40 },
  { id: 'Yarn_Type', label: 'Yarn Type', minWidth: 140 },
  { id: 'IsActive', label: 'Status', minWidth: 140 },
  // { id: 'YarnTypeNickName', label: 'Name & Code', minWidth: 240 },
  { id: '', label: 'Actions', width: 88, align: 'center' },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function YarnTypeListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isUpdating, setUpdating] = useState(false);
  const [currentRowData, setCurrentRowData] = useState(null);

  const FetchYarnTypeData = useCallback(async () => {
    try {
      const response = await Get(
        `getAllyarntype?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      const newdata = response.data.Data.map((item) => ({
        ...item,
        YarnTypeNickName: `${item.YarnTypeName} ${item.YarnType_Code}`,
      }));
      setTableData(newdata);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const FetchProductData = useCallback(async () => {
    try {
      const response = await Get(
        `APIViewYarnComposePrdt?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      const decryptedData = response.data.Data;
      setProductData(decryptedData);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchYarnTypeData(), FetchProductData()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchYarnTypeData, FetchProductData]);

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
    navigate(paths.dashboard.productManagement.yarnType.edit(e));
  };

  const updateRow = async (row) => {
    // eslint-disable-next-line
    const newIsActive = row.IsActive === true ? false : true;

    const updatedData = tableData.map((item) => {
      if (item.Yarn_Type_ID === row.Yarn_Type_ID) {
        return {
          ...item,
          IsActive: newIsActive,
        };
      }
      return item;
    });

    setTableData(updatedData);
    setUpdating(true);

    try {
      const res = await Put(`yarntype/status/${row.Yarn_Type_ID}`, {
        IsActive: row.IsActive === true ? 0 : 1,
        UpdatedBy: userData?.UserId,
      });
    } catch (error) {
      setTableData(tableData);
      console.error('Failed to update status', error);
    } finally {
      setUpdating(false);
    }
  };

  const DeleteDetailTableRow = async (row) => {
    // check if the id exists in the productData array
    const isProductData = productData.some((item) => item.Yarn_Type_ID === row?.Yarn_Type_ID);

    if (isProductData) {
      enqueueSnackbar('Cannot delete. This yarn type is used in product.', { variant: 'error' });
      return;
    }
    try {
      await Delete(`yarntype/delete/${row?.Yarn_Type_ID}`);
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      FetchYarnTypeData();
    } catch (error) {
      console.error('Error deleting detail:', error);
    }
  };

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    FetchYarnTypeData();
    setDialogOpen(false);
  };
  // -------------------------------------

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditDialogOpen = (rowData) => {
    setEditDialogOpen(true);
    setCurrentRowData(rowData);
  };

  const handleEditDialogClose = () => {
    FetchYarnTypeData();
    setEditDialogOpen(false);
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
        borderRadius: 1.5,
        bgyarntype: 'background.default',
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
            heading="Yarn Type"
            links={[{ name: 'Home', href: paths.dashboard.root }, { name: 'Yarn Type' }]}
            sx={{
              mb: { xs: 3, md: 5 },
            }}
            action={
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:file-import-line" />}
                  color="primary"
                  onClick={handleUploadDialogOpen}
                >
                  Import Excel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="eva:plus-fill" />}
                  onClick={handleDialogOpen}
                  color="primary"
                >
                  New Yarn Type
                </Button>
              </Box>
            }
          />

          <Card>
            <YarnTypeTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <YarnTypeTableFiltersResult
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
                        <YarnTypeTableRow
                          key={row?.Yarn_Type_ID}
                          row={row}
                          isUpdating={isUpdating}
                          selected={table.selected.includes(row?.Yarn_Type_ID)}
                          onEditRow={() => updateRow(row)}
                          onDeleteRow={() => DeleteDetailTableRow(row)}
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

      <UploadExcelDialog
        uploadOpen={uploadDialogOpen}
        uploadClose={handleUploadDialogClose}
        FetchUpdatedData={() => {
          FetchYarnTypeData();
        }}
        tableData={tableData}
      />
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
        yarn?.Yarn_Code.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.Yarn_Type.toLowerCase().indexOf(name.toLowerCase()) !== -1
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
