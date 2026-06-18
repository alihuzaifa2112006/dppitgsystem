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

import SampleTableRow from '../sample-table-row';
import SampleTableToolbar from '../sample-toolbar';
import SampleTableFiltersResult from '../sample-filters-result';
import axios from 'axios';
import { alpha, Tab, Tabs } from '@mui/material';
import Label from 'src/components/label';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'Sample_Name', label: 'Sample Name', minWidth: 145 },
  { id: 'Sample_Code', label: 'Sample No.', minWidth: 145 },
  { id: 'WIC_Name', label: 'Customer', minWidth: 140 },
  { id: 'End_Cust_Name', label: 'Main Buyer', minWidth: 140 },
  // { id: 'OpportunityName', label: 'Opportunity', minWidth: 140 },
  { id: 'QuotationNo', label: 'Quotation No.', minWidth: 140 },
  // { id: 'ValidFrom', label: 'Valid From', minWidth: 140 },
  { id: 'Delivery_Date', label: 'Delivery Date', minWidth: 140 },
  { id: 'status', label: 'Approval status', align: 'center', minWidth: 140 },
  { id: 'ADM_Approved_Remarks', label: 'Approval Remarks', minWidth: 220 },
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
  { value: 'A', label: 'Approved' },
  { value: 'P', label: 'Pending' },
  { value: 'R', label: 'Rejected' },
  // { value: 'On Hold', label: 'On Hold' },
];

const getStatusColor = (stID) => {
  switch (stID) {
    case 'A':
      return 'success';
    case 'R':
      return 'error';
    case 'P':
      return 'warning';
    //   case 'Uploaded':
    //     return 'info';
    default:
      return 'default';
  }
};
// ----------------------------------------------------------------------

const getLeadTimeInDays = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate) || Number.isNaN(endDate)) return ''; // Handle invalid dates

  const diffTime = endDate - startDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default function SampleListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  const KgtoLbs = (kg) => {
    const lbs = kg * 2.20462;
    return lbs.toFixed(2);
  };

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const FetchSampleData = useCallback(async () => {
    try {
      const response = await Get(
        `getsamplereqList?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&RoleID=${userData?.userDetails?.roles[0]}&UserID=${userData?.userDetails?.userId}`
      );
      const updatedData = response.data.map((item) => ({
        ...item,
        CreatedDate: new Date(item.CreatedDate),
        Delivery_Date: new Date(item.Delivery_Date),
      }));

      const res = await Get(
        `getsamplereqListforProductionBorhanur?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&UserID=${userData?.userDetails?.userId}&DOCID=3`
      );

      let data = res.data || [];
      if (res.data.Data === null) {
        data = [];
      }
      // Add a column 'ToBeApproved' = 'Yes' if Sample_Code exists in data, otherwise 'No'
      const updatedDataWithToBeApproved = updatedData.map((item) => {
        const isMatching = data.some((resItem) => resItem.Sample_Code === item.Sample_Code);
        return {
          ...item,
          ToBeApproved: isMatching ? 'Yes' : 'No',
        };
      });
      setTableData(updatedDataWithToBeApproved);
    } catch (error) {
      console.log(error);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    userData?.userDetails?.userId,
    userData?.userDetails?.roles,
  ]);

  const FetchSampleExcelData = useCallback(async () => {
    try {
      const response = await Get(
        `samplerequestMstDtlForReport?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&RoleID=${userData?.userDetails?.roles[0]}&UserID=${userData?.userDetails?.userId}`
      );
      const updatedData = response.data.map((item) => ({
        Sample_Name: item.Sample_Name,
        Sample_Reference_No: item.Sample_Code,
        WIC_ID: item.WIC_ID,
        Customer_Name: item.WIC_Name,
        Main_Buyer: item.End_Cust_Name,
        Agent_Name: item.Agent_Name,
        Yarn_Type: item.Yarn_Type,
        Yarn_Count: item.Yarn_Count_Name,
        Color: item.ColorName,
        Color_Code: item.Color_Code,
        Product_Description: item.Product_Composed_Name,
        Unit: item.UOMName,
        Cost_Per_Unit_KG: item.Cost,
        Cost_Per_Unit_LBs: KgtoLbs(item.Cost),
        Sample_Quantity_KG: item.Quantity,
        Sample_Quantity_LBs: item.QtyInLBS,
        Total_Sample_Cost: item.TotalAmount,
        Sample_Type: item.SampleTypeName,
        Customer_Requested_Delivery_Date: item.Sample_Request_Date,
        Fabric_Type: item.Fabric_Types,
        Comments_From_Sales_Team: item.Remarks,
        Sample_Comments_From_PD_Team: item.DetailRemarks,
        Delivery_Status: item.Delivery_Status,
        Sample_Delivery_Date: item.Delivery_Date,
        Sample_Development_Lead_time: `${getLeadTimeInDays(
          item.Sample_Request_Date,
          item.Delivery_Date
        )} Days`,
        // Sample_Approval_Status_From_Customer_Side: item.Customer_Approved_Status,
      }));

      setExcelData(updatedData);
    } catch (error) {
      console.log(error);
    }
  }, [
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    userData?.userDetails?.userId,
    userData?.userDetails?.roles,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchSampleData(), FetchSampleExcelData()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchSampleData, FetchSampleExcelData]);

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
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Edit Functions
  const moveToEditForm = (e) => {
    navigate(paths.dashboard.transaction.sample.edit(e));
  };
  const moveToPDFView = (e) => {
    navigate(paths.dashboard.transaction.sample.pdf(e));
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
            heading="Sample Request"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              { name: 'Sample Request', href: paths.dashboard.transaction.sample.root },
              { name: 'List' },
            ]}
            action={
              <Button
                component={RouterLink}
                href={paths.dashboard.transaction.sample.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                color="primary"
              >
                Add Sample Request
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
                      {['A', 'R', 'P'].includes(tab.value)
                        ? tableData.filter((td) => td.ADM_Approve === tab.value).length
                        : tableData.length}
                    </Label>
                  }
                />
              ))}
            </Tabs>
            <SampleTableToolbar
              filters={filters}
              onFilters={handleFilters}
              // here is filter dropdown
              tableRef={tableComponentRef.current}
              exportData={excelData}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <SampleTableFiltersResult
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
                        <SampleTableRow
                          key={row?.Sample_Request_ID}
                          row={row}
                          selected={table.selected.includes(row?.Sample_Request_ID)}
                          onEditRow={() => moveToEditForm(row?.Sample_Request_ID)}
                          onViewRow={() => moveToPDFView(row?.Sample_Request_ID)}
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
        yarn?.Sample_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.Sample_Code.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        yarn?.End_Cust_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 
        // yarn?.WIC_Name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        // yarn?.ADM_Approved_Remarks.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        // yarn?.QuotationNo.toLowerCase().indexOf(name.toLowerCase()) !== -1
      // yarn?.ContractDate.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
      // yarn?.YarnCount.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((supplier) => supplier.ADM_Approve === status);
  }

  // if (role.length) {
  //   inputData = inputData.filter((yarn) => role.includes(yarn?.DepartmentName));
  // }

  return inputData;
}
