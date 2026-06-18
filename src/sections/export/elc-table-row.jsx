import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { Tooltip, Select, MenuItem, FormControl, Button, Box } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import Iconify from 'src/components/iconify';
import { decrypt } from 'src/api/encryption';
import { fDate } from 'src/utils/format-time';
import Label from 'src/components/label';
import { fNumber } from 'src/utils/format-number';

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

export default function ExportTableRow({ row, selected, onEditRow, onViewRow, onAmendment, onStatusChange, onApprove, isApprover = false }) {
  const {
    ExportLCNo,
    LCDate,
    BeneficiaryName,
    OpeningBank,
    LienBank,
    LienDate,
    ExpiryDate,
    ReceiveThroughBank,
    ShipDate,
    ExportLCAmount,
    Status,
    ApprovedByName,
  } = row;

  const [isApproving, setIsApproving] = useState(false);
  const currentStatus = Status || 'Pending';

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      if (onApprove) {
        await onApprove();
      }
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <TableRow hover selected={selected}>
      <TableCell>{ExportLCNo}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(LCDate)}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{BeneficiaryName}</TableCell>

      <Tooltip title={OpeningBank || '-'} arrow>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 200,
          }}
        >
          <span>{OpeningBank}</span>
        </TableCell>
      </Tooltip>

      <Tooltip title={LienBank || '-'} arrow>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 200,
          }}
        >
          <span>{LienBank}</span>
        </TableCell>
      </Tooltip>

      <TableCell>{fDate(LienDate)}</TableCell>

      <Tooltip title={ReceiveThroughBank || '-'} arrow>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 200,
          }}
        >
          <span>{ReceiveThroughBank}</span>
        </TableCell>
      </Tooltip>

      <TableCell>{fDate(ExpiryDate)}</TableCell>
      <TableCell>{fDate(ShipDate)}</TableCell>
      <TableCell align="right">{fNumber(ExportLCAmount)}</TableCell>
      
      <TableCell align="center" sx={{ px: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', minWidth: 150 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={currentStatus}
              onChange={handleStatusChange}
              displayEmpty
              disabled={!isApprover || (!!ApprovedByName && currentStatus === 'Approved')}
              sx={{
                height: '32px',
                '& .MuiSelect-select': {
                  py: 0.75,
                },
              }}
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
            </Select>
          </FormControl>
          
          {currentStatus === 'Approved' && !ApprovedByName && isApprover && (
            <LoadingButton
              variant="contained"
              color="success"
              size="small"
              onClick={handleApprove}
              loading={isApproving}
              sx={{ 
                minWidth: 100,
                height: '28px',
                fontSize: '0.75rem',
              }}
            >
              Approve
            </LoadingButton>
          )}
          
          {ApprovedByName && currentStatus === 'Approved' && (
            <Tooltip title={`Approved by: ${ApprovedByName}`} arrow>
              <Box sx={{ fontSize: '0.7rem', color: 'success.main', textAlign: 'center', fontWeight: 'medium' }}>
                ✓ {ApprovedByName}
              </Box>
            </Tooltip>
          )}
        </Box>
      </TableCell>
      
      <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <Tooltip title="View ">
          <IconButton onClick={() => onViewRow()} >
            <Iconify icon="solar:eye-bold" width={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Amendment">
          <IconButton onClick={() => onAmendment()} >
            <Iconify icon="material-symbols-light:amend-outline-rounded" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton onClick={() => onEditRow()} >
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </Tooltip>


      </TableCell>
    </TableRow>
  );
}

ExportTableRow.propTypes = {
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  onAmendment: PropTypes.func,
  selected: PropTypes.bool,
  onStatusChange: PropTypes.func,
  onApprove: PropTypes.func,
  isApprover: PropTypes.bool,
};
