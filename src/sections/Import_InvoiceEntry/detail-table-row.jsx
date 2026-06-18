import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { fCurrency, fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function DetailTableRow({ row, selected, onDeleteRow, onEditRow, currentData, fromApproval, isPO }) {
  const {
    ItemCategory,
    SubCategory,
    ItemName,
    ItemDescription,
    UOM,
    POQty,
    PIQty,
    Rate,
    Amount
  } = row;

  const confirm = useBoolean();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ minWidth: 120 }}>{ItemCategory?.Inv_Cat_Name || '-'}</TableCell>
        <TableCell sx={{ minWidth: 120 }}>{SubCategory?.SubCat_Name || '-'}</TableCell>
        <TableCell sx={{ minWidth: 120 }}>{ItemName?.ItemSpec_Name || ItemName?.ItemName || '-'}</TableCell>
        <TableCell sx={{ minWidth: 200 }}>{ItemDescription || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center', minWidth: 80 }}>
          {UOM?.UOMName || '-'}
        </TableCell>
        {isPO ? (
          <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center', minWidth: 100 }}>
            {fNumber(POQty) || '-'}
          </TableCell>
        ) : (
          <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center', minWidth: 100 }}>
            {fNumber(PIQty) || '-'}
          </TableCell>
        )}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center', minWidth: 100 }}>
          {fNumber(Rate) || '-'}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center', minWidth: 120 }}>
          {fNumber(Amount) || '-'}
        </TableCell>

        {!fromApproval && (
          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
            <IconButton
              onClick={() => {
                onEditRow();
              }}
            >
              <Iconify icon="solar:pen-bold" />
            </IconButton>
            <IconButton
              color="error"
              disabled={!!currentData}
              onClick={() => {
                confirm.onTrue();
              }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </TableCell>
        )}

        {fromApproval && (
          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
            <IconButton
              onClick={() => {
                onEditRow();
              }}
            >
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </TableCell>
        )}
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

DetailTableRow.propTypes = {
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  currentData: PropTypes.object,
  fromApproval: PropTypes.bool,
  isPO: PropTypes.bool,
};
