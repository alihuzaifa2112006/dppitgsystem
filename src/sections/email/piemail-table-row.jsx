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
import { Button } from '@mui/material';
import { Stack } from '@mui/system';
import { getCountries } from 'src/utils/Countries';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

const getStatusColor = (stID) => {
  switch (stID) {
    case true:
      return 'success';
    // case 'Pending':
    //   return 'warning';
    // case 'Inactive':
    //   return 'error';
    //   case 'Uploaded':
    //     return 'info';
    default:
      return 'default';
  }
};

export default function PiemailTableRow({ row, selected, onEditRow, onDeleteRow, onViewRow }) {
  const { ProformaNo, EmailTo, EmailDate, IsReminder, EmailBody } = row;

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
        <TableCell>{ProformaNo}</TableCell>
        <TableCell>{EmailTo}</TableCell>
        <TableCell>{fDate(EmailDate)}</TableCell>
        {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Stack direction="row" alignItems="center">
            <Iconify
              icon={getFlagByCountryCode(Country_Name)}
              sx={{ borderRadius: 0.65, border: '1px gray ', width: 28, mr: 1 }}
            />
            {Country_Name}
          </Stack>
        </TableCell>{' '}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{City_Name}</TableCell> */}
        {/* <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          <Label color={getStatusColor(IsReminder)}>{IsReminder ? 'Yes' : 'No'}</Label>
        </TableCell> */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          <IconButton onClick={() => onViewRow()}>
            <Iconify icon="solar:eye-bold" />
          </IconButton>
          {/* <IconButton
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

PiemailTableRow.propTypes = {
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onDeleteRow: PropTypes.func,
  onViewRow: PropTypes.func,
};
