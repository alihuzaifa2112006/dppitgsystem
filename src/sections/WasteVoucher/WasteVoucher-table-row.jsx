import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function WasteVoucherTableRow({ row, onEditRow, onDeleteRow }) {
  const confirm = useBoolean();

  return (
    <>
      <TableRow hover>
        {/* Class Name */}
        <TableCell align="center" sx={{ minwidth: 220 }} >
          {row?.ClassName || '-'}
        </TableCell>

        {/* Category */}
        <TableCell align="center" sx={{ minWidth: 220 }} >
          {row?.Inv_Cat_Name || '-'}
        </TableCell>

        {/* Sub Category */}
        <TableCell align="center" sx={{ minWidth: 220 }} >
          {row?.ItemSubCategory || '-'}
        </TableCell>

        {/* Item Open */}
        <TableCell align="center" sx={{ minWidth: 380 }} >
          {row?.ItemOpen || '-'}
        </TableCell>

        {/* Line No */}
        <TableCell align="center" sx={{ minwidth: 220 }} >
          {row?.LineNo || '-'}
        </TableCell>

        {/* Quantity */}
        <TableCell align="center" sx={{ minwidth: 220 }} >
          {fNumber(row?.Qty || '-')}
        </TableCell>

        {/* UOM */}
        <TableCell align="center" sx={{ minwidth: 220 }} >
          {row?.UOMName || '-'}
        </TableCell>

        {/* Remarks */}
        <TableCell align="center" sx={{ minwidth: 220 }} >
          {row?.Remarks || '-'}
        </TableCell>

        {/* Actions */}
        <TableCell align="center" sx={{ minWidth: 120 }}  >
          {/* <IconButton onClick={onEditRow}>
            <Iconify icon="solar:pen-bold" />
          </IconButton> */}
          <IconButton onClick={confirm.onTrue}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

WasteVoucherTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  row: PropTypes.object,
};