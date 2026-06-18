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

import ColorTableRow from '../color-table-row';
import ColorTableToolbar from '../color-toolbar';
import ColorTableFiltersResult from '../color-filters-result';
import axios from 'axios';
import { Box } from '@mui/system';
import UploadExcelDialog from '../excel-import-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'HexCode', label: 'Shade', minWidth: 40 },
  { id: 'ColorName', label: 'Color', minWidth: 140 },
  { id: 'Color_Code', label: 'Color Code', minWidth: 140 },
  { id: 'ColorNameandCode', label: 'CYCLO Color & Code', minWidth: 240 },
  { id: 'ColorFamilyName', label: 'Color Family', minWidth: 240 },
  { id: 'TypeName', label: 'Shade Type', minWidth: 240 },
  { id: 'CustomerName', label: 'Customer', minWidth: 240 },
  { id: 'DataColorAndCode', label: 'Data Color & Code', minWidth: 240 },
  { id: '', label: '', width: 88, align: 'center' },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function ColorListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const FetchColorData = useCallback(async () => {
    try {
      const response = await Get(
        `colors/all?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      const newdata = response.data.Data.map((item) => ({
        ...item,
        ColorNickName: `${item.ColorName} - ${item.Color_Code}`,
      }));
      setTableData(newdata);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchColorData()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchColorData]);

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
  const uniqueFamily = [...new Set(tableData.map((tb) => tb.ColorFamilyName))];

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
    navigate(paths.dashboard.productManagement.colorDatabase.edit(e));
  };

  const DeleteDetailTableRow = async (id) => {
    // const updatedDetails = yarnContractDetails.filter((row) => row !== rowToDelete);
    // setYarnContractDetails(updatedDetails);
    try {
      await Delete(`color/delete/${id}/${userData?.userDetails?.userId}`);
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      FetchColorData();
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
            heading="CYCLO Color & Code"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              {
                name: 'CYCLO Color & Code',
                href: paths.dashboard.productManagement.colorDatabase.root,
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
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:file-import-line" />}
                  color="primary"
                  onClick={handleUploadDialogOpen}
                >
                  Import Excel
                </Button>

                <Button
                  component={RouterLink}
                  href={paths.dashboard.productManagement.colorDatabase.new}
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  color="primary"
                >
                  Add Color
                </Button>
              </Box>
            }
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <a
              href="https://apicyclo.scmcloud.online/Uploads/CYCLO - Shade Card.pdf"
              target="_blank"
              rel="noreferrer"
              download
            >
              <Button
                component={RouterLink}
                startIcon={<Iconify icon="mynaui:cloud-download" />}
                href="https://apicyclo.scmcloud.online/Uploads/CYCLO - Shade Card.pdf"
                target="_blank"
                rel="noreferrer" // onClick={handleDownload}
                color="primary"
                variant="text"
              >
                Download Cyclo Shade Card
              </Button>
            </a>
          </Box>
          <Card>
            <ColorTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              tableRef={tableComponentRef.current}
              tableHead={TABLE_HEAD}
              exportData={dataFiltered}
              roleOptions={uniqueFamily}
            />

            {canReset && (
              <ColorTableFiltersResult
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
                        <ColorTableRow
                          key={row?.ColorID}
                          row={row}
                          selected={table.selected.includes(row?.ColorID)}
                          onEditRow={() => moveToEditForm(row?.ColorID)}
                          onDeleteRow={() => DeleteDetailTableRow(row?.ColorID)}
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
          FetchColorData();
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
      (yarn) =>
        // yarn?.SL.toString().toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.HexCode.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.ColorName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.Color_Code.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.ColorNameandCode.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.TypeName.toLowerCase().indexOf(name.toLowerCase()) !== -1 
        // yarn?.CustomerName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        // yarn?.DataColorAndCode.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  // if (status !== 'all') {
  //   inputData = inputData.filter((supplier) => supplier.SupplierStatus === status);
  // }

  if (role.length) {
    inputData = inputData.filter((yarn) => role.includes(yarn?.ColorFamilyName));
  }

  return inputData;
}
