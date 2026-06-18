// import { useMemo } from 'react';
// import PropTypes from 'prop-types';

// import TableRow from '@mui/material/TableRow';
// import TableCell from '@mui/material/TableCell';
// import IconButton from '@mui/material/IconButton';
// import Box from '@mui/material/Box';
// import { Button } from '@mui/material';

// import Iconify from 'src/components/iconify';
// import { ConfirmDialog } from 'src/components/custom-dialog';
// import { useBoolean } from 'src/hooks/use-boolean';
// import { fNumber } from 'src/utils/format-number';

// export default function DrawReportTableRow({ row, selected, onEditRow, onDeleteRow }) {
//   const {
//     MCRunning,
//     ProductionHR,
//     ShiftName,
   
//     Droppings,
//     DroppingsPercentage,
//     Challan,
//     Line,
//     TBale,
//     TotalWeight,
//     DustWeight,
//     DustPercentage,
//     UOMName,
//     SortedClassID,
//     SortedCategory,
//     SortedSubCategory,
//     SortedColor,
//     SortedInvSpare,
//     SortedItemOpen,
//   } = row;

//   const confirm = useBoolean();

//   const formatDate = (date) => {
//     if (!date) return '-';
//     const d = new Date(date);
//     const day = String(d.getDate()).padStart(2, '0');
//     const month = String(d.getMonth() + 1).padStart(2, '0');
//     const year = d.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   return (
//     <>
//       <TableRow hover selected={selected}>
//         <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
//           {Challan || '-'}
//         </TableCell>
//         <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
//           {ShiftName?.ShiftName || '-'}
//         </TableCell>
       
//         <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
//           {Line || '-'}
//         </TableCell>
//         <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
//           {SortedClassID?.ClassName || '-'}
//         </TableCell>
//         <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
//           {SortedCategory?.Inv_Cat_Name || SortedCategory?.CategoryName || '-'}
//         </TableCell>
//         <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
//           {SortedSubCategory?.SubCat_Name || '-'}
//         </TableCell>
//         <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
//           {SortedColor?.Color_and_Code || SortedInvSpare?.SpareNameAndNo || '-'}
//         </TableCell>
//         <TableCell align="center" sx={{ whiteSpace: 'nowrap', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
//           {SortedItemOpen?.CodeAndDescription || SortedItemOpen?.ItemDescription || '-'}
//         </TableCell>
//         <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
//           {TBale ? `${fNumber(TBale)} ${UOMName || ''}` : '-'}
//         </TableCell>
//         <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
//           {TotalWeight ? `${fNumber(TotalWeight)} ${UOMName || ''}` : '-'}
//         </TableCell>
//         <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
//           {MCRunning ? `${fNumber(MCRunning)} ${UOMName || ''}` : '-'}
//         </TableCell>
//         <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
//           {ProductionHR ? `${fNumber(ProductionHR)} ${UOMName || ''}` : '-'}
//         </TableCell>
//         <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
//           {DustWeight ? `${fNumber(DustWeight)} ${UOMName || ''}` : '-'}
//         </TableCell>
//         <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
//           {DustPercentage ? `${fNumber(DustPercentage)}%` : '-'}
//         </TableCell>
//         <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
//           {Droppings ? `${fNumber(Droppings)} ${UOMName || ''}` : '-'}
//         </TableCell>
//         <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
//           {DroppingsPercentage ? `${fNumber(DroppingsPercentage)}%` : '-'}
//         </TableCell>
//         <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
//           {/* <IconButton onClick={onEditRow} size="small" sx={{ p: 0.5 }}>
//             <Iconify icon="solar:pen-bold" width={18} />
//           </IconButton> */}
//           <IconButton 
//             onClick={confirm.onTrue} 
//             size="small" 
//             sx={{ 
//               p: 0.5, 
//               ml: 0.5,
//               color: 'error.main',
//               '&:hover': {
//                 backgroundColor: 'error.lighter',
//                 color: 'error.dark',
//               }
//             }}
//           >
//             <Iconify icon="solar:trash-bin-trash-bold" width={18} />
//           </IconButton>
//         </TableCell>
//       </TableRow>

//       <ConfirmDialog
//         open={confirm.value}
//         onClose={confirm.onFalse}
//         title="Delete"
//         content="Are you sure want to delete?"
//         action={
//           <Button
//             variant="contained"
//             color="error"
//             onClick={() => {
//               onDeleteRow();
//               confirm.onFalse();
//             }}
//           >
//             Delete
//           </Button>
//         }
//       />
//     </>
//   );
// }

// DrawReportTableRow.propTypes = {
//   onDeleteRow: PropTypes.func,
//   onEditRow: PropTypes.func,
//   row: PropTypes.object,
//   selected: PropTypes.bool,
// };
