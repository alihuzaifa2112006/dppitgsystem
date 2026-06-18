import { useMemo } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { decrypt } from 'src/api/encryption';
import { fDate } from 'src/utils/format-time';
import Label from 'src/components/label';

// ----------------------------------------------------------------------

const getColors = (priority) => {
  switch (priority) {
    case 'High':
      return 'error';
    case 'HIGH':
      return 'error';
    case 'Medium':
      return 'info';
    case 'Low':
      return 'success';
    default:
      return 'default';
  }
};

export default function ImportInvoiceEntryTableRow({ row, selected, onEditRow }) {
  const { ValidFrom, LC_No, ValidUntil, Priority, PriceListVer, QuotationNo } = row;

  return (
    <TableRow hover selected={selected}>
      {/* <TableCell sx={{ whiteSpace: 'nowrap' }}></TableCell> */}

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{QuotationNo}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{LC_No}</TableCell>
      {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Label color={getColors(Priority)} variant="soft" sx={{ ml: 1, textTransform: 'none' }}>
          {Priority || '-'}
        </Label>
      </TableCell> */}

      <TableCell>{fDate(ValidFrom)}</TableCell>
      <TableCell>{fDate(ValidUntil)}</TableCell>

      <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton onClick={() => onEditRow()}>
          <Iconify icon="solar:pen-bold" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

ImportInvoiceEntryTableRow.propTypes = {
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
