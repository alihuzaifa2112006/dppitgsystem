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
import { useNavigate } from 'react-router-dom';
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

import ClaimAssignmentTableRow from '../claim-assignment-table-row';
import ClaimAssignmentTableToolbar from '../claim-assignment-table-toolbar';
import ClaimAssignmentTableFiltersResult from '../claim-assignment-table-filters-result';
import QCAssignmentDialog from '../qc-assignment-dialog';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 1, label: 'Waiting for Visit' },
  { value: 2, label: 'Waiting for Claim Qty Approval' },
  { value: 3, label: 'Rejected' },
];

const TABLE_HEAD = [
  { id: 'PINo', label: 'PI No' },
  { id: 'ComplaintAutoNo', label: 'Claim No.' },
  { id: 'CustomerName', label: 'Customer' },
  { id: 'ComplaintName', label: 'Complainant' },
  { id: 'QCName', label: 'QC Name', minWidth: 150 },
  { id: 'ComplaintDate', label: 'Complaint Date' },
  { id: 'StatusName', label: 'Status' },
  { id: '', width: 88 },
  // { id: '', width: 88 },
];
const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function ClaimAssignmentListView() {
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [QCList, setQCList] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const GetComplaintsData = useCallback(async () => {
    try {
      const response = await Get(
        `GetComplaintList?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      const updatedData = response.data.Data?.map((x, index) => ({
        ...x,
        ComplaintDate: new Date(x.ComplaintDate),
        uniqueID: index + 1,
      }));
      setTableData(updatedData);
    } catch (error) {
      console.log(error);
    }
  }, [userData]);

  const GetQCData = useCallback(async () => {
    try {
      const response = await Get('GetQCUsers');
      setQCList(response.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([GetComplaintsData(), GetQCData()]);
      setLoading(false);
    };
    fetchData();
  }, [GetComplaintsData, GetQCData]);

  const table = useTable();
  const navigate = useNavigate();
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
  const PDFClicked = (id) => {
    // alert("this click will naviagte to page pdf")
    navigate(paths.dashboard.customerClaim.monitor.pdf(id));
  };

  // console.log("check karo ya pdf ki file hai ")

  const renderLoading = (
    <LoadingScreen
      sx={{
        borderRadius: 1.5,
        bgcolor: 'background.default',
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
            heading="Claim Monitor"
            links={[{ name: 'Home', href: paths.dashboard.root }, { name: 'Claim Monitor' }]}
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
                        (tab.value === 1 && 'info') ||
                        (tab.value === 2 && 'warning') ||
                        (tab.value === 3 && 'error') ||
                        'default'
                      }
                    >
                      {[1, 2, 3].includes(tab.value)
                        ? tableData?.filter((claim) => claim.StatusID === tab.value).length
                        : tableData?.length}
                    </Label>
                  }
                />
              ))}
            </Tabs>
            <ClaimAssignmentTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              roleOptions={[]}
              tableRef={tableComponentRef.current}
            />

            {canReset && (
              <ClaimAssignmentTableFiltersResult
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
                        <ClaimAssignmentTableRow
                          key={row?.uniqueID}
                          row={row}
                          onEditRow={() => handleEdit(row)}
                          PDFClicked={() => PDFClicked(1)}
                        />
                      ))}

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(table.page, table?.rowsPerPage, dataFiltered?.length)}
                    />

                    <TableNoData notFound={notFound} />
                  </TableBody>
                  {editDialogOpen && (
                    <QCAssignmentDialog
                      editOpen={editDialogOpen}
                      onEditClose={handleEditDialogClose}
                      currentData={editModel}
                      FetchUpdatedData={() => {
                        GetComplaintsData();
                      }}
                      QCList={QCList}
                    />
                  )}
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
        claim.ComplaintName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        claim.CustomerName.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData?.filter((claim) => claim.StatusID === status);
  }

  return inputData;
}
