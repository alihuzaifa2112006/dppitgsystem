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

import PiemailTableRow from '../piemail-table-row';
import PiemailTableToolbar from '../piemail-toolbar';
import PiemailTableFiltersResult from '../piemail-filters-result';
import { alpha, Tab, Tabs } from '@mui/material';
import Label from 'src/components/label';
import AddDptDialog from '../AddDialog';
import EditDialog from '../EditDialog';
import { useForm } from 'react-hook-form';
import FormProvider, { RHFAutocomplete } from 'src/components/hook-form';
import { Box } from '@mui/system';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'ProformaNo', label: 'Proforma No.', minWidth: 160 },
  { id: 'EmailTo', label: 'Email To', minWidth: 140 },
  { id: 'EmailDate', label: 'Email Date', minWidth: 140 },
  // { id: 'IsReminder', label: 'Is Reminder', minWidth: 140 },
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
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  // { value: 'Uploaded', label: 'Uploaded' },
  // { value: 'On Hold', label: 'On Hold' },
];

const getStatusColor = (stID) => {
  switch (stID) {
    case 'Active':
      return 'success';
    // case 'Pending':
    //   return 'warning';
    // case 'Inactive':
    //   return 'error';
    //   case 'Uploaded':
    //     return 'info';
    default:
      return 'default';
  }
};
// ----------------------------------------------------------------------

export default function PiemailListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [currentRowData, setCurrentRowData] = useState(null);
  const [AllRoles, setAllRoles] = useState([]);
  const [AllSections, setAllSections] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [piNos, setPiNos] = useState([]);

  // -------------------------------------

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    // FetchPiemail();
    setDialogOpen(false);
  };
  // -------------------------------------

  // const [editDialogOpen, setEditDialogOpen] = useState(false);

  // const handleEditDialogOpen = (rowData) => {
  //   setEditDialogOpen(true);
  //   setCurrentRowData(rowData);
  // };

  // const handleEditDialogClose = () => {
  //   FetchPiemail();
  //   setEditDialogOpen(false);
  // };
  // -------------------------------------

  // const FetchPiemail = useCallback(async () => {
  //   try {
  //     const response = await Get(
  //       `GetAllActiveInactiveDpt?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
  //     );
  //     const decryptedData = response.data.Piemails.map((item) => ({
  //       ...item,
  //       isActive: item?.isActive === true ? 'Active' : 'Inactive',
  //     }));

  //     setTableData(decryptedData);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // const FetchAllRoles = useCallback(async () => {
  //   try {
  //     const response = await Get(
  //       `getActiveRoles?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
  //     );
  //     const decryptedData = response.data.Data;
  //     setAllRoles(decryptedData);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  // const FetchAllSections = useCallback(async () => {
  //   try {
  //     const response = await Get(
  //       `GetSections?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
  //     );
  //     const decryptedData = response.data.Data;
  //     setAllSections(decryptedData);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetProformaNoDropdown = useCallback(async () => {
    try {
      const response = await Get(
        `GetProformaNoDropdown?&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );

      setPiNos(response.data?.Data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([GetProformaNoDropdown()]);
      setLoading(false);
    };
    fetchData();
  }, [GetProformaNoDropdown]);

  const { enqueueSnackbar } = useSnackbar();

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [selectedRow, setSelectedRow] = useState(null);

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

  const uniqueCountry_Name = [...new Set(tableData.map((tb) => tb.Country_Name))];

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

  const viewMail = (row) => {
    setSelectedRow(
      tableData.find((item) => item.PIEmailHistoryID === row.PIEmailHistoryID) || null
    );
    handleDialogOpen(row);
  };

  const moveToEditForm = (e) => {
    // handleEditDialogOpen(e);
    // navigate(paths.dashboard.customer.wic.edit(e));
  };
  const DeleteDetailTableRow = async (row) => {
    if (AllRoles?.some((role) => role.DPT_ID === row.Dpt_ID)) {
      enqueueSnackbar('This piemail is being used in role database', { variant: 'error' });
      return;
    }
    if (AllSections?.some((role) => role.DPT_ID === row.Dpt_ID)) {
      enqueueSnackbar('This piemail is being used in section database', { variant: 'error' });
      return;
    }
    try {
      await Delete(`DeleteDpt/${row.Dpt_ID}`);
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
      GetEmailHistoryByProformaNo();
    } catch (error) {
      console.error('Error deleting detail:', error);
    }
  };
  // -------------------------------------

  const GetEmailHistoryByProformaNo = useCallback(
    async (proformaNo) => {
      // setLoading(true);
      try {
        const response = await Get(
          `GetEmailHistoryByProformaNo?proformaNo=${proformaNo}&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
        );
        setTableData(response.data?.Data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    },
    [userData?.userDetails?.orgId, userData?.userDetails?.branchID]
  );

  const methods = useForm({
    // resolver: yupResolver(NewPiSchema),
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (values.PINo?.ProformaNo) {
       GetEmailHistoryByProformaNo(values.PINo?.ProformaNo);
    } else {
      setTableData([]);
    }
  }, [values.PINo, GetEmailHistoryByProformaNo]);

  const onSubmit = handleSubmit(async (data) => {
    // if (piDetails.length === 0) {
    //   enqueueSnackbar('Please add at least one pi product', { variant: 'error' });
    //   return;
    // }
  });
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
            heading="PI Email History"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              // { name: 'Piemail', href: paths.dashboard.email.root },
              { name: 'PI Email History' },
            ]}
            // action={
            //   <Button
            //     variant="contained"
            //     startIcon={<Iconify icon="mingcute:add-line" />}
            //     color="primary"
            //     // onClick={handleDialogOpen}
            //     sx={{
            //       mb: 1,
            //     }}
            //   >
            //     Add Piemail
            //   </Button>
            // }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              mb={5}
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              }}
            >
              <RHFAutocomplete
                name="PINo"
                label="PI No."
                fullWidth
                options={piNos}
                getOptionLabel={(option) => option?.ProformaNo || ''}
                isOptionEqualToValue={(option, value) =>
                  option?.PIEmailHistoryID === value?.PIEmailHistoryID
                }
                // onChange={(_, value) => {
                //   if (value?.ProformaNo) {
                //   }
                // }}
              />
            </Box>
          </FormProvider>

          <Card>
            {/* <Tabs
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
                      {['Active', 'Inactive'].includes(tab.value)
                        ? tableData.filter((td) => td.isActive === tab.value).length
                        : tableData.length}
                    </Label>
                  }
                />
              ))}
            </Tabs> */}
            {/* <PiemailTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              roleOptions={uniqueCountry_Name}
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <PiemailTableFiltersResult
                filters={filters}
                onFilters={handleFilters}
                //
                onResetFilters={handleResetFilters}
                //
                results={dataFiltered.length}
                sx={{ p: 2.5, pt: 0 }}
              />
            )} */}

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
                        <PiemailTableRow
                          key={row?.Dpt_ID}
                          row={row}
                          selected={table.selected.includes(row?.Dpt_ID)}
                          onEditRow={() => moveToEditForm(row)}
                          onViewRow={() => {
                            viewMail(row);
                          }}
                          onDeleteRow={() => {
                            DeleteDetailTableRow(row);
                          }}
                        />
                      ))}

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                    />

                    <TableNoData notFound={notFound} title="Please select PI No." />
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
        emailData={selectedRow}
      />
      {/*
      <EditDialog
        uploadClose={handleEditDialogClose}
        row={currentRowData}
        uploadOpen={editDialogOpen}
        tableData={tableData}
      /> */}
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
      (yarn) => yarn?.ProformaNo.toLowerCase().indexOf(name.toLowerCase()) !== -1
      // yarn?.Country_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
      // yarn?.City_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((supplier) => supplier.isActive === status);
  }

  if (role.length) {
    inputData = inputData.filter((yarn) => role.includes(yarn?.Country_Name));
  }

  return inputData;
}
