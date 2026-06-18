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

export default function DetailTableRow({ row, selected, onDeleteRow, onEditRow, currentData, fromApproval }) {
  const { Requirement, Description, Product, Quantity, Unit_Price, UOM, Remarks } = row;

  const confirm = useBoolean();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ minWidth: 240 }}>{Description}</TableCell>
        <TableCell sx={{ minWidth: 240 }}>{Remarks || '-'}</TableCell>
        {/* <TableCell sx={{ minWidth: 200 }}>{Product?.Product_Name}</TableCell> */}

        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {`${fNumber(Quantity)} ${UOM?.UOMName}`}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {`${fCurrency(Unit_Price)} / ${UOM?.UOMName}`}
        </TableCell>
        {/* <TableCell sx={{ minWidth: 240 }}>{Remarks || '-'}</TableCell> */}

        {fromApproval && (
          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
            {row?.Product && (
            <IconButton
              onClick={() => {
                onEditRow();
              }}
            >
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          )}
            {/* <IconButton
              color="error"
              disabled={!!currentData}
              onClick={() => {
                confirm.onTrue();
              }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton> */}
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
};
