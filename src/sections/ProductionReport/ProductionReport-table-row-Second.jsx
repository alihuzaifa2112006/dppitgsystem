import { useMemo } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { Button } from '@mui/material';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { fNumber } from 'src/utils/format-number';

export default function ProductionReportSecondTable({ row, selected, onDeleteRow }) {
  const { WasteType, ItemOpen, RejectedQty, UOMName } = row;

  const confirm = useBoolean();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell align="center">{WasteType || '-'}</TableCell>

        <TableCell align="center">{ItemOpen.ItemDescription ?? '-'}</TableCell>

        <TableCell align="right">
          {fNumber(RejectedQty ?? '-')} {ItemOpen?.UOMName}
        </TableCell>

        <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {/* <IconButton onClick={onEditRow} size="small" sx={{ p: 0.5 }}>
            <Iconify icon="solar:pen-bold" width={18} />
          </IconButton> */}
          <IconButton onClick={confirm.onTrue} size="small" sx={{ p: 0.5, ml: 0.5 }}>
            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
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

ProductionReportSecondTable.propTypes = {
  onDeleteRow: PropTypes.func,
  // onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
