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
const getApprovalColors = (priority) => {
  switch (priority) {
    case 'Rejected':
      return 'error';
    case 'Pending':
      return 'warning';
    case 'Approved':
      return 'success';
    default:
      return 'default';
  }
};

export default function OpportunityTableRow({ row, selected, onEditRow, onApprovalRow }) {
  const {
    OpportunityDate,
    WIC_Name,
    KAM_Name,
    EndDate,
    Priority,
    PriceListVer,
    OpportunityName,
    ToBeApproved,
    Level1_Approve,
    Approver1_Name,
    Level1_Approved_Remarks,
    Approver1_Image,
    Level2_Approve,
    Approver2_Name,
    Approver2_Image,
    Level2_Approved_Remarks,
    avatarUrl,
  } = row;

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const hasApproved = Level1_Approve === 'Approved' || Level1_Approve === 'Approved';

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

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{OpportunityName}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{WIC_Name}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{KAM_Name}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Label color={getColors(Priority)} variant="soft" sx={{ ml: 1, textTransform: 'none' }}>
          {Priority || '-'}
        </Label>
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Label
          color={getApprovalColors(Level1_Approve)}
          variant="soft"
          sx={{ ml: 1, textTransform: 'none' }}
        >
          {Level1_Approve || '-'}
        </Label>
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={Approver1_Name} src={Approver1_Image} sx={{ mr: 2 }} />
          <ListItemText
            primary={Approver1_Name}
            // secondary={Level2_Approved_Remarks || '-'}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </Box>
        {/* {Approver2_Name || '-'} */}
      </TableCell>
      <TableCell>{Level1_Approved_Remarks}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Label
          color={getApprovalColors(Level2_Approve)}
          variant="soft"
          sx={{ ml: 1, textTransform: 'none' }}
        >
          {Level2_Approve || '-'}
        </Label>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={Approver2_Name} src={Approver2_Image} sx={{ mr: 2 }} />
          <ListItemText
            primary={Approver2_Name}
            // secondary={Level2_Approved_Remarks || '-'}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </Box>
        {/* {Approver2_Name || '-'} */}
      </TableCell>
      {/* <TableCell>{Level2_Approved_Remarks || '-'}</TableCell> */}
      <TableCell>{Level2_Approved_Remarks}</TableCell>

      <TableCell>{fDate(OpportunityDate)}</TableCell>
      <TableCell>{fDate(EndDate)}</TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        {ToBeApproved ? (
          <Tooltip title="View and Approve">
            <IconButton onClick={() => onApprovalRow()}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="View ">
            <IconButton onClick={() => onApprovalRow()}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>
        )}

        {/* {!hasApproved && ( */}
        <Tooltip title="Edit">
          <IconButton onClick={() => onEditRow()} disabled={hasApproved}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </Tooltip>
        {/* )} */}
      </TableCell>
    </TableRow>
  );
}

OpportunityTableRow.propTypes = {
  onEditRow: PropTypes.func,
  onApprovalRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
