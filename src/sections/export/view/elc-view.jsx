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
import { Get, Post, Put } from 'src/api/apibasemethods';

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

import ExportTableRow from '../elc-table-row';
import ExportTableToolbar from '../elc-toolbar';
import ExportTableFiltersResult from '../elc-filters-result';
import axios from 'axios';
import { Box } from '@mui/system';
import RptDialog from '../ReportDialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'ExportLCNo', label: 'Export L/C No.', minWidth: 145 },
  { id: 'LCDate', label: 'L/C Date', minWidth: 140 },
  { id: 'BeneficiaryName', label: 'Beneficiary', minWidth: 160 },
  { id: 'OpeningBank', label: 'Opening Bank', minWidth: 180 },
  { id: 'LienBank', label: 'Lien Bank', minWidth: 180 },
  { id: 'LienDate', label: 'Lien Date', minWidth: 180 },
  { id: 'ReceiveThroughBank', label: 'Receive Through', minWidth: 180 },
  { id: 'ExpiryDate', label: 'Expiry Date', minWidth: 140 },
  { id: 'ShipDate', label: 'Ship Date', minWidth: 140 },
  { id: 'ExportLCAmount', label: 'L/C Amount', minWidth: 140, align: 'right' },
  { id: 'Status', label: 'Status', minWidth: 150, align: 'center' },
  { id: '', label: 'Actions', width: 88, align: 'center' },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function ExportListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isApprover, setIsApprover] = useState(false);

  // const FetchPiData = useCallback(async () => {
  //   try {
  //     const response = await Get(
  //       `GetPILIST?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
  //     );
  //     const updatedData = response.data.PendingPIList.map((item) => ({
  //       ...item,
  //       CreatedDate: new Date(item?.CreatedDate),
  //       ValidFrom: new Date(item?.ValidFrom),
  //       ValidUntil: new Date(item?.ValidUntil),
  //     }));

  //     setTableData(updatedData);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const FetchExportLCData = useCallback(async () => {
    try {
      const response = await Get(
        `CommercialModule/GetExportLCList?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );


      // Set Status to "Pending" by default if not present
      const formattedData = (response.data.Data || []).map((item) => ({
        ...item,
        Status: item.Status || 'Pending',
      }));

      setTableData(formattedData);
    } catch (error) {
      console.log(error);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,

  ]);

  // Check if user is an approver for Doc_ID=8
  const CheckApproverStatus = useCallback(async () => {
    try {
      const response = await Get(
        `getDocumentApproverByID?&ApproverID=${userData?.userDetails?.userId}&DocID=8`
      );

      let approverData = response?.data || [];
      if (response?.data?.Data) {
        approverData = response?.data?.Data || [];
      }

      // Check if current user exists in approver list
      const userIsApprover = Array.isArray(approverData)
        ? approverData.some((item) => item.ApproverID === userData?.userDetails?.userId)
        : false;

      setIsApprover(userIsApprover);
    } catch (error) {
      console.error('Error checking approver status:', error);
      setIsApprover(false);
    }
  }, [userData?.userDetails?.userId]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchExportLCData(), CheckApproverStatus()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchExportLCData, CheckApproverStatus]);

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

  // Handle Status Change
  const handleStatusChange = useCallback((exportLCID, newStatus) => {
    setTableData((prevData) =>
      prevData.map((item) =>
        item.ExportLCID === exportLCID
          ? { ...item, Status: newStatus }
          : item
      )
    );
  }, []);

  // Handle Approval
  const handleApprove = useCallback(async (exportLCID) => {
    try {
      const response = await Put(`CommercialModule/ApproveExportLC`, {
        ExportLCID: exportLCID,
        ApprovedBy: userData?.userDetails?.userId,
        Org_ID: userData?.userDetails?.orgId,
        Branch_ID: userData?.userDetails?.branchID,
      });

      if (response.status === 200 || response.data?.Success) {
        enqueueSnackbar('Export L/C approved successfully!', { variant: 'success' });

        // Update the table data with approval information from response
        const approvedByName = response.data?.Data?.ApprovedByName ||
          response.data?.ApprovedByName ||
          (response.data?.Success ? 'Approved' : null);

        if (approvedByName) {
          setTableData((prevData) =>
            prevData.map((item) =>
              item.ExportLCID === exportLCID
                ? {
                  ...item,
                  Status: 'Approved',
                  ApprovedByName: approvedByName,
                }
                : item
            )
          );
        }

        // Refresh the data to get the latest from server
        await FetchExportLCData();
      } else {
        enqueueSnackbar(response.data?.Message || 'Failed to approve Export L/C', { variant: 'error' });
      }
    } catch (error) {
      console.error('Approval error:', error);
      enqueueSnackbar(error.response?.data?.Message || 'Error approving Export L/C', { variant: 'error' });
    }
  }, [userData, enqueueSnackbar, FetchExportLCData]);

  // Edit Functions
  const moveToEditForm = (e) => {
    navigate(paths.dashboard.Commercial.export.ExportLC.edit(e));
  };
  const moveToAmendmentForm = (e) => {
    navigate(paths.dashboard.Commercial.export.ExportLC.amendment(e));
  };
  const moveToViewForm = (e) => {
    navigate(paths.dashboard.Commercial.export.ExportLC.view(e));
  };

  // -------------------------------------
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {

    setDialogOpen(false);
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
            heading="L/C Tagging "
            links={[
              { name: 'Home', href: paths.dashboard.root },
              { name: 'L/C Tagging', href: paths.dashboard.Commercial.export.ExportLC.root },
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
                  component={RouterLink}
                  href={paths.dashboard.Commercial.export.ExportLC.new}
                  variant="contained"
                  startIcon={<Iconify icon="pepicons-pencil:plus" />}
                  color="primary"
                >
                  Add L/C Tagging
                </Button>

              </Box>
            }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <Card>
            <ExportTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <ExportTableFiltersResult
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
                        <ExportTableRow
                          key={row?.ExportLCID}
                          row={row}
                          selected={table.selected.includes(row?.ExportLCID)}
                          onEditRow={() => moveToEditForm(row?.ExportLCID)}
                          onAmendment={() => moveToAmendmentForm(row?.ExportLCID)}
                          onViewRow={() => moveToViewForm(row?.ExportLCID)}
                          onStatusChange={(newStatus) => handleStatusChange(row?.ExportLCID, newStatus)}
                          onApprove={() => handleApprove(row?.ExportLCID)}
                          isApprover={isApprover}
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
      <RptDialog uploadClose={handleDialogClose} uploadOpen={dialogOpen} tableData={tableData} />
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
        yarn?.ExportLCNo.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.BeneficiaryName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.OpeningBank.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.LienBank.toLowerCase().indexOf(name.toLowerCase()) !== -1
      // yarn?.YarnCount.toLowerCase().indexOf(name.toLowerCase()) !== -1
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
