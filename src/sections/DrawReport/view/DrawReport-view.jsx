
// import PropTypes from 'prop-types';
// import isEqual from 'lodash/isEqual';
// import { useState, useCallback, useEffect, useRef ,useMemo} from 'react';
// import { useNavigate } from 'react-router';

// import Card from '@mui/material/Card';
// import Table from '@mui/material/Table';
// import Button from '@mui/material/Button';
// import Container from '@mui/material/Container';
// import TableBody from '@mui/material/TableBody';
// import TableContainer from '@mui/material/TableContainer';
// import Box from '@mui/material/Box';

// import { paths } from 'src/routes/paths';
// import { useRouter } from 'src/routes/hooks';
// import { RouterLink } from 'src/routes/components';
// import { useBoolean } from 'src/hooks/use-boolean';
// import { Delete, Get } from 'src/api/apibasemethods';

// import { LoadingScreen } from 'src/components/loading-screen';
// import Iconify from 'src/components/iconify';
// import Scrollbar from 'src/components/scrollbar';
// import { useSnackbar } from 'src/components/snackbar';
// import { useSettingsContext } from 'src/components/settings';
// import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// import {
//   useTable,
//   emptyRows,
//   TableNoData,
//   getComparator,
//   TableEmptyRows,
//   TableHeadCustom,
//   TableSelectedAction,
//   TablePaginationCustom,
// } from 'src/components/table';

// import DrawReportTableRow from '../DrawReport-table-row';
// import DrawReportTableToolbar from '../DrawReport-toolbar';
// import DrawReportTableFiltersResult from '../DrawReport-filters-result';

// // ----------------------------------------------------------------------

// const TABLE_HEAD = [
//   { id: 'ReportDate', label: 'Report Date', minWidth: 120 },
//   { id: 'Supervisor', label: 'Supervisor', minWidth: 180 },
//   { id: 'Shift', label: 'Shift', minWidth: 120 },
//   { id: 'Material', label: 'Material', minWidth: 150 },
//   { id: 'ChallanNo', label: 'Challan No', minWidth: 120 },
//   { id: 'TotalBags', label: 'Total Bags', minWidth: 100, align: 'right' },
//   { id: 'TotalWeight', label: 'Total Weight (KG)', minWidth: 120, align: 'right' },
//   { id: 'Status', label: 'Status', minWidth: 100 },
//   { id: '', label: '', width: 88, align: 'center' },
// ];

// const defaultFilters = {
//   name: '',
//   status: 'all',
// };

// // ----------------------------------------------------------------------

// export default function DrawReportListView() {
//   const navigate = useNavigate();
//   const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
//   const tableComponentRef = useRef();
//   const [tableData, setTableData] = useState([]);
//   const [isLoading, setLoading] = useState(true);

//   const FetchDrawReportData = useCallback(async () => {
//     try {
//       const response = await Get(
//         `GetAllSortingReports?Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
//       );
      
//       // Format the data for display
//       const formattedData = response.data.Data.map(report => ({
//         ...report,
//         ReportDate: formatDate(report.ReportDate),
//         Supervisor: getSupervisorName(report.SupervisorID),
//         Shift: getShiftName(report.WorkerShiftID),
//         Material: getMaterialName(report.MaterialID),
//         TotalBags: calculateTotalBags(report.Workers),
//         Status: report.IsApproved ? 'Approved' : 'Pending',
//         TotalWeight: report.TotalWeight_KG.toFixed(2)
//       }));
      
//       setTableData(formattedData);
//     } catch (error) {
//       console.error(error);
//       enqueueSnackbar('Error fetching production reports', { variant: 'error' });
//     }
//   }, [userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

//   // Helper functions
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
//   };

//   const getSupervisorName = (supervisorId) => {
//     // You would need to fetch supervisor names from your API
//     // This is a placeholder - implement based on your data
//     return `Supervisor ${supervisorId}`;
//   };

//   const getShiftName = (shiftId) => {
//     const shifts = {
//       1: 'Morning',
//       2: 'Afternoon',
//       3: 'Evening',
//       4: 'Night'
//     };
//     return shifts[shiftId] || 'Unknown';
//   };

//   const getMaterialName = (materialId) => {
//     // You would need to fetch material names from your API
//     // This is a placeholder - implement based on your data
//     return `Material ${materialId}`;
//   };

//   const calculateTotalBags = (workers) => {
//     return workers.reduce((total, worker) => total + (worker.TotalBag || 0), 0);
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       await FetchDrawReportData();
//       setLoading(false);
//     };
//     fetchData();
//   }, [FetchDrawReportData]);

//   const { enqueueSnackbar } = useSnackbar();
//   const table = useTable();
//   const settings = useSettingsContext();
//   const router = useRouter();
//   const confirm = useBoolean();
//   const [filters, setFilters] = useState(defaultFilters);

//   const dataFiltered = applyFilter({
//     inputData: tableData,
//     comparator: getComparator(table.order, table.orderBy),
//     filters,
//   });

//   const dataInPage = dataFiltered.slice(
//     table.page * table.rowsPerPage,
//     table.page * table.rowsPerPage + table.rowsPerPage
//   );

//   const denseHeight = table.dense ? 56 : 56 + 20;
//   const canReset = !isEqual(defaultFilters, filters);
//   const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

//   const handleFilters = useCallback(
//     (name, value) => {
//       table.onResetPage();
//       setFilters((prevState) => ({
//         ...prevState,
//         [name]: value,
//       }));
//     },
//     [table]
//   );

//   const handleResetFilters = useCallback(() => {
//     setFilters(defaultFilters);
//   }, []);

//   const handleDeleteRow = async (id) => {
//     try {
//       await Delete(`DeleteSortingReport/${id}/${userData?.userDetails?.userId}`);
//       enqueueSnackbar('Deleted successfully', { variant: 'success' });
//       FetchDrawReportData();
//     } catch (error) {
//       console.error('Error deleting report:', error);
//       enqueueSnackbar('Error deleting report', { variant: 'error' });
//     }
//   };

//   const renderLoading = (
//     <LoadingScreen
//       sx={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         height: '70vh',
//       }}
//     />
//   );

//   return (
//     <>
//       {isLoading ? (
//         renderLoading
//       ) : (
//         <Container maxWidth={settings.themeStretch ? false : 'lg'}>
//           <CustomBreadcrumbs
//             heading="Sorting Delay Reports"
//             links={[
//               { name: 'Home', href: paths.dashboard.root },
//               {
//                 name: 'Production',
//                 href: paths.dashboard.Production.DrawReport.root,
//               },
//               { name: 'Sorting Delay Reports' },
//             ]}
//             action={
//               <Button
//                 component={RouterLink}
//                 href={paths.dashboard.Production.DrawReport.new}
//                 variant="contained"
//                 startIcon={<Iconify icon="mingcute:add-line" />}
//                 color="primary"
//               >
//                 New Report
//               </Button>
//             }
//           />

//           <Card>
//             <DrawReportTableToolbar
//               filters={filters}
//               onFilters={handleFilters}
//               tableRef={tableComponentRef.current}
//               tableHead={TABLE_HEAD}
//               exportData={dataFiltered}
//             />

//             {canReset && (
//               <DrawReportTableFiltersResult
//                 filters={filters}
//                 onFilters={handleFilters}
//                 onResetFilters={handleResetFilters}
//                 results={dataFiltered.length}
//                 sx={{ p: 2.5, pt: 0 }}
//               />
//             )}

//             <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
//               <TableSelectedAction dense={table.dense} rowCount={dataFiltered.length} />

//               <Scrollbar>
//                 <Table
//                   ref={tableComponentRef}
//                   size={table.dense ? 'small' : 'medium'}
//                   sx={{ minWidth: 960 }}
//                 >
//                   <TableHeadCustom
//                     order={table.order}
//                     orderBy={table.orderBy}
//                     headLabel={TABLE_HEAD}
//                     rowCount={dataFiltered.length}
//                     onSort={table.onSort}
//                   />

//                   <TableBody>
//                     {dataFiltered
//                       .slice(
//                         table.page * table.rowsPerPage,
//                         table.page * table.rowsPerPage + table.rowsPerPage
//                       )
//                       .map((row) => (
//                         <DrawReportTableRow
//                           key={row.ReportID}
//                           row={row}
//                           selected={table.selected.includes(row.ReportID)}
//                           onDeleteRow={() => handleDeleteRow(row.ReportID)}
//                         />
//                       ))}

//                     <TableEmptyRows
//                       height={denseHeight}
//                       emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
//                     />

//                     <TableNoData notFound={notFound} />
//                   </TableBody>
//                 </Table>
//               </Scrollbar>
//             </TableContainer>

//             <TablePaginationCustom
//               count={dataFiltered.length}
//               page={table.page}
//               rowsPerPage={table.rowsPerPage}
//               onPageChange={table.onChangePage}
//               onRowsPerPageChange={table.onChangeRowsPerPage}
//               dense={table.dense}
//               onChangeDense={table.onChangeDense}
//             />
//           </Card>
//         </Container>
//       )}
//     </>
//   );
// }

// function applyFilter({ inputData, comparator, filters }) {
//   const { name } = filters;

//   const stabilizedThis = inputData.map((el, index) => [el, index]);

//   stabilizedThis.sort((a, b) => {
//     const order = comparator(a[0], b[0]);
//     if (order !== 0) return order;
//     return a[1] - b[1];
//   });

//   inputData = stabilizedThis.map((el) => el[0]);

//   if (name) {
//     inputData = inputData.filter(
//       (report) =>
//         report.ChallanNo.toLowerCase().includes(name.toLowerCase()) ||
//         report.Supervisor.toLowerCase().includes(name.toLowerCase()) ||
//         report.Material.toLowerCase().includes(name.toLowerCase())
//     );
//   }

//   return inputData;
// }