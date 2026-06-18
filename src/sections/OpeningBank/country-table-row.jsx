import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Button } from '@mui/material';

// ----------------------------------------------------------------------

export default function CountryTableRow({ row, selected, onEditRow, onDeleteRow }) {
  const { BankName, BranchName, Address } = row;

  const confirm = useBoolean();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {BankName}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {BranchName}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {Address}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          <IconButton onClick={() => onEditRow()}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          {/*   <IconButton
            color="error"
            onClick={() => {
              confirm.onTrue();
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton> */}
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

CountryTableRow.propTypes = {
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onDeleteRow: PropTypes.func,
};
