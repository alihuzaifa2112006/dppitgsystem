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

// ----------------------------------------------------------------------

const getStatusColor = (status) => {
  switch (status) {
    case 'Quotation':
      return 'primary';
    case 'Performa Invoice (P.I)':
      return 'error';
    case 'Opportunity':
      return 'warning';
    case 'Sample Request':
      return 'info';
    default:
      return 'default';
  }
};

export default function ClauseTableRow({ row, selected, onEditRow, onDeleteRow }) {
  const { Clause, Payment_Term, Doc_Name, ClausesCategory } = row;

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
        {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>{Doc_Name}</TableCell> */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ClausesCategory}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{Payment_Term}</TableCell>
        <TableCell>{Clause}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          <Label color={getStatusColor(Doc_Name)}>{Doc_Name}</Label>
        </TableCell>
        {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Stack direction="row" alignItems="center">
          <Iconify
          icon={getFlagByCountryCode(Country_Name)}
          sx={{ borderRadius: 0.65, border: '1px gray ', width: 28, mr: 1 }}
          />
          {Country_Name}
          </Stack>
          </TableCell>
          <TableCell sx={{ whiteSpace: 'nowrap' }}>{City_Name}</TableCell> */}
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

ClauseTableRow.propTypes = {
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onDeleteRow: PropTypes.func,
};
