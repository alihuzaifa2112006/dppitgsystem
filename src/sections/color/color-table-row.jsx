import { useMemo } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';

import Iconify from 'src/components/iconify';
import { decrypt } from 'src/api/encryption';
import { Button } from '@mui/material';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';

// ----------------------------------------------------------------------

export default function ColorTableRow({ row, selected, onEditRow, onDeleteRow }) {
  const {
    SL,
    ColorName,
    Color_Code,
    ColorNameandCode,
    HexCode,
    ColorFamilyName,
    TypeName,
    CustomerName,
    DataColorAndCode,
  } = row;

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
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Box
            sx={{
              backgroundColor: HexCode,
              width: '100%',
              maxWidth: '80px',
              height: '20px',
              borderRadius: '5px',
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ColorName}</TableCell>

        <TableCell>{Color_Code}</TableCell>

        <TableCell>{ColorNameandCode}</TableCell>
        <TableCell>{ColorFamilyName || '-'}</TableCell>
        <TableCell>{TypeName || '-'}</TableCell>
        <TableCell>{CustomerName || '-'}</TableCell>
        <TableCell>{DataColorAndCode || '-'}</TableCell>
        <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
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

ColorTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
