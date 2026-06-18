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

export default function ProductVoucherTableRow({ row, selected, onEditRow, onDeleteRow }) {
  const { ClassID, Inv_Cat_Name, ItemSubCategory, Color, ItemOpen, UOMID, RQ, Remarks } = row;

  const confirm = useBoolean();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell align="center">{ClassID?.ClassName || '-'}</TableCell>

        <TableCell align="center">{Inv_Cat_Name?.Inv_Cat_Name || '-'}</TableCell>

        <TableCell align="center">{ItemSubCategory?.SubCat_Name || '-'}</TableCell>
        <TableCell align="center">{Color?.Color_and_Code || '-'}</TableCell>

        <TableCell align="center">{ItemOpen?.CodeAndDescription || '-'}</TableCell>

        <TableCell align="center">{RQ || '-'}</TableCell>

        <TableCell align="center">{UOMID?.UOMName || '-'}</TableCell>

        <TableCell align="center">{Remarks || '-'}</TableCell>

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
        content="Are you sure you want to delete this item?"
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

ProductVoucherTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
