import { useMemo } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { decrypt } from 'src/api/encryption';
import Label from 'src/components/label';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Avatar, Button } from '@mui/material';
import { APP_API_STORAGE } from 'src/config-global';
import { Stack } from '@mui/system';
import { getCountries } from 'src/utils/Countries';

// ----------------------------------------------------------------------

export default function EndCustomerTableRow({ row, selected, onEditRow, onDeleteRow }) {
  const { End_Cust_Name_Org, End_Cust_Name, End_CustLogoPath, isActive, Country_Name } = row;

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
        <TableCell
          align="center"
          sx={{ whiteSpace: 'nowrap', display: 'flex', justifyContent: 'center' }}
        >
          <Avatar
            alt="Logo"
            src={`${APP_API_STORAGE}${End_CustLogoPath}`}
            sx={{ width: 32, height: 32 }}
          />
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{End_Cust_Name_Org}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{End_Cust_Name}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Stack direction="row" alignItems="center">
            <Iconify
              icon={getFlagByCountryCode(Country_Name)}
              sx={{ borderRadius: 0.65, border: '1px gray ', width: 28, mr: 1 }}
            />
            {Country_Name}
          </Stack>
        </TableCell>{' '}
        {/* <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          <Label color={isActive ? 'success' : 'default'}>{isActive ? 'Active' : 'Inactive'}</Label>
        </TableCell> */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
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

EndCustomerTableRow.propTypes = {
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onDeleteRow: PropTypes.func,
};
