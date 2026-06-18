import { useMemo } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { decrypt } from 'src/api/encryption';
import Label from 'src/components/label';
import { Button, Tooltip } from '@mui/material';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { popover } from 'src/theme/overrides/components/popover';

// ----------------------------------------------------------------------

export default function ProductTableRow({ row, selected, onEditRow, onDeleteRow }) {
  const {
    Yarn_Code,
    Yarn_Count_Name,
    Product_Name,
    Color_Code,
    ColorName,
    UOMName,
    Commercial_Name,
  } = row;

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const confirm = useBoolean();

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  return (
    <>
      <TableRow hover selected={selected}>
        {/* <TableCell sx={{ whiteSpace: 'nowrap' }}></TableCell> */}

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{Yarn_Code}</TableCell>

        {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>{Commercial_Name}</TableCell> */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{Yarn_Count_Name}</TableCell>

        <TableCell sx={{ whiteSpace: 'wrap' }}>{Product_Name}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ColorName}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{Color_Code}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{UOMName}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          <Tooltip title="Edit" placement="top" arrow>
            <IconButton color={selected ? 'primary' : 'default'} onClick={() => onEditRow()}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" placement="top" arrow>
            <IconButton
              color={popover.open ? 'inherit' : 'default'}
              onClick={() => {
                confirm.onTrue();
                popover.onClose();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}

ProductTableRow.propTypes = {
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onDeleteRow: PropTypes.func,
};
