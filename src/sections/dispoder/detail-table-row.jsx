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

export default function DetailTableRow({ row, selected, onDeleteRow, onEditRow }) {
  const { PIID, ItemCode, Color, DOQuantity, PIQuantity, LotNo, LotLabel , DODate, Remarks } = row;

  const confirm = useBoolean();

  return (
    <>
      <TableRow hover selected={selected}>
      <TableCell sx={{ minWidth: 120 }} align="center">{PIID?.PINo || ''}</TableCell>

        <TableCell sx={{ minWidth: 120 }} align="center">{ItemCode?.YarnDescription}</TableCell>
       
        <TableCell sx={{ minWidth: 120 }} align="center">{Color?.ColorName || ''}</TableCell>
         
        <TableCell sx={{ minWidth: 120,  } } align="center">
          {fNumber(PIQuantity)}
          
          </TableCell>
        <TableCell sx={{ minWidth: 120 , textAlign: "center" }}>{fNumber(DOQuantity)}</TableCell>
       
       
<TableCell sx={{ minWidth: 120 , textAlign: "center" }}>{row.LotLabel}</TableCell>
<TableCell sx={{ minWidth: 120, textAlign: "center" }}>
  {row.Remarks || ''}
</TableCell>

       
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
              onClick={() => {
                confirm.onTrue();
              }}
            >
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

DetailTableRow.propTypes = {
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
