import { useMemo } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { fDate } from 'src/utils/format-time';
import Label from 'src/components/label';
import { Tooltip } from '@mui/material';

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

export default function PoTableRow({ row, selected, onEditRow, onViewRow }) {
  const { ValidFrom, WIC_Name, ValidUntil, QuotationNo, OpportunityName, PRNo } = row;

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

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{PRNo}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{WIC_Name}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{QuotationNo}</TableCell>
      <TableCell>{OpportunityName}</TableCell>
      {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Label color={getColors(Priority)} variant="soft" sx={{ ml: 1, textTransform: 'none' }}>
          {Priority || '-'}
        </Label>
      </TableCell> */}

      <TableCell>{fDate(ValidFrom)}</TableCell>
      <TableCell>{fDate(ValidUntil)}</TableCell>

      <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <Tooltip title="View">
          <IconButton onClick={() => onEditRow()} >
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </Tooltip>
        <Tooltip title="View PDF">
          <IconButton onClick={() => onViewRow()} color="error">
            <Iconify icon="flowbite:file-pdf-solid" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

PoTableRow.propTypes = {
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
