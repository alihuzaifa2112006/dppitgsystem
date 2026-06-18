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

import ApprovalTableRow from '../approval-table-row';
import ApprovalTableToolbar from '../approval-toolbar';
import ApprovalTableFiltersResult from '../approval-filters-result';
import axios from 'axios';
import { alpha, Tab, Tabs } from '@mui/material';
import Label from 'src/components/label';

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
    case 'Purchase Order':
      return 'success';
    case 'Purchase Request':
      return 'default';
    default:
      return 'default';
  }
};

// ----------------------------------------------------------------------



const TABLE_HEAD = [
  { id: 'Doc_Name', label: 'Document', minWidth: 240 },
  {
    id: 'ApproverNickName',
    label: 'Approver Name',
    minWidth: 140,
  },
  { id: 'Approval_LvlID', label: 'Approval Levels', minWidth: 120, align: 'center' },
  { id: 'Designation', label: 'Designation', minWidth: 120 },
  { id: 'SectionName', label: 'Section', minWidth: 120 },
  { id: 'Dpt_Name', label: 'Department', minWidth: 120 },
  { id: '', label: 'Actions', width: 88, align: 'center' },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function ApprovalListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const FetchApprovalData = useCallback(async () => {
    try {
      const response = await Get(
        `GetDocApprovalSetup?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      const newdata = response.data.map((item) => ({
        ...item,
        ApproverNickName: item?.Username || '-',
      }));
      setTableData(newdata);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchApprovalData()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchApprovalData]);

  const { enqueueSnackbar } = useSnackbar();

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [filters, setFilters] = useState(defaultFilters);

  const statusOptions = useMemo(() => {
    const allStatus = tableData.map((item) => item.Doc_Name);
    const uniqueStatus = [...new Set(allStatus)];
    return [
      { value: 'all', label: 'All' },
      ...uniqueStatus.map((status) => ({ value: status, label: status })),
    ];
  }, [tableData]);

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

  const uniqueLevels = [...new Set(tableData.map((tb) => tb.Approval_LvlID))];

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
    navigate(paths.dashboard.admin.docApproval.edit(e));
  };

  const DeleteDetailTableRow = async (id) => {
    // const updatedDetails = yarnContractDetails.filter((row) => row !== rowToDelete);
    // setYarnContractDetails(updatedDetails);
    try {
      await Delete(`DeleteApproval?YarnDatabaseID=${id}`);
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      FetchApprovalData();
    } catch (error) {
      console.error('Error deleting detail:', error);
    }
  };

  // -------------------------------------

  const renderLoading = (
    <LoadingScreen
      sx={{
        borderRadius: 1.5,
        bgapproval: 'background.default',
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
            heading="Document Approval"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              {
                name: 'Document Approval',
                href: paths.dashboard.admin.docApproval.root,
              },
              { name: 'List' },
            ]}
            action={
              <Button
                component={RouterLink}
                href={paths.dashboard.admin.docApproval.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                color="primary"
              >
                Add Document Approval
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
              {statusOptions.map((tab) => (
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
                      {tab.value === 'all'
                        ? tableData.length
                        : tableData.filter((td) => td.Doc_Name === tab.value).length}
                    </Label>
                  }
                />
              ))}
            </Tabs>

            <ApprovalTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              roleOptions={uniqueLevels}
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <ApprovalTableFiltersResult
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
                        <ApprovalTableRow
                          key={row?.Approval_ID}
                          row={row}
                          selected={table.selected.includes(row?.Approval_ID)}
                          onEditRow={() => moveToEditForm(row?.Doc_ID)}
                          onDeleteRow={() => DeleteDetailTableRow(row?.Approval_ID)}
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
      (document) =>
        document?.Doc_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        document?.ApproverNickName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        // document?.Approval_LvlID.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        document?.Designation.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        document?.SectionName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        document?.Dpt_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((supplier) => supplier.Doc_Name === status);
  }

  if (role.length) {
    inputData = inputData.filter((document) => role.includes(document?.Approval_LvlID));
  }

  return inputData;
}
