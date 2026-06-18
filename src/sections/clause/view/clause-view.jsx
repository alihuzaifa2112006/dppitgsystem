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
import { Delete, Get, Post } from 'src/api/apibasemethods';

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

import ClauseTableRow from '../clause-table-row';
import ClauseTableToolbar from '../clause-toolbar';
import ClauseTableFiltersResult from '../clause-filters-result';
import { alpha, Tab, Tabs } from '@mui/material';
import Label from 'src/components/label';
import AddDptDialog from '../AddDialog';
import EditDialog from '../EditDialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'ClausesCategory', label: 'Category', minWidth: 140 },
  { id: 'Payment_Term', label: 'Payment Term', minWidth: 140 },
  { id: 'Clause', label: 'Clause Name', minWidth: 240 },
  { id: 'Doc_Name', label: 'Document Type', minWidth: 100, align: 'center' },
  // { id: 'isActive', label: 'Status', align: 'center', minWidth: 140 },

  { id: '', label: 'Actions', width: 88, align: 'center' },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Quotation', label: 'Quotation' },
  { value: 'Performa Invoice (P.I)', label: 'Performa Invoice (P.I)' },
  { value: 'Opportunity', label: 'Opportunity' },
  { value: 'Sample Request', label: 'Sample Request' },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Quotation':
      return 'primary';
    case 'Performa Invoice (P.I)':
      return 'error';
    case 'Opportunity':
      return 'warning';
    case 'Sample Request':
      return 'info';
    default:
      return 'default';
  }
};
// ----------------------------------------------------------------------

export default function ClauseListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [currentRowData, setCurrentRowData] = useState(null);
  const [allDocuments, setAllDocuments] = useState([]);
  const [allCategorys, setAllCategorys] = useState([]);
  const [allPaymentTerms, setAllPaymentTerms] = useState([]);
  const [isLoading, setLoading] = useState(true);

  // -------------------------------------

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    FetchClause();
    setDialogOpen(false);
  };
  // -------------------------------------

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditDialogOpen = (rowData) => {
    setEditDialogOpen(true);
    setCurrentRowData(rowData);
  };

  const handleEditDialogClose = () => {
    FetchClause();
    setEditDialogOpen(false);
  };
  // -------------------------------------

  const FetchClause = useCallback(async () => {
    try {
      const response = await Get(
        `clause/all?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      const decryptedData = response.data.map((item) => ({
        ...item,
        isActive: item?.isActive === true ? 'Active' : 'Inactive',
      }));

      setTableData(decryptedData);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetDocuments = useCallback(async () => {
    try {
      const response = await Get(
        `GetDocuments?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );

      setAllDocuments(response.data?.Documents);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetAllClauseCategories = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllClauseCategories?org_Id=${userData?.userDetails?.orgId}&branch_Id=${userData?.userDetails?.branchID}`
      );

      setAllCategorys(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetAllPaymentTerms = useCallback(async () => {
    try {
      const response = await Get(
        `getPaymentTermList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      setAllPaymentTerms(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        FetchClause(),
        GetDocuments(),
        GetAllClauseCategories(),
        GetAllPaymentTerms(),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [FetchClause, GetDocuments, GetAllClauseCategories, GetAllPaymentTerms]);

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

  const uniqueDoc_Name = [...new Set(tableData.map((tb) => tb.ClausesCategory))];

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
    handleEditDialogOpen(e);
    // navigate(paths.dashboard.customer.wic.edit(e));
  };
  const DeleteDetailTableRow = async (row) => {
    try {
      await Post(`/clause/delete`, {
        Clause_ID: row.Clause_ID,
        UpdatedBy: userData?.userDetails?.userId,
      });
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      FetchClause();
    } catch (error) {
      console.error('Error deleting detail:', error);
    }
  };

  const PostClauseCategorys = async (newOption) => {
    if (newOption === '') {
      enqueueSnackbar('Please Enter Clause Category', { variant: 'error' });
      return;
    }
    // check after trimming and lowercase
    const newOptionTrimmed = newOption.trim().toLowerCase();
    // check if the option already exists
    if (
      allCategorys.find(
        (option) => option.ClausesCategory.trim().toLowerCase() === newOptionTrimmed
      )
    ) {
      enqueueSnackbar('This Clause Category already exists', { variant: 'error' });
      return;
    }

    try {
      const dataToSend = {
        ClausesCategory: newOption,
        isActive: true,
        CreatedBy: userData?.userDetails?.userId,
        UpdatedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      };

      await Post('AddClauseCategory', dataToSend);
      GetAllClauseCategories();
      enqueueSnackbar('Clause Category Added Successfully', { variant: 'success' });
    } catch (error) {
      console.log('Error', error);
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
            heading="Terms & Condition / Clause"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              { name: 'Terms & Condition / Clause', href: paths.dashboard.admin.clause.root },
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
                Add Clause
              </Button>
            }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <Card>
            <Tabs
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
                      {[
                        'Quotation',
                        'Performa Invoice (P.I)',
                        'Opportunity',
                        'Sample Request',
                      ].includes(tab.value)
                        ? tableData.filter((td) => td.Doc_Name === tab.value).length
                        : tableData.length}
                    </Label>
                  }
                />
              ))}
            </Tabs>

            <ClauseTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              roleOptions={uniqueDoc_Name}
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <ClauseTableFiltersResult
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
                        <ClauseTableRow
                          key={row?.Clause_ID}
                          row={row}
                          selected={table.selected.includes(row?.Clause_ID)}
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
              //
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />
          </Card>
        </Container>
      )}
      <AddDptDialog
        uploadClose={handleDialogClose}
        uploadOpen={dialogOpen}
        tableData={tableData}
        allDocuments={allDocuments}
        allCategorys={allCategorys}
        allPaymentTerms={allPaymentTerms}
        PostClauseCategorys={PostClauseCategorys}
      />
      <EditDialog
        uploadClose={handleEditDialogClose}
        row={currentRowData}
        uploadOpen={editDialogOpen}
        tableData={tableData}
        allDocuments={allDocuments}
        allCategorys={allCategorys}
        allPaymentTerms={allPaymentTerms}
        PostClauseCategorys={PostClauseCategorys}
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
        yarn?.Doc_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.ClausesCategory.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.Clause.toLowerCase().indexOf(name.toLowerCase()) !== -1
      // yarn?.City_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((supplier) => supplier.Doc_Name === status);
  }

  if (role.length) {
    inputData = inputData.filter((yarn) => role.includes(yarn?.ClausesCategory));
  }

  return inputData;
}
