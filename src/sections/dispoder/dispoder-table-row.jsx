import { useMemo } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { decrypt } from 'src/api/encryption';
import { fDate } from 'src/utils/format-time';
import Label from 'src/components/label';
import { Avatar, ListItemText, Tooltip } from '@mui/material';
import { Box } from '@mui/system';

// ----------------------------------------------------------------------

export default function DispoderTableRow({ row, selected, onEditRow }) {
  const { DONumber, DODate, PINo, ItemName, ColorName, Quantity, LotNo, LotLabel } = row;

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  return (
    <TableRow hover selected={selected}>
      {/* <TableCell sx={{ whiteSpace: 'nowrap' }}></TableCell> */}

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{DONumber}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(DODate)}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{PINo}</TableCell>

  

      <TableCell>{ColorName}</TableCell>

      <TableCell>{Quantity}</TableCell>
      <TableCell>{LotNo}</TableCell>
      <TableCell>{LotLabel}</TableCell>

      {/* <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <Tooltip title="Edit" align="center">
          <IconButton onClick={() => onEditRow()}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </Tooltip>
      </TableCell> */}
    </TableRow>
  );
}

DispoderTableRow.propTypes = {
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
