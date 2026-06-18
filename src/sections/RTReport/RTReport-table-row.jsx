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

export default function RTReportTableRow({ row, selected, onEditRow, onDeleteRow }) {
  const {
    MCRunning,
    ProductionHR,
    ShiftName,
    ColorID,
    ColorName,
    Challan,
    Line,
    TBale,
    TotalWeight,
    DustWeight,
  } = row;

  const confirm = useBoolean();

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
          {ShiftName?.ShiftName || '-'}
        </TableCell>
        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
          {ColorName || '-'}
        </TableCell>
        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
          {Challan || '-'}
        </TableCell>
        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
          {Line || '-'}
        </TableCell>
        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
          {fNumber(TBale) || '-'}
        </TableCell>
        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
          {fNumber(TotalWeight) || '-'}
        </TableCell>
        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
          {fNumber(MCRunning) || '-'}
        </TableCell>
        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
          {fNumber(ProductionHR) || '-'}
        </TableCell>
        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
          {fNumber(DustWeight) || '-'}
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton onClick={onEditRow} size="small" sx={{ p: 0.5 }}>
            <Iconify icon="solar:pen-bold" width={18} />
          </IconButton>
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

RTReportTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
