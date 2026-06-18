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
import { enqueueSnackbar, useSnackbar } from 'src/components/snackbar';
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

import ItemRequisitionTableRow from '../ItemRequisition-table-row';
import ItemRequisitionTableToolbar from '../ItemRequisition-toolbar';
import ItemRequisitionTableFiltersResult from '../ItemRequisition-filters-result';
import axios from 'axios';
import { alpha, Tab, Tabs } from '@mui/material';
import Label from 'src/components/label';
import { APP_API_STORAGE } from 'src/config-global';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'Material_Code', label: 'Recieve Order', minWidth: 180 },
  { id: 'ClassName', label: 'Order Recieve', minWidth: 180 },
  { id: 'CategoryName', label: 'Purchase Order', minWidth: 180 },
  { id: 'SubCategoryName', label: 'Item Type', minWidth: 220 },
  { id: 'MaterialTypeName', label: 'Category', minWidth: 220 },
  { id: 'Specification', label: 'Item Name', minWidth: 200 },
  { id: 'SourceName', label: 'Unit', minWidth: 140 },
  { id: 'Origin_Name', label: 'PO Quantity', minWidth: 140 },
  { id: 'Color_and_Code', label: 'Color Code', minWidth: 140 },
  { id: 'UOM', label: 'Unit of Measurement', minWidth: 140 },
  { id: 'OpeningStockQuantity', label: 'Opening Stock Qty', minWidth: 200, align:"right" },

  
  { id: 'ReorderQuantity', label: 'Reorder Qty', minWidth: 140, align:"right" },
  { id: 'AveragePrice', label: 'Average Price', minWidth: 140, align:"right" },
  { id: 'SaftyQuantity', label: 'Safety Quantity', minWidth: 140, align:"right" },
  { id: 'Value', label: 'Value', minWidth: 140, align:"right" },
  { id: 'CurrencyName', label: 'Currency', minWidth: 140 },

  //  Value
  // { id: 'Action', label: 'Action', width: 88, align: 'center' },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// const DeleteTableRow = async (rowID, rowToDelete) => {
//   try {
//     await Put(`mapi/Delete_Bit_InspectionMstFormat2Data?InspectionMstID=${rowID}`).then((res) => {
//       enqueueSnackbar('Delete success!');
//       // Delete from the current array as well
//       const updatedData = tableData.filter(row => row !== rowToDelete);
//        setTableData(updatedData);
//     });

//   } catch (error) {
//     console.log(error);
//   }
// };

// ----------------------------------------------------------------------

export default function ItemRequisitionListView() {
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Table component Ref
  const tableComponentRef = useRef();

  // Fetching data:
  const [tableData, setTableData] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const FetchItemRequisitionData = useCallback(async () => {
    try {
      const response = await Get(
        `GetAllInvItemRequisitioning?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      setTableData(response.data.data);
    } catch (error) {
      console.log(error);
    }
  }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);


  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchItemRequisitionData()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchItemRequisitionData]);

  // const { enqueueSnackbar } = useSnackbar();

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
    navigate(paths.dashboard.InventoryManagement.ItemRequisition.edit(e));
  };
  // Approval Functions
  const moveToApprovalForm = (e) => {
    navigate(paths.dashboard.InventoryManagement.ItemRequisition.approval(e));
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
            heading="Item Requisition"
            links={[
              { name: 'Home', href: paths.dashboard.root },
              { name: 'Item Requisition', href: paths.dashboard.InventoryManagement.ItemRequisition.root },
              { name: 'List' },
            ]}
            action={
              <Button
                component={RouterLink}
                href={paths.dashboard.InventoryManagement.ItemRequisition.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                color="primary"
              >
                Add Item Request 
              </Button>
            }
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <Card>
            <ItemRequisitionTableToolbar
              filters={filters}
              onFilters={handleFilters}
              tableRef={tableComponentRef.current}
              exportData={dataFiltered}
              tableHead={TABLE_HEAD}
            />

            {canReset && (
              <ItemRequisitionTableFiltersResult
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
                      .map((row, id) => (
                        <ItemRequisitionTableRow
                          key={id}
                          row={row}
                          selected={table.selected.includes(id.ItemID)}
                          onEditRow={() => moveToEditForm(row?.ItemID)}
                          onApprovalRow={() => moveToApprovalForm(row?.ItemID)}
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
  const { name, status } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
  const search = name.toLowerCase();

  inputData = inputData.filter((item) => {
    const valuesToSearch = [
      item?.Material_Code,
      item?.ClassName,
      item?.CategoryName,
      item?.SubCategoryName,
      item?.MaterialTypeName,
      item?.Specification,
      item?.SourceName,
      item?.Origin_Name,
      item?.UOM,
      item?.Color_and_Code,
      item?.CurrencyName,
      item?.OpeningStockQuantity,
      item?.ReorderQuantity,
      item?.Average_Price,
      item?.SaftyQuantity,
      item?.Value,
    ];

    return valuesToSearch.some((val) =>
      String(val || '').toLowerCase().includes(search)
    );
  });
}

  // if (name) {
  //   inputData = inputData.filter(
  //     (yarn) =>

  //       yarn?.CategoryName?.toLowerCase().includes(name.toLowerCase()) ||
  //     String(yarn?.ClassID)?.toLowerCase().includes(name.toLowerCase())
  //       // Inv_Cat_Name
  //       // yarn?.CategoryName.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
  //       // yarn?.ClassID.toLowerCase().indexOf(name.toLowerCase()) !== -1
  //   );
  // }

  if (status !== 'all') {
    inputData = inputData.filter((supplier) => supplier.Priority === status);
  }

  // if (role.length) {
  //   inputData = inputData.filter((yarn) => role.includes(yarn?.DepartmentName));
  // }

  return inputData;
}


