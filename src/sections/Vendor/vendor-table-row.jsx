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

// ----------------------------------------------------------------------

export default function ProductTableRow({ row, selected, onEditRow, onDeleteRow }) {
  const {
    VendorName,
    ShortName,
    ClassName,
    VendorType,
    SourceName,
    Origin_Name,
    ContactPerson,
    OfficeAddress,
    FactoryAddress,
    PhoneNo,
    Email,
    VendorNo,
  } = row;

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const confirm = useBoolean();

  return (
    <>
      <TableRow selected={selected}>
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{VendorNo || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{VendorName || '-'}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ShortName || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{SourceName || '-'}</TableCell>
        {/* Origin_Name */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{Origin_Name || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ClassName || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{VendorType || '-'}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ContactPerson || '-'}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{OfficeAddress || '-'}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{FactoryAddress || '-'}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{PhoneNo || '-'}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{Email || '-'}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          <Tooltip title="Edit" placement="top" arrow>
            <IconButton color={selected ? 'primary' : 'default'} onClick={() => onEditRow()}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
          {/* <Tooltip title="Delete" placement="top" arrow>
            <IconButton
              color="default"
              onClick={() => {
                confirm.onTrue();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip> */}
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete this vendor?"
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
