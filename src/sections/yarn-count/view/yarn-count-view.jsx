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
import { Delete, Get, Post, Put } from 'src/api/apibasemethods';

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

import YarnCountTableRow from '../yarn-count-table-row';
import YarnCountTableToolbar from '../yarn-count-toolbar';
import YarnCountTableFiltersResult from '../yarn-count-filters-result';
import axios from 'axios';
import AddDialog from '../AddDialog';
import EditDialog from '../EditDialog';
import { Box } from '@mui/system';
import UploadExcelDialog from '../excel-import-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'Yarn_Count_Name', label: 'Yarn Count', minWidth: 40 },
  // { id: 'Yarn_Count', label: 'Yarn Count', minWidth: 140 },
  { id: 'IsActive', label: 'Status', minWidth: 140, align: 'center' },
  // { id: 'YarnCountNickName', label: 'Name & Code', minWidth: 240 },
  { id: '', label: 'Actions', width: 88, align: 'center' },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function YarnCountListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [currentRowData, setCurrentRowData] = useState(null);

  const [isUpdating, setUpdating] = useState(false);

  const FetchYarnCountData = useCallback(async () => {
    try {
      const response = await Get(
        `yarncount?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setTableData(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchYarnCountData()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchYarnCountData]);

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
    handleEditDialogOpen(e);
    // navigate(paths.dashboard.customer.wic.edit(e));
  };

  // -------------------------------------

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    FetchYarnCountData();
    setDialogOpen(false);
  };
  // -------------------------------------

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditDialogOpen = (rowData) => {
    setEditDialogOpen(true);
    setCurrentRowData(rowData);
  };

  const handleEditDialogClose = () => {
    FetchYarnCountData();
    setEditDialogOpen(false);
  };
  // -------------------------------------
  const getNEValue = (name) => {
    if (!name) return "";
  
    if (name.includes("/")) {
      return name.split("/")[0].trim();
    }
  
    if (name.includes("-")) {
      return name.split("-")[0].trim();
    }
  
    return name.trim(); // fallback
  };
  
  const updateRow = async (row) => {
    // eslint-disable-next-line
    const newIsActive = row.IsActive === true ? false : true;

    const updatedData = tableData.map((item) => {
      if (item.Yarn_Count_ID === row.Yarn_Count_ID) {
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
      const NEValue = getNEValue(row.Yarn_Count_Name);
      console.log('NEValue', NEValue);
      const res = await Put(`yarncount/update`, {
        Yarn_Count_ID: row.Yarn_Count_ID,
        Yarn_Count_Name: row.Yarn_Count_Name,
        NE: NEValue,
        UpdatedBy: userData?.userDetails?.userId,
        IsActive: row.IsActive === false ? 1 : 0,
      });
    } catch (error) {
      setTableData(tableData);
      console.error('Failed to update status', error);
    } finally {
      setUpdating(false);
    }
  };

  const DeleteDetailTableRow = async (id) => {
    // const updatedDetails = yarnContractDetails.filter((row) => row !== rowToDelete);
    // setYarnContractDetails(updatedDetails);
    try {
      await Delete(`DeleteYarnCount?YarnDatabaseID=${id}`);
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      FetchYarnCountData();
    } catch (error) {
      console.error('Error deleting detail:', error);
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
            heading="Yarn Count"
            links={[{ name: 'Home', href: paths.dashboard.root }, { name: 'Yarn Count' }]}
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
                  New Yarn Count
                </Button>
              </Box>
            }
          />

          <Card>
            <YarnCountTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <YarnCountTableFiltersResult
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
                  sx={{ minWidth: 300 }}
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
                        <YarnCountTableRow
                          key={row?.Yarn_Count_ID}
                          row={row}
                          isUpdating={isUpdating}
                          selected={table.selected.includes(row?.Yarn_Count_ID)}
                          onEditRow={() => updateRow(row)}
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
      <UploadExcelDialog
        uploadOpen={uploadDialogOpen}
        uploadClose={handleUploadDialogClose}
        FetchUpdatedData={() => {
          FetchYarnCountData();
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
      (yarn) => yarn?.Yarn_Count_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1
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
