import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import { alpha, Tab, Tabs } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { Get, Put } from 'src/api/apibasemethods';

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

import Label from 'src/components/label';

import InvTypeTableRow from '../InvType-table-row';
import InvTypeTableToolbar from '../InvTypetoolbar';
import InvTypeTableFiltersResult from '../InvType-filters-result';
import InvTypeDialog from '../AddDialog';
import InvTypeEditDialog from '../EditDialog';
import { Box } from '@mui/system';
import UploadExcelDialog from '../excel-import-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'InvType_Name', label: 'Item Type', minWidth: 160 },
  { id: 'Code', label: 'Code', minWidth: 100, align: 'center' },
  { id: 'isProcureable', label: 'Procureable', align: 'center', minWidth: 100 },
  { id: 'isProducrable', label: 'Manufacturable', align: 'center', minWidth: 100 },
  { id: 'isColorSensitive', label: 'Color Sensitive', align: 'center', minWidth: 120 },
  { id: 'isRepairable', label: 'Repairable', align: 'center', minWidth: 100 },
  { id: 'isSubContracting', label: 'Sub-Contracting', align: 'center', minWidth: 120 },
  { id: '', label: 'Actions', width: 88, align: 'center' },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function InvTypeListView() {
  const navigate = useNavigate();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const tableComponentRef = useRef();
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const settings = useSettingsContext();
  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [currentRowData, setCurrentRowData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const FetchInvType = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllClasses?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      const data = response?.data?.Data || [];

      const processedData = data.map((item) => ({
        InvTypeID: item.ClassID,
        InvType_Name: item.ClassName,
        isProcureable: item.isProcureable,
        isProducrable: item.isProducrable,
        isColorSensitive: item.isColorSensitive,
        isRepairable: item.isRepairable,
        isSubContracting: item.isSubContracting,
        Code: item.Code,
      }));

      setTableData(processedData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    FetchInvType();
  }, [FetchInvType]);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    FetchInvType();
    setDialogOpen(false);
  };

  const handleEditDialogOpen = (rowData) => {
    setEditDialogOpen(true);
    setCurrentRowData(rowData);
  };

  const handleEditDialogClose = () => {
    FetchInvType();
    setEditDialogOpen(false);
  };

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const denseHeight = table.dense ? 56 : 56 + 20;
  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const uniqueInvTypeNames = [...new Set(tableData.map((tb) => tb.InvType_Name))];

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

  const moveToEditForm = (row) => {
    handleEditDialogOpen(row);
  };

  const DeleteDetailTableRow = async (row) => {
    const dataToSend = {
      ClassID: row?.InvTypeID,
      UpdatedBy: userData?.userDetails?.userId,
    };

    try {
      const res = await Put('DeleteClass', dataToSend);
      enqueueSnackbar(res?.data?.Message || 'Deleted successfully', { variant: 'success' });
      FetchInvType();
    } catch (error) {
      console.error('Error deleting InvType:', error);
      enqueueSnackbar(error?.response?.data?.Message || 'Delete failed', { variant: 'error' });
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
            heading="Item Type"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              { name: 'Item Type', href: paths.dashboard.powertools.inventory.InvType },
              { name: 'list' },
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
                {/* <Button
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:file-import-line" />}
                  color="primary"
                  onClick={handleUploadDialogOpen}
                >
                  Import Excel
                </Button> */}
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  color="primary"
                  onClick={handleDialogOpen}
                >
                  Add Item Type
                </Button>
              </Box>
            }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <Card>
            <InvTypeTableToolbar
              filters={filters}
              onFilters={handleFilters}
              roleOptions={uniqueInvTypeNames}
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <InvTypeTableFiltersResult
                filters={filters}
                onFilters={handleFilters}
                onResetFilters={handleResetFilters}
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
                        <InvTypeTableRow
                          key={row?.InvTypeID}
                          row={row}
                          selected={table.selected.includes(row?.InvTypeID)}
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
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />
          </Card>
        </Container>
      )}
      <InvTypeDialog
        uploadClose={handleDialogClose}
        uploadOpen={dialogOpen}
        tableData={tableData}
      />
      <InvTypeEditDialog
        uploadClose={handleEditDialogClose}
        row={currentRowData}
        uploadOpen={editDialogOpen}
        tableData={tableData}
      />
      <UploadExcelDialog
        uploadOpen={uploadDialogOpen}
        uploadClose={handleUploadDialogClose}
        FetchUpdatedData={() => {
          FetchInvType();
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
      (yarn) => yarn?.InvType_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((supplier) => supplier.isActive === status);
  }

  if (role.length) {
    inputData = inputData.filter((yarn) => role.includes(yarn?.InvType_Name));
  }

  return inputData;
}
