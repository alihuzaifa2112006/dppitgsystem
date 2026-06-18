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

const getStatusColor = (stID) => {
  switch (stID) {
    case 'Active':
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

export default function DocSubmitTableRow({ row, selected, onEditRow, onDeleteRow,onPdfView }) {
  const { SubmissionDate,SubmissionTypeName,BankName,BankRefNo,BankRefDate,TillInvValue,CurrencyRate,CurrencyName} = row;

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
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{SubmissionDate}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
         
            {SubmissionTypeName}
         
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{BankName}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{BankRefNo}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{BankRefDate}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{TillInvValue}</TableCell>
       
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{CurrencyName}</TableCell>
         <TableCell sx={{ whiteSpace: 'nowrap' }}>{CurrencyRate}</TableCell>
        {/* <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          <Label color={getStatusColor(isActive)}>{isActive}</Label>
        </TableCell> */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          <IconButton onClick={() => onPdfView()} >
            <Iconify icon="flowbite:file-pdf-solid" />
          </IconButton>
          <IconButton onClick={() => onEditRow()} disabled>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => {
              confirm.onTrue();
            }}
            disabled
          >
            <Iconify icon="solar:trash-bin-trash-bold"  />
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

DocSubmitTableRow.propTypes = {
  onEditRow: PropTypes.func,
  onPdfView: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onDeleteRow: PropTypes.func,
};
