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

export default function ProductionReportTableRow({ row, selected, onEditRow, onDeleteRow }) {
  const { EmployeeName, BagDetails, TotalBags } = row;

  const confirm = useBoolean();

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell align="center">{EmployeeName || '-'}</TableCell>

        <TableCell align="center">{TotalBags ?? '-'}</TableCell>

        <TableCell align="center">{BagDetails ?? '-'}</TableCell>

        <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton onClick={onEditRow} size="small" sx={{ p: 0.5 }}>
            <Iconify icon="solar:pen-bold" width={18} />
          </IconButton>
          <IconButton onClick={confirm.onTrue} size="small" sx={{ p: 0.5, ml: 0.5 }}>
            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
          </IconButton>
        </TableCell>

        {/* ðŸ”¥ The footer cell code was removed from here. ðŸ”¥ */}
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

ProductionReportTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
