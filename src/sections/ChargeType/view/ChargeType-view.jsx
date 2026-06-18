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

import MachineTableRow from '../Machine-table-row';
import MachineTableToolbar from '../Machinetoolbar';
import MachineTableFiltersResult from '../Machine-filters-result';
import { alpha, Tab, Tabs } from '@mui/material';
import Label from 'src/components/label';
import MachineDialog from '../AddDialog';
import MachineEditDialog from '../EditDialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  // Display the new name field
  { id: 'ExtraChargesName', label: 'Charge Type Name', minWidth: 180 },
  { id: '', label: 'Actions', width: 88, align: 'center' },
];
const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

const getStatusColor = (stID) => {
  switch (stID) {
    case 'Active':
      return 'success';
    // case 'Pending':
    //   return 'warning';
    case 'Inactive':
      return 'error';
    //   case 'Uploaded':
    //     return 'info';
    default:
      return 'default';
  }
};
// ----------------------------------------------------------------------

export default function MachineListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();
  const { enqueueSnackbar } = useSnackbar();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [Machine, setMachine] = useState([]);
  const [currentRowData, setCurrentRowData] = useState(null);
  const [AllRoles, setAllRoles] = useState([]);
  const [AllSections, setAllSections] = useState([]);
  const [isLoading, setLoading] = useState(true);

  // -------------------------------------

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    FetchExtraCharges();
    setDialogOpen(false);
  };
  // -------------------------------------

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditDialogOpen = (rowData) => {
    setEditDialogOpen(true);
    setCurrentRowData(rowData);
  };

  const handleEditDialogClose = () => {
    FetchExtraCharges();
    setEditDialogOpen(false);
  };
  // -------------------------------------

  //  const FetchExtraCharges = useCallback(async () => {
  //   try {
  //     const response = await Get(`GetAllExtraCharges?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`);
  //     const data = response?.data?.data || [];

  //     const processedData = data.map((item) => ({
  //   MachineID: item.MachineID,
  //   Machine_Name: item.MachineName,
  //   MachineCode: item.MachineCode, // Add this
  // }));

  //     setTableData(processedData);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }, [userData?.userDetails?.branchID, userData?.userDetails?.orgId]);
  const FetchExtraCharges = useCallback(async () => {
    const orgId = userData?.userDetails?.orgId || 0;
    const branchId = userData?.userDetails?.branchID || 0;

    try {
      const response = await Get(`GetAllExtraCharges?OrgID=${orgId}&BranchID=${branchId}`);
      const data = response?.data || [];

      const processedData = data.map((item) => {
        // Determine status - handle null as 'Active'
        let status = 'Inactive';
        if (item.IsActive === true || item.IsActive === null) {
          status = 'Active';
        }

        return {
          // Keep original API fields
          ExtraChargesID: item.ExtraChargesID,
          ExtraChargesName: item.ExtraChargesName,
          Org_Id: item.Org_Id,
          Branch_Id: item.Branch_Id,
          IsActive: status,
        };
      });

      setTableData(processedData);
    } catch (error) {
      console.error('Error fetching Extra Charges:', error);
      enqueueSnackbar('Failed to fetch charges data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [userData?.userDetails?.branchID, userData?.userDetails?.orgId, enqueueSnackbar]);

  useEffect(() => {
    FetchExtraCharges();
  }, [FetchExtraCharges]);

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

  const uniqueMachine_Name = [...new Set(tableData.map((tb) => tb.MachineCode))];

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
    if (Machine.find((city) => city.MachineID === e.MachineID)) {
      enqueueSnackbar('This Machine is in use!', { variant: 'error' });
      return;
    }
    handleEditDialogOpen(e);
    // navigate(paths.dashboard.customer.wic.edit(e));
  };
  const DeleteExtraChargesRow = async (row) => {
    const orgId = userData?.userDetails?.orgId;
    const branchId = userData?.userDetails?.branchID;
    const userId = userData?.userDetails?.userId;

    // Confirm first
    if (!row?.ExtraChargesID) {
      enqueueSnackbar('Invalid record selected', { variant: 'error' });
      return;
    }

    // Build endpoint with query params
    const url = `DeleteExtraCharges?ExtraChargesID=${row.ExtraChargesID}&OrgID=${orgId}&BranchID=${branchId}&UserID=${userId}`;

    // Optional body (your backend may ignore it, but it's safe)
    const body = {
      ExtraChargesID: row.ExtraChargesID,
      ExtraChargesName: row.ExtraChargesName,
      IsActive: row.IsActive === 'Active', // convert back to boolean
      Org_Id: orgId,
      Branch_Id: branchId,
      Last_Updated_By: userId,
    };

    try {
      console.log('Deleting Extra Charge:', body);
      const res = await Delete(url, body); // ✅ Use PUT as your API requires
      enqueueSnackbar(res?.data?.Message || 'Charge deleted successfully', { variant: 'success' });
      FetchExtraCharges(); // Refresh table after delete
    } catch (error) {
      console.error('Error deleting Extra Charge:', error);
      enqueueSnackbar(error?.response?.data?.Message || 'Delete failed', { variant: 'error' });
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
            heading="Charges Type"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              { name: 'Charges Type', href: paths.dashboard.powertools.inventory.ChargeType },
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
                Add Charges Type
              </Button>
            }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <Card>
            <MachineTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              roleOptions={uniqueMachine_Name}
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <MachineTableFiltersResult
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
                        <MachineTableRow
                          key={row?.MachineID}
                          row={row}
                          selected={table.selected.includes(row?.MachineID)}
                          onEditRow={() => moveToEditForm(row)}
                          onDeleteRow={() => {
                            DeleteExtraChargesRow(row);
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
      <MachineDialog
        uploadClose={handleDialogClose}
        uploadOpen={dialogOpen}
        tableData={tableData}
      />
      <MachineEditDialog
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
    inputData = inputData.filter((yarn) =>
      yarn?.Machine_Name?.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((supplier) => supplier.IsActive === status);
  }

  // if (role.length) {
  //   inputData = inputData.filter((yarn) => role.includes(yarn?.Machine_Code));
  // }

  return inputData;
}
