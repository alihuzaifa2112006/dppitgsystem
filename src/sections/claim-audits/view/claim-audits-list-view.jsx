import { useNavigate } from 'react-router';
import isEqual from 'lodash/isEqual';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import { Tab, Tabs } from '@mui/material';

import { paths } from 'src/routes/paths';
import { Get } from 'src/api/apibasemethods';

import { LoadingScreen } from 'src/components/loading-screen';

import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
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

import ClaimAuditsTableRow from '../claim-audits-table-row';
import ClaimAuditsTableToolbar from '../claim-audits-table-toolbar';
import ClaimAuditsTableFiltersResult from '../claim-audits-table-filters-result';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'Settled', label: 'Settled' },
  { value: 'Not Settled', label: 'Not Settled' },
];

const TABLE_HEAD = [
  { id: 'ReportNo', label: 'Report No.' },
  { id: 'AuditDate', label: 'Audit Date' },
  { id: 'ComplaintAutoNo', label: 'Claim No.' },
  { id: 'CustomerName', label: 'Customer' },
  { id: 'AuditorName', label: 'Auditor' },
  { id: 'Status', label: 'Status' },
  { id: '', width: 88 },
  // { id: '', width: 88 },
];
const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function ClaimAuditsListView() {
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const navigate = useNavigate();

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const PDFClicked = (AssignedID) => {
    // alert("this click will naviagte to page pdf")
    navigate(paths.dashboard.customerClaim.claimAudits.pdf(AssignedID));
  };

  const GetComplaintsData = useCallback(async () => {
    try {
      const response = await Get(
        `GetAuditComplaintList?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      const updatedData = response.data.Data?.map((x, index) => ({
        ...x,
        AuditDate: new Date(x.AuditDate),
      }));
      setTableData(updatedData);
    } catch (error) {
      console.log(error);
    }
  }, [userData]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([GetComplaintsData()]);
      setLoading(false);
    };
    fetchData();
  }, [GetComplaintsData]);

  const table = useTable();

  const settings = useSettingsContext();

  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered?.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered?.length && canReset) || !dataFiltered?.length;

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

  const renderLoading = (
    <LoadingScreen
      sx={{
        borderRadius: 1.5,
        bgcolor: 'background.default',
      }}
    />
  );

  const moveToSettlementForm = (CustomerID, AuditID) => {
    navigate(paths.dashboard.customerClaim.claimAudits.settlement(CustomerID, AuditID));
  };

  return (
    <>
      {isLoading ? (
        renderLoading
      ) : (
        <Container maxWidth={settings.themeStretch ? false : 'lg'}>
          <CustomBreadcrumbs
            heading="Claim Audit"
            links={[{ name: 'Home', href: paths.dashboard.root }, { name: 'Claim Audit' }]}
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
              {STATUS_OPTIONS?.map((tab, index) => (
                <Tab
                  key={index}
                  iconPosition="end"
                  value={tab.value}
                  label={tab.label}
                  icon={
                    <Label
                      variant={
                        ((tab.value === 'all' || tab.value === filters.status) && 'filled') ||
                        'soft'
                      }
                      color={
                        (tab.value === 'Settled' && 'success') ||
                        (tab.value === 'Not Settled' && 'warning') ||
                        'default'
                      }
                    >
                      {['Settled', 'Not Settled'].includes(tab.value)
                        ? tableData?.filter((claim) => claim.Status === tab.value).length
                        : tableData?.length}
                    </Label>
                  }
                />
              ))}
            </Tabs>
            <ClaimAuditsTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              roleOptions={[]}
              tableRef={tableComponentRef.current}
            />

            {canReset && (
              <ClaimAuditsTableFiltersResult
                filters={filters}
                onFilters={handleFilters}
                //
                onResetFilters={handleResetFilters}
                //
                results={dataFiltered?.length}
                sx={{ p: 2.5, pt: 0 }}
              />
            )}

            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <TableSelectedAction dense={table.dense} rowCount={dataFiltered?.length} />

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
                    rowCount={dataFiltered?.length}
                    onSort={table.onSort}
                  />

                  <TableBody>
                    {dataFiltered
                      ?.slice(
                        table.page * table.rowsPerPage,
                        table.page * table.rowsPerPage + table.rowsPerPage
                      )
                      ?.map((row) => (
                        <ClaimAuditsTableRow
                          key={row?.AssignedID}
                          row={row}
                          onEditRow={() => moveToSettlementForm(row?.CustomerID, row?.AssignedID)}
                          PDFClicked={() => PDFClicked(row?.AssignedID)}
                        />
                      ))}

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(table.page, table?.rowsPerPage, dataFiltered?.length)}
                    />

                    <TableNoData notFound={notFound} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            <TablePaginationCustom
              count={dataFiltered?.length}
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
  const { name, status } = filters;

  const stabilizedThis = inputData?.map((el, index) => [el, index]);

  stabilizedThis?.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis?.map((el) => el[0]);

  if (name) {
    inputData = inputData?.filter(
      (claim) =>
        claim.ComplaintAutoNo.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        claim.ReportNo.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        claim.AuditorName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        claim.CustomerName.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData?.filter((claim) => claim.Status === status);
  }

  return inputData;
}
