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
  const {  ColHeadName, FormName , ColNo,  entity } = row;

  const confirm = useBoolean();

  return (
    <>
      <TableRow hover selected={selected}>
      <TableCell sx={{ minWidth: 120 }} align="center">{ColNo}</TableCell>

        <TableCell sx={{ minWidth: 120 }} align="center">{ColHeadName}</TableCell>
       
        <TableCell sx={{ minWidth: 120 }} align="center">{FormName?.FormName || ''}</TableCell>
     <TableCell sx={{ minWidth: 120 }} align="center">{entity?.Display_Name || ''}</TableCell>
     <TableCell sx={{ minWidth: 120 }} align="center"> {row.entity?.Field_Type || row.Field_Type || ''}</TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {/* {row?.Product && ( */}
          <IconButton
            onClick={() => {
              onEditRow();
            }}
          >
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          {/* )} */}
          <IconButton
              color="error"
              onClick={() => {
                confirm.onTrue();
              }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
        </TableCell>
        {/* )} */}
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
