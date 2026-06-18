import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect, useRef } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useBoolean } from 'src/hooks/use-boolean';

import { LoadingScreen } from 'src/components/loading-screen';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
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

import PreOnboardingTableRow from '../PreOnboarding-table-row';
import PreOnboardingTableToolbar from '../PreOnboarding-table-toolbar';
import PreOnboardingTableFiltersResult from '../PreOnboarding-table-filters-result';
import PreOnboardingNewDialog from '../PreOnboarding-new-dialog';
import PreOnboardingEditDialog from '../PreOnboarding-edit-dialog';
import UploadExcelDialog from '../excel-import-dialog';
import { Get } from 'src/api/apibasemethods';
import { useRouter } from 'src/routes/hooks';
import { decrypt } from 'src/api/encryption';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'Not Active', label: 'Not Active' },
];

const TABLE_HEAD = [
  { id: 'VenderName', label: 'Supplier Name' },
  { id: 'City', label: 'City' },
  { id: 'CountryName', label: 'Country' },
  { id: 'OnboardingEmail', label: 'Email' },
  { id: '',  width: 88 },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function PreOnboardingListView() {
  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [defectGroupSet, setDefectGroupSet] = useState(new Set());
  const [isLoading, setLoading] = useState(true);

  const decryptObjectKeys = (data) => {
    const decryptedData = data.map((item) => {
      const decryptedItem = {};
      Object.keys(item).forEach((key) => {
        decryptedItem[key] = decrypt(item[key]);
      });
      return decryptedItem;
    });
    return decryptedData;
  };

  const GetPreOnboardingData = async () => {
    try {
      const response = await Get('GetPreOnboardListData');
      const decryptedData = decryptObjectKeys(response.data.ServiceRes);
      setTableData(decryptedData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([GetPreOnboardingData()]);
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const uniqueDefectGroupSet = new Set(tableData.map((obj) => obj.CountryName));
    setDefectGroupSet(uniqueDefectGroupSet);
  }, [tableData]);
  // Convert the Set back to an array for rendering, if needed
  const uniqueDefectGroupSetArray = [...defectGroupSet];

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

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editModel, setEditModel] = useState({});

  const handleEditDialogOpen = () => {
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  // Edit Functions
  const handleEdit = (x) => {
    handleEditDialogOpen();
    setEditModel(x);
  };

  // Delete Functions
  const handleDelete = async (selectedRowId) => {
    try {
      // await Delete(`mapi/DeletePreOnboarding?DefectID=${selectedRowId}`).then((res) => {
      //   GetPreOnboardingData();
      //   enqueueSnackbar('Deleted Successfully!');
      // });
    } catch (error) {
      console.log(error);
    }
  };

  // Dialog 1 functions
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  // Upload Dialog Functions
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleUploadDialogOpen = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadDialogClose = () => {
    setUploadDialogOpen(false);
  };

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
            heading="Walk-In Customer"
            links={[
              { name: 'Dashboard', href: paths.dashboard.root },
              { name: 'Onboarding', href: paths.dashboard.customer.root },
              { name: 'Pre-Onboard', href: paths.dashboard.customer.root },
              { name: 'List' },
            ]}
            action={
              <div className="flex-buttons">
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:file-import-line" />}
                  color="primary"
                  onClick={handleUploadDialogOpen}
                  sx={{
                    mr: 3,
                    mb: 1,
                  }}
                >
                  Import Excel
                </Button>

                <Button
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  color="primary"
                  onClick={() => {
                    router.push(paths.dashboard.customer.new);
                  }}
                  sx={{
                    mb: 1,
                  }}
                >
                  Add Walk-In Customer
                </Button>
              </div>
            }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />
          <UploadExcelDialog
            uploadOpen={uploadDialogOpen}
            uploadClose={handleUploadDialogClose}
            FetchUpdatedData={() => {
              GetPreOnboardingData();
            }}
          />
          <PreOnboardingNewDialog
            open={dialogOpen}
            onClose={handleDialogClose}
            FetchUpdatedData={() => {
              GetPreOnboardingData();
            }}
          />
          <Card>
            <PreOnboardingTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              roleOptions={uniqueDefectGroupSetArray}
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <PreOnboardingTableFiltersResult
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
              <TableSelectedAction
                dense={table.dense}
                // numSelected={table.selected.length}
                rowCount={dataFiltered.length}
                // onSelectAllRows={(checked) =>
                //   table.onSelectAllRows(
                //     checked,
                //     dataFiltered.map((row) => row.DefectID)
                //   )
                // }
                // action={
                //   <Tooltip title="Delete">
                //     <IconButton color="primary" onClick={confirm.onTrue}>
                //       <Iconify icon="solar:trash-bin-trash-bold" />
                //     </IconButton>
                //   </Tooltip>
                // }
              />

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
                    // numSelected={table.selected.length}
                    onSort={table.onSort}
                    // onSelectAllRows={(checked) =>
                    //   table.onSelectAllRows(
                    //     checked,
                    //     dataFiltered.map((row) => row.DefectID)
                    //   )
                    // }
                  />

                  <TableBody>
                    {dataFiltered
                      .slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      .map((row) => (
                        <PreOnboardingTableRow
                          key={row.DefectID}
                          row={row}
                          // selected={table.selected.includes(row.DefectID)}
                          // onSelectRow={() => table.onSelectRow(row.DefectID)}
                          onEditRow={() => handleEdit(row)}
                          onDeleteRow={() => handleDelete(row.DefectID)}
                        />
                      ))}

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                    />

                    <TableNoData notFound={notFound} />
                  </TableBody>
                  {editDialogOpen && (
                    <PreOnboardingEditDialog
                      editOpen={editDialogOpen}
                      onEditClose={handleEditDialogClose}
                      currentData={editModel}
                      FetchUpdatedData={() => {
                        GetPreOnboardingData();
                      }}
                    />
                  )}
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

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
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
      (PreOnboarding) =>
        PreOnboarding.VenderName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        PreOnboarding.City.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((supplier) => supplier.SupplierStatus === status);
  }

  if (role.length) {
    inputData = inputData.filter((PreOnboarding) => role.includes(PreOnboarding.CountryName));
  }

  return inputData;
}
