import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { Tooltip } from '@mui/material';

import Iconify from 'src/components/iconify';
import Label from 'src/components/label';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function ClaimAssignmentTableRow({ row, onEditRow, PDFClicked }) {
  const { ComplaintAutoNo, CustomerName, ComplaintName, ComplaintDate, StatusID, PINo, QCName } =
    row;

  return (
    <TableRow hover>
      {/* PINo */}
      <TableCell
        sx={{
          whiteSpace: 'nowrap',
          maxWidth: 200,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <Tooltip title={PINo} arrow placement="left">
          <span>{PINo}</span>
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
        <Tooltip title={ComplaintName} arrow placement="left">
          <span>{ComplaintName}</span>
        </Tooltip>
      </TableCell>

      <TableCell>{QCName}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(ComplaintDate)}</TableCell>

      {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>{ComplaintQty}</TableCell> */}

      <TableCell>
        {/* eslint-disable no-nested-ternary */}
        <Label
          variant="soft"
          color={(StatusID === 1 && 'info') || (StatusID === 2 && 'warning') || 'error'}
        >
          {StatusID === 1
            ? 'Waiting for Visit'
            : StatusID === 2
              ? 'Waiting for Claim Qty Approval'
              : 'Rejected'}
        </Label>
      </TableCell>

      {/* { */}
      {/* // IsAssigned === 'No' ? */}
      <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton onClick={() => onEditRow()} disabled={StatusID === 3}>
          <Iconify icon="hugeicons:assignments" />
        </IconButton>
      </TableCell>

      {/* PDF ADDING BY ME */}
      {/* <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <Tooltip title="View PDF">
          <IconButton onClick={() =>

            PDFClicked()}>
         <Iconify icon="flowbite:file-pdf-solid" />
          </IconButton>
        </Tooltip>
      </TableCell> */}
    </TableRow>
  );
}

ClaimAssignmentTableRow.propTypes = {
  onEditRow: PropTypes.func,
  PDFClicked: PropTypes.func,
  row: PropTypes.object,
};
