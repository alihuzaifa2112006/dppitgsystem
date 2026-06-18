import { useMemo } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { decrypt } from 'src/api/encryption';

// ----------------------------------------------------------------------

export default function YarnContractTableRow({ row, selected, onEditRow }) {
  const {
    ContractDate,
    ContractNo,
    CreationDate,
    Description,
    Unit,
    PaymentTerm,
    SupplierName,
    YarnCount,
    Quantity,
    UnitName,
    YarnContractMasterID,
  } = row;


  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  return (
      <TableRow hover selected={selected}>
        {/* <TableCell sx={{ whiteSpace: 'nowrap' }}></TableCell> */}

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{SupplierName}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{ContractNo}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{PaymentTerm}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(ContractDate)}</TableCell>

        <TableCell>{YarnCount}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {parseFloat(Quantity).toFixed(0)}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {Unit?.UnitName || UnitName}
        </TableCell>
        <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
            <IconButton onClick={() => onEditRow()}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
        </TableCell>
      </TableRow>
  );
}

YarnContractTableRow.propTypes = {
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
