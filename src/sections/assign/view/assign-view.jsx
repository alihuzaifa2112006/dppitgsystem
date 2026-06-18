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

import AssignTableRow from '../assign-table-row';
import AssignTableToolbar from '../assign-toolbar';
import AssignTableFiltersResult from '../assign-filters-result';
import axios from 'axios';
import {
  alpha,
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Tab,
  TableCell,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
} from '@mui/material';
import Label from 'src/components/label';
import { APP_API_STORAGE } from 'src/config-global';
import { LoadingButton } from '@mui/lab';

// ----------------------------------------------------------------------

// const getColors = (priority) => {
//   switch (priority) {
//     case 'High':
//       return 'error';
//     case 'HIGH':
//       return 'error';
//     case 'Medium':
//       return 'info';
//     case 'Low':
//       return 'success';
//     default:
//       return 'default';
//   }
// };

// const TABLE_HEAD = [
//   // { id: 'ColHeaderName', label: 'Header Column Name', minWidth: 180 },
//   // { id: 'FormName', label: 'Form Name', minWidth: 180 },
//   // { id: 'Field_Type', label: 'Entity', minWidth: 140 },
//   { id: 'FormName', label: 'Form Name', align: 'left' },
//   { id: 'ItemName', label: 'Item Name', align: 'left' },
//   { id: 'Value', label: 'Value', align: 'left' },
//   { id: 'Date', label: 'Date', align: 'left' },
// ];
const TABLE_HEAD = [
  { id: 'FormName', label: 'Form Name', align: 'left', width: 200 },
  { id: 'ItemName', label: 'Item Name', align: 'left', width: 300 },
  { id: 'Value', label: 'Value', align: 'left', width: 200 },
  { id: 'Date', label: 'Date', align: 'left', width: 150 },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

const STATUS_OPTIONS = [
  // { value: 'all', label: 'All' },
  // { value: 'Low', label: 'Low' },
  // { value: 'Medium', label: 'Medium' },
  // { value: 'High', label: 'High' },
];

// ----------------------------------------------------------------------

export default function AssignListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [searchField, setSearchField] = useState(null);
  const [allformName, setallformName] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const dataFiltered = tableData || [];

  // const convertApiData = (apiData) => {
  //   const grouped = {};

  //   apiData.forEach(item => {
  //     const formKey = `${item.FormName}-${item.FormData_ID}`;
  //     if (!grouped[formKey]) {
  //       grouped[formKey] = {
  //         FormName: item.FormName,
  //         ItemName: '',
  //         Value: '',
  //         Date: '',
  //         Created_On: item.Created_On
  //       };
  //     }

  //     item.Fields.forEach(field => {
  //       const fieldType = field.Field_Type?.toLowerCase();
  //       if (fieldType === 'textbox') {
  //         grouped[formKey].ItemName += (grouped[formKey].ItemName ? ' / ' : '') + field.DataText;
  //       }
  //       if (fieldType?.includes('dropdown')) {
  //         grouped[formKey].Value += (grouped[formKey].Value ? ' / ' : '') + field.DataText;
  //       }
  //       if (fieldType?.includes('date')) {
  //         grouped[formKey].Date = new Date(field.DataText).toLocaleDateString('en-GB');
  //       }
  //     });
  //   });

  //   return Object.values(grouped);
  // };

  const convertApiData = (apiData) => {
    const grouped = {};

    apiData.forEach((item) => {
      const formKey = `${item.FormName}-${item.FormData_ID}`;
      if (!grouped[formKey]) {
        grouped[formKey] = {
          FormName: item.FormName,
          ItemName: '',
          Value: '',
          Date: '',
          Created_On: item.Created_On,
        };
      }

      item.Fields.forEach((field) => {
        const fieldType = field.Field_Type?.toLowerCase();

        if (fieldType === 'textbox') {
          grouped[formKey].ItemName += (grouped[formKey].ItemName ? ' / ' : '') + field.DataText;
        }
        if (fieldType?.includes('dropdown')) {
          grouped[formKey].Value += (grouped[formKey].Value ? ' / ' : '') + field.DataText;
        }
        if (fieldType?.includes('date')) {
          const dateObj = new Date(field.DataText);
          if (!Number.isNaN(dateObj.getTime())) {
            grouped[formKey].Date = dateObj.toLocaleDateString('en-GB');
          }
        }
      });
    });

    return Object.values(grouped);
  };

  const FetchAssignData = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllFormdDataView?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      const finalRows = convertApiData(response.data.data);
      setTableData(finalRows);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  const GetFormNameData = useCallback(async () => {
    try {
      const response = await Get(`GetAllFormNames`);

      setallformName(response.data.Data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  console.log('tableData', tableData);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchAssignData(), GetFormNameData()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchAssignData, GetFormNameData]);

  const { enqueueSnackbar } = useSnackbar();

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();
  // const dataFiltered = tableData;

  // const [filters, setFilters] = useState(defaultFilters);

  // const dataFiltered = applyFilter({
  //   inputData: tableData,
  //   comparator: getComparator(table.order, table.orderBy),
  //   filters,
  // });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;

  // const canReset = !isEqual(defaultFilters, filters);

  // const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  // const handleFilters = useCallback(
  //   (name, value) => {
  //     table.onResetPage();
  //     setFilters((prevState) => ({
  //       ...prevState,
  //       [name]: value,
  //     }));
  //   },
  //   [table]
  // );

  // const handleFilterStatus = useCallback(
  //   (event, newValue) => {
  //     table.onResetPage();
  //     setFilters((prevState) => ({
  //       ...prevState,
  //       status: newValue,
  //     }));
  //   },
  //   [table]
  // );

  // const handleResetFilters = useCallback(() => {
  //   setFilters(defaultFilters);
  // }, []);

  // Edit Functions
  const moveToEditForm = (e) => {
    navigate(paths.dashboard.transaction.Assign.edit(e));
  };
  // Approval Functions
  const moveToApprovalForm = (e) => {
    navigate(paths.dashboard.transaction.Assign.approval(e));
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
            heading="Assign View"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              { name: 'Assgin View', href: paths.dashboard.InventoryManagement.Assign.root },
              // { name: 'List' },
            ]}
            action={
              <Button
                component={RouterLink}
                href={paths.dashboard.InventoryManagement.Assign.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                color="primary"
              >
                Add Assgin View
              </Button>
            }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <Card>
            {/* <AssignTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <AssignTableFiltersResult
                filters={filters}
                onFilters={handleFilters}
                //
                onResetFilters={handleResetFilters}
                //
                results={dataFiltered.length}
                sx={{ p: 2.5, pt: 0 }}
              />
            )} */}
            <Stack
              spacing={2}
              alignItems={{ xs: 'flex-end', md: 'center' }}
              direction={{
                xs: 'column',
                md: 'row',
              }}
              sx={{
                p: 2.5,
                pr: { xs: 2.5, md: 1 },
              }}
            >
              <Autocomplete
                options={allformName}
                fullWidth
                value={searchField}
                onChange={(event, newValue) => setSearchField(newValue)}
                getOptionLabel={(option) => option?.FormName || ''}
                isOptionEqualToValue={(option, value) => option.FormID === value.FormID}
                renderInput={(params) => (
                  <TextField {...params} label="Form Name" placeholder="Choose an option" />
                )}
              />
              <LoadingButton
                variant="contained"
                color="primary"
                // onClick={ }
                loading={isSearching}
              >
                Search
              </LoadingButton>
            </Stack>
            {/* <TableContainer  sx={{ position: 'relative', overflow: 'auto' }}>
              <TableSelectedAction dense={table.dense} rowCount={dataFiltered.length} />

              <Scrollbar>
                <Table
                 ref={tableComponentRef}
  size={table.dense ? 'small' : 'medium'}
  sx={{
    minWidth: 560,
    tableLayout: 'fixed', // **IMPORTANT**
  }}
                >
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={dataFiltered.length}
                    onSort={table.onSort}
                  />

                  <TableBody>
                    <TableBody>
                      {dataFiltered
                        .slice(
                          table.page * table.rowsPerPage,
                          table.page * table.rowsPerPage + table.rowsPerPage
                        )
                        .map((row, id) => (
                          <AssignTableRow
                            key={id}
                            row={row}
                            selected={false} 
                            onEditRow={() => moveToEditForm(row?.FormData_ID)} 
                          />
                        ))}
                    </TableBody>

                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                    />
                    {/* 
                    <TableNoData notFound={notFound} /> */}
                  {/* </TableBody>
                </Table>
              </Scrollbar> */}
            {/* </TableContainer> */} 

            <TableContainer sx={{ position: 'relative', overflow: 'auto', width: '100%' }}>
  <Scrollbar>
    <Table 
      size={table.dense ? 'small' : 'medium'}
      sx={{ 
        tableLayout: 'fixed', // This is crucial
        width: '100%'
      }}
    >
      {/* Define explicit column widths */}
      <colgroup>
        <col style={{ width: '20%' }} /> {/* FormName */}
        <col style={{ width: '40%' }} /> {/* ItemName - more space */}
        <col style={{ width: '20%' }} /> {/* Value */}
        <col style={{ width: '20%' }} /> {/* Date */}
      </colgroup>
      
      <TableHeadCustom
        order={table.order}
        orderBy={table.orderBy}
        headLabel={TABLE_HEAD}
        rowCount={dataFiltered.length}
        onSort={table.onSort}
      />

      <TableBody>
        {dataFiltered.slice(
          table.page * table.rowsPerPage,
          table.page * table.rowsPerPage + table.rowsPerPage
        ).map((row, id) => (
          <TableRow hover key={id}>
            {/* FormName */}
            <TableCell sx={{ 
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {row.FormName || '-'}
            </TableCell>

            {/* ItemName - with text truncation and tooltip */}
            <Tooltip title={row.ItemName || ''} enterDelay={500}>
              <TableCell sx={{ 
                maxWidth: 0, // Important for truncation
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {row.ItemName || '-'}
              </TableCell>
            </Tooltip>

            {/* Value */}
            <TableCell sx={{ 
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {row.Value || '-'}
            </TableCell>

            {/* Date */}
            <TableCell sx={{ whiteSpace: 'nowrap' }}>
              {row.Date || '-'}
            </TableCell>
          </TableRow>
        ))}

        <TableEmptyRows
          height={denseHeight}
          emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
        />
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

// function applyFilter({ inputData, comparator, filters }) {
//   const { name, status, role } = filters;

//   const stabilizedThis = inputData.map((el, index) => [el, index]);

//   stabilizedThis.sort((a, b) => {
//     const order = comparator(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });

//   inputData = stabilizedThis.map((el) => el[0]);

//   if (name) {
//     inputData = inputData.filter(
//       (yarn) =>
//         yarn?.DONumber.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
//         yarn?.PINo.toLowerCase().indexOf(name.toLowerCase()) !== -1
//     );
//   }

//   if (status !== 'all') {
//     inputData = inputData.filter((supplier) => supplier.Priority === status);
//   }

//   // if (role.length) {
//   //   inputData = inputData.filter((yarn) => role.includes(yarn?.DepartmentName));
//   // }

//   return inputData;
// }
