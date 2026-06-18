import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { Tooltip } from '@mui/material';

import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function ClaimAuditsTableRow({ row, onEditRow, PDFClicked }) {
  const { ComplaintAutoNo, CustomerName, ReportNo, AuditDate, AuditorName, Status } = row;

  return (
    <TableRow hover>
      <TableCell
        sx={{
          whiteSpace: 'nowrap',
          maxWidth: 200,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <Tooltip title={ReportNo} arrow placement="left">
          <span>{ReportNo}</span>
        </Tooltip>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(AuditDate)}</TableCell>

      <TableCell
        sx={{
          whiteSpace: 'nowrap',
          maxWidth: 200,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <Tooltip title={ComplaintAutoNo} arrow placement="left">
          <span>{ComplaintAutoNo}</span>
        </Tooltip>
      </TableCell>

      <TableCell
        sx={{
          whiteSpace: 'nowrap',
          maxWidth: 200,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <Tooltip title={CustomerName} arrow placement="left">
          <span>{CustomerName}</span>
        </Tooltip>
      </TableCell>

      <TableCell
        sx={{
          whiteSpace: 'nowrap',
          maxWidth: 200,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <Tooltip title={AuditorName} arrow placement="left">
          <span>{AuditorName}</span>
        </Tooltip>
      </TableCell>

      {/* Huzaifa CHnage  */}
      <TableCell>
        <Label variant="soft" color={Status === 'Not Settled' ? 'error' : 'success'}>
          {Status}
        </Label>
      </TableCell>

      <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <Tooltip title="Settlement Form">
          <IconButton onClick={() => onEditRow()}>
            <Iconify icon="hugeicons:assignments" />
          </IconButton>
        </Tooltip>
        {/* </TableCell> */}
        {/* <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}> */}
        <Tooltip title="View PDF">
          <IconButton onClick={() => PDFClicked()}>
            <Iconify icon="hugeicons:pdf-02" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

ClaimAuditsTableRow.propTypes = {
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  PDFClicked: PropTypes.func,
};
