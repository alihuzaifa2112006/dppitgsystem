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

import OpportunityTableRow from '../opportunity-table-row';
import OpportunityTableToolbar from '../opportunity-toolbar';
import OpportunityTableFiltersResult from '../opportunity-filters-result';
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
  { id: 'OpportunityName', label: 'Opportunity Name', minWidth: 180 },
  { id: 'WIC_Name', label: 'Customer', minWidth: 180 },
  { id: 'KAM_Name', label: 'Key Account Manager', minWidth: 180 },
  { id: 'Priority', label: 'Priority', minWidth: 140 },
  { id: 'Level1_Approve', label: '1st Approver Status', minWidth: 150, align: 'center' },
  { id: 'Approver1_Name', label: '1st Approver', minWidth: 150 },
  { id: 'Level1_Approved_Remarks', label: '1st Approver Remarks', minWidth: 240 },
  { id: 'Level2_Approve', label: '2nd Approver Status', minWidth: 150, align: 'center' },
  { id: 'Approver2_Name', label: '2nd Approver Status', minWidth: 150 },
  { id: 'Level2_Approved_Remarks', label: '2nd Approver Remarks', minWidth: 240 },
  { id: 'OpportunityDate', label: 'Opportunity Date', minWidth: 140 },
  { id: 'EndDate', label: 'End Date', minWidth: 140 },
  // { id: 'Quantity', label: 'Quantity', align: 'center', minWidth: 140 },
  // { id: 'UnitName', label: 'Unit Name', align: 'center', minWidth: 140 },
  // { id: 'CurrencyName', label: 'CurrencyName' },
  // { id: 'Quantity', label: 'Quantity' },

  { id: '', width: 88, align: 'center' },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
];

// ----------------------------------------------------------------------

export default function OpportunityListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const FetchOpportunityData = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllActiveinactiveOpportunities?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      const res = await Get(
        `getDocumentApproverByID?&ApproverID=${userData?.userDetails?.userId}&DocID=4`
      );

      let data = res?.data || [];
      if (res?.data?.Data) {
        data = res?.data?.Data || [];
      }

      const updatedData = response.data.Data.map((item) => ({
        ...item,

        Approver1_Image: `${APP_API_STORAGE}${item.Approver1_Image}`,
        Approver2_Image: `${APP_API_STORAGE}${item.Approver2_Image}`,

        Level1_Approve:
          item?.Level1_Approve === 'A'
            ? 'Approved'
            : item?.Level1_Approve === 'R'
              ? 'Rejected'
              : 'Pending',
        Level2_Approve:
          item?.Level2_Approve === 'A'
            ? 'Approved'
            : item?.Level2_Approve === 'R'
              ? 'Rejected'
              : 'Pending',

        CreatedDate: new Date(item?.CreatedDate),
        EndDate: new Date(item?.EndDate),
        OpportunityDate: new Date(item?.OpportunityDate),
      }));

      if (data?.length > 0) {
        const newUpdatedDta = updatedData?.map((item) => {
          const toApprove =
            (data[0]?.Approval_Lvl_ID === 1 && !item?.Level1_Approved_ID) ||
            (data[0]?.Approval_Lvl_ID === 2 && !item?.Level2_Approved_ID);
          return {
            ...item,
            ToBeApproved: toApprove,
          };
        });
        setTableData(newUpdatedDta);
      } else {
        setTableData(updatedData);
      }
    } catch (error) {
      console.log(error);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    userData?.userDetails?.userId,
  ]);

  console.log('tableData', tableData);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchOpportunityData()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchOpportunityData]);

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
    navigate(paths.dashboard.transaction.opportunity.edit(e));
  };
  // Approval Functions
  const moveToApprovalForm = (e) => {
    navigate(paths.dashboard.transaction.opportunity.approval(e));
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
            heading="Opportunity"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              { name: 'Opportunity', href: paths.dashboard.transaction.opportunity.root },
              { name: 'List' },
            ]}
            action={
              <Button
                component={RouterLink}
                href={paths.dashboard.transaction.opportunity.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                color="primary"
              >
                Add Opportunity
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
                      color={getColors(tab.value)}
                    >
                      {['Low', 'Medium', 'High'].includes(tab.value)
                        ? tableData.filter((td) => td.Priority === tab.value).length
                        : tableData.length}
                    </Label>
                  }
                />
              ))}
            </Tabs>
            <OpportunityTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <OpportunityTableFiltersResult
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
                        <OpportunityTableRow
                          key={row?.OpportunityID}
                          row={row}
                          selected={table.selected.includes(row?.OpportunityID)}
                          onEditRow={() => moveToEditForm(row?.OpportunityID)}
                          onApprovalRow={() => moveToApprovalForm(row?.OpportunityID)}
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
        yarn?.OpportunityName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.WIC_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        // yarn?.PaymentTerm.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        // yarn?.ContractDate.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.KAM_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1
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
