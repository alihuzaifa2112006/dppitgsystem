import { useMemo } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { decrypt } from 'src/api/encryption';
import Label from 'src/components/label';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { Button } from '@mui/material';
import { getCountries } from 'src/utils/Countries';
import { Stack } from '@mui/system';

// ----------------------------------------------------------------------

export default function WICTableRow({ row, selected, onEditRow, onDeleteRow, onLinkClick }) {
  const { Country_Name, IsActive, City_Name, WIC_Name, BusinessType_Name } = row;

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const confirm = useBoolean();

  const countries = getCountries();

  const getFlagByCountryCode = (countryName) => {
    const country = countries?.find((c) => c.label.toLowerCase() === countryName?.toLowerCase());
    return country ? `flagpack:${country?.code?.toLowerCase()}` : '';
  };
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
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{WIC_Name}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Stack direction="row" alignItems="center">
            <Iconify
              icon={getFlagByCountryCode(Country_Name)}
              sx={{ borderRadius: 0.65, border: '1px gray ', width: 28, mr: 1 }}
            />
            {Country_Name}
          </Stack>
        </TableCell>{' '}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{City_Name}</TableCell>
        {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>{BusinessType_Name}</TableCell> */}
        {/* <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          <Label color={IsActive ? 'success' : 'default'}>{IsActive ? 'Active' : 'Inactive'}</Label>
        </TableCell> */}
        <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton onClick={() => onLinkClick()}>
            <Iconify icon="ph:link-bold" />
          </IconButton>
          {/* <IconButton onClick={() => onEditRow()}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          <IconButton
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

WICTableRow.propTypes = {
  onEditRow: PropTypes.func,
  onLinkClick: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onDeleteRow: PropTypes.func,
};
