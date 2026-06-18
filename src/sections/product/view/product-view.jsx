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

import ProductTableRow from '../product-table-row';
import ProductTableToolbar from '../product-toolbar';
import ProductTableFiltersResult from '../product-filters-result';
import { alpha, Tab, Tabs } from '@mui/material';
import Label from 'src/components/label';
import UploadExcelDialog from '../excel-import-dialog';
import { Box } from '@mui/system';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'Yarn_Code', label: 'Yarn Code', minWidth: 140 },
  // { id: 'Commercial_Name', label: 'Product Name', minWidth: 140 },
  { id: 'Yarn_Count_Name', label: 'Yarn Count', minWidth: 140 },
  { id: 'Product_Name', label: 'Product Composition', minWidth: 240 },
  { id: 'ColorName', label: 'Color Name', minWidth: 140 },
  { id: 'Color_Code', label: 'Color Code', minWidth: 140 },
  { id: 'UOMName', label: 'UOM', align: 'center', minWidth: 140 },

  { id: '', label: 'Action', width: 88, align: 'center' },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
  // { value: 'Uploaded', label: 'Uploaded' },
  // { value: 'On Hold', label: 'On Hold' },
];

const getStatusColor = (stID) => {
  switch (stID) {
    case true:
      return 'success';
    // case 'Pending':
    //   return 'warning';
    // case 'On Hold':
    //   return 'error';
    //   case 'Uploaded':
    //     return 'info';
    default:
      return 'default';
  }
};
// ----------------------------------------------------------------------

export default function ProductListView() {
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

  const FetchProductData = useCallback(async () => {
    try {
      const response = await Get(
        `APIViewYarnComposePrdt?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      const decryptedData = response.data.Data;
      setTableData(decryptedData);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchProductData()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchProductData]);

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

  const uniqueCountry_Name = [...new Set(tableData.map((tb) => tb.ColorName))];

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
    navigate(paths.dashboard.productManagement.product.edit(e));
  };

  const handleDeleteRow = async (row) => {
    const { Product_ID } = row;
    const res = await Delete(`delProductname/${Product_ID}/${userData?.userDetails?.userId}`);
    if (res.status === 200) {
      FetchProductData();
      enqueueSnackbar('Product Deleted Successfully', { variant: 'success' });
    } else {
      enqueueSnackbar('Error Deleting Product Data', { variant: 'error' });
    }
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
            heading="Product Description"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              { name: 'Product Description', href: paths.dashboard.productManagement.product.root },
              { name: 'List' },
            ]}
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
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  color="primary"
                  onClick={() => {
                    router.push(paths.dashboard.productManagement.product.new);
                  }}
                >
                  Add Product
                </Button>
              </Box>
            }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />
          <UploadExcelDialog
            uploadOpen={uploadDialogOpen}
            uploadClose={handleUploadDialogClose}
            FetchUpdatedData={() => {
              FetchProductData();
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
                      {[true, false].includes(tab.value)
                        ? tableData.filter((td) => td.IsActive === tab.value).length
                        : tableData.length}
                    </Label>
                  }
                />
              ))}
            </Tabs> */}
            <ProductTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              roleOptions={uniqueCountry_Name}
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <ProductTableFiltersResult
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
                        <ProductTableRow
                          key={row?.Product_ID}
                          row={row}
                          selected={table.selected.includes(row?.Product_ID)}
                          onEditRow={() => moveToEditForm(row?.Product_ID)}
                          onDeleteRow={() => handleDeleteRow(row)}
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
          FetchProductData();
        }}
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
        yarn?.Yarn_Count_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        // yarn?.Commercial_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.Product_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.ColorName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.Color_Code.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.UOMName.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((supplier) => supplier.IsActive === status);
  }

  if (role.length) {
    inputData = inputData.filter((yarn) => role.includes(yarn?.ColorName));
  }

  return inputData;
}
