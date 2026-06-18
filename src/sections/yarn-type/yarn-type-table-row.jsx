import { useMemo } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { decrypt } from 'src/api/encryption';
import { Button, Switch, Tooltip } from '@mui/material';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import Label from 'src/components/label';

// ----------------------------------------------------------------------

export default function YarnTypeTableRow({ row, selected, onEditRow, onDeleteRow, isUpdating }) {
  const { Yarn_Type_ID, Yarn_Code, Yarn_Type, IsActive } = row;

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const confirm = useBoolean();

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${day}-${month}-${year}`;
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{Yarn_Code}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{Yarn_Type}</TableCell>

        <TableCell>
          <Label color={(IsActive === true && 'success') || 'error'}>
            {IsActive === true ? 'Active' : 'Inactive'}
          </Label>
        </TableCell>

        <TableCell sx={{ display: 'flex', textAlign: 'end' }}>
          <Tooltip title="Update Status">
            <Switch
              checked={IsActive === true}
              color="success"
              onClick={() => onEditRow()}
              // disabled={isUpdating}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              color="error"
              onClick={() => {
                confirm.onTrue();
              }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        </TableCell>

        {/* <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <>
            <IconButton onClick={() => onEditRow()}>
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
          </>
        </TableCell> */}
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

YarnTypeTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  isUpdating: PropTypes.bool,
};
