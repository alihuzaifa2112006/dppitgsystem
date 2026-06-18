import { useMemo } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { decrypt } from 'src/api/encryption';
import Label from 'src/components/label';
import { Stack } from '@mui/system';
import { getCountries } from 'src/utils/Countries';

// ----------------------------------------------------------------------

export default function ProfileTableRow({ row, selected, onEditRow, getStatusColor }) {
  const { Supplier_Name, Short_Name, Phone, Email, Address } = row;

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

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
    <TableRow hover selected={selected}>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{Supplier_Name}</TableCell>

      {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Stack direction="row" alignItems="center">
          <Iconify
            icon={getFlagByCountryCode(Country_Name)}
            sx={{ borderRadius: 0.65, border: '1px gray ', width: 28, mr: 1 }}
          />
          {Country_Name}
        </Stack>
      </TableCell> */}
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{Short_Name}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{Phone}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{Email}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{Address}</TableCell>

      {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>{BranchName}</TableCell> */}

      {/* <TableCell>{Cust_Bus_type}</TableCell> */}
      <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
        <Label color={getStatusColor(row.Is_Active)}>{row.Is_Active ? 'Active' : 'Inactive'}</Label>
      </TableCell>
      {/* <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
        {Unit?.UnitName || UnitName}
      </TableCell> */}
      <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton onClick={() => onEditRow()}>
          <Iconify icon="solar:eye-bold" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

ProfileTableRow.propTypes = {
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  getStatusColor: PropTypes.func,
};
