import { useMemo } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { Button } from '@mui/material';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';

// ----------------------------------------------------------------------

export default function TransferVoucherTableRow({ row, selected, onEditRow, onDeleteRow }) {
  const {
    ItemName,
    ShiftName,
    MachineID,
    TransferModeName,
    // DepartmentName,
    VoucherQty,
    // MachineName,
    Remarks,
    Qty,
    UOMName,
    StoreName,
  } = row;

  const confirm = useBoolean();

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  };

  return (
    <>
      <TableRow hover selected={selected}>
        {/* Shift */}
        <TableCell align="center">{ItemName || '-'}</TableCell>

        <TableCell align="center">{TransferModeName || '-'}</TableCell>
        <TableCell align="center">{StoreName || '-'}</TableCell>
        <TableCell align="center">{VoucherQty || '-'}</TableCell>
        <TableCell align="center">{Qty || '-'}</TableCell>
        <TableCell align="center">{UOMName || '-'}</TableCell>
        <TableCell align="center">{Remarks || '-'}</TableCell>

        {/* Actions */}
        <TableCell align="center" sx={{ px: 1 }}>
          <IconButton onClick={onEditRow}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          <IconButton onClick={confirm.onTrue}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
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

TransferVoucherTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
