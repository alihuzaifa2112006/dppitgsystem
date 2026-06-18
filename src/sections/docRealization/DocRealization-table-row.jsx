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
import { fNumber } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

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

export default function DocRealizationTableRow({ row, selected, onEditRow, onDeleteRow, onPdfView }) {
  const { 
    DCRealizationNo, 
    CurrencyName, 
    DDRate, 
    TotalInvoiceValue, 
    FinalPaymentRecvDate, 
    SubmissionBankName, 
    PRCNo, 
    SubmissionDate, 
  
  } = row;

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const confirm = useBoolean();

  const countries = getCountries();

  const getFlagByCountryCode = (countryName) => {
    const country = countries?.find((c) => c.label.toLowerCase() === countryName?.toLowerCase());
    return country ? `flagpack:${country?.code?.toLowerCase()}` : '';
  };

 
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{DCRealizationNo || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {CurrencyName || '-'}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap',textAlign: 'right' }}>{fNumber(DDRate)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap',textAlign: 'right' }}>{fNumber(TotalInvoiceValue)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(FinalPaymentRecvDate)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{SubmissionBankName || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{PRCNo || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(SubmissionDate)}</TableCell>
      
        
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {/* <IconButton onClick={() => onPdfView()} >
            <Iconify icon="flowbite:file-pdf-solid" />
          </IconButton> */}
          <IconButton onClick={() => onEditRow()} disabled>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          {/* <IconButton
            color="error"
            onClick={() => {
              confirm.onTrue();
            }}
            disabled
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

DocRealizationTableRow.propTypes = {
  onEditRow: PropTypes.func,
  onPdfView: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onDeleteRow: PropTypes.func,
};
