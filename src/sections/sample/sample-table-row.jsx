import { useMemo } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { decrypt } from 'src/api/encryption';
import { fDate } from 'src/utils/format-time';
import Label from 'src/components/label';
import { Tooltip } from '@mui/material';

// ----------------------------------------------------------------------

const getColors = (priority) => {
  switch (priority) {
    case 'R':
      return 'error';
    case 'A':
      return 'success';
    case 'P':
      return 'warning';
    default:
      return 'default';
  }
};

export default function SampleTableRow({ row, selected, onEditRow, onViewRow }) {
  const {
    Sample_Name,
    WIC_Name,
    Delivery_Date,
    ADM_Approve,
    QuotationNo,
    Sample_Code,
    ADM_Approved_Remarks,
    End_Cust_Name,
    ToBeApproved,
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

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{Sample_Name || '-'}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{Sample_Code || '-'}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{WIC_Name || '-'}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{End_Cust_Name || '-'}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{QuotationNo || '-'}</TableCell>

      {/* <TableCell>{fDate(ValidFrom)}</TableCell> */}
      <TableCell>{fDate(Delivery_Date) || '-'}</TableCell>
      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
        <Label color={getColors(ADM_Approve)} variant="soft" sx={{ ml: 1, textTransform: 'none' }}>
          {ADM_Approve === 'A' ? 'Approved' : ADM_Approve === 'R' ? 'Rejected' : 'Pending'}
        </Label>
      </TableCell>
      <TableCell>{ADM_Approved_Remarks || '-'}</TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        {/* {userData.userDetails.userId === 30 && ( */}
        {ToBeApproved === 'Yes' ? (
          <Tooltip title="Edit Status">
            <IconButton onClick={() => onEditRow()} color="primary">
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="View">
            <IconButton onClick={() => onEditRow()}>
              <Iconify icon="ph:eye-duotone" />
            </IconButton>
          </Tooltip>
        )}
        {/* )} */}
        {ADM_Approve === 'A' && (
          <Tooltip title="View PDF">
            <IconButton onClick={() => onViewRow()}>
              <Iconify icon="mdi:file-pdf-box" />
            </IconButton>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
}

SampleTableRow.propTypes = {
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onViewRow: PropTypes.func,
};
