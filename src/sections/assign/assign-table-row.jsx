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

export default function AssignTableRow({ row, selected  }) {
  const {  ColHeaderName, FormName, Field_Type } = row;

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  return (
    <TableRow sx={{ whiteSpace: 'nowrap' }} hover selected={selected}>

 <TableCell sx={{ width: '25%', whiteSpace: 'nowrap' }}>
        {row.FormName || '-'}
      </TableCell>
      <TableCell sx={{ width: '25%', whiteSpace: 'nowrap' }}>
        {row.ItemName || '-'}
      </TableCell>
      <TableCell sx={{ width: '25%', whiteSpace: 'nowrap' }}>
        {row.Value || '-'}
      </TableCell>
      <TableCell sx={{ width: '25%', whiteSpace: 'nowrap' }}>
        {row.Date || '-'}
      </TableCell>
      {/* <TableCell>{ColHeaderName || '-'}</TableCell>
      <TableCell>{FormName || '-'}</TableCell>
      <TableCell>{Field_Type || '-'}</TableCell> */}

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

AssignTableRow.propTypes = {
  
  row: PropTypes.object,
  selected: PropTypes.bool,
};
