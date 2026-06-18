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

import TransferVoucherTableRow from '../TransferVoucher-table-row';
import TransferVoucherTableToolbar from '../TransferVoucher-toolbar';
import TransferVoucherTableFiltersResult from '../TransferVoucher-filters-result';
import axios from 'axios';
import { Box } from '@mui/system';
import UploadExcelDialog from '../excel-import-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'ColorID', label: 'Particulars', minWidth: 180, align: 'center' },
   { id: 'GPONo', label: 'GPO No', minWidth: 120, align: 'center' },
  { id: 'RequestDate', label: 'Request Date', minWidth: 150, align: 'center' },
  { id: 'SupplierName', label: 'Supplier Name', minWidth: 180, align: 'center' },
  { id: 'ChallanNo', label: 'Challan No', minWidth: 130, align: 'center' },
  { id: 'TotalBags', label: 'Total Bags', minWidth: 120, align: 'center' },
  { id: 'RequiredQty_KG', label: 'Required Qty (KG)', minWidth: 160, align: 'center' },
  { id: 'Remarks', label: 'Remarks', minWidth: 200, align: 'center' },
 
  { id: 'Actions', label: 'Actions', minWidth: 100, align: 'center' },
];
const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function TransferVoucherListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [isLoading, setLoading] = useState(true);

 const flattenRequestData = (requests) => requests.flatMap(request => 
  request.Details.map(detail => ({
    RequestID: request.RequestID,
    ColorID: request.Particulars,
    PRDate: request.RequestDate,
    VendorID: { VendorName: detail.VendorID }, // You might want to replace this with actual vendor name
    ChallanNo: detail.ChallanNo,
    TotalBags: detail.TotalBags,
    RQ: detail.RequiredQty_KG,
    IQ: detail.IssueQty_KG,
    Remarks: detail.Remarks,
    GPONo: detail.GPONo,
    IndentNo: detail.IndentNo
  }))
);
  const FetchTransferVoucherData = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllProductionRequests?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      const flattenedData = flattenRequestData(response.data);
      setTableData(flattenedData);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchTransferVoucherData()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchTransferVoucherData]);

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
    // navigate(paths.dashboard.Production.TransferVoucher.edit(e));
  };

  const DeleteDetailTableRow = async (id) => {
    try {
      await Delete(`TransferVoucher/delete/${id}/${userData?.userDetails?.userId}`);
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      FetchTransferVoucherData();
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
            heading="Raw Material Request"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              {
                name: 'Raw Material Request',
                href: paths.dashboard.Production.TransferVoucher.root,
              },
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
                  href={paths.dashboard.Production.TransferVoucher.new}
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  color="primary"
                >
                  Create Material Request
                </Button>
              </Box>
            }
          />

          <Card>
            <TransferVoucherTableToolbar
              filters={filters}
              onFilters={handleFilters}
              tableRef={tableComponentRef.current}
              tableHead={TABLE_HEAD}
              exportData={dataFiltered}
            />

            {canReset && (
              <TransferVoucherTableFiltersResult
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
                  sx={{ minWidth: 960 }}
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
                        <TransferVoucherTableRow
                          key={`${row.RequestID}-${row.IndentNo}`}
                          row={row}
                          selected={table.selected.includes(row.RequestID)}
                          onDeleteRow={() => DeleteDetailTableRow(row.RequestID)}
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

      <UploadExcelDialog
        uploadOpen={uploadDialogOpen}
        uploadClose={handleUploadDialogClose}
        FetchUpdatedData={() => {
          FetchTransferVoucherData();
        }}
        tableData={tableData}
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (request) =>
        request.ColorID.toLowerCase().includes(name.toLowerCase()) ||
        request.ChallanNo.toLowerCase().includes(name.toLowerCase()) ||
        request.Remarks.toLowerCase().includes(name.toLowerCase()) ||
        request.GPONo.toLowerCase().includes(name.toLowerCase())
    );
  }

  return inputData;
}