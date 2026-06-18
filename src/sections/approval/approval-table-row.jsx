import { useMemo } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { decrypt } from 'src/api/encryption';
import { Button } from '@mui/material';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import Label from 'src/components/label';

// ----------------------------------------------------------------------

const getStatusColor = (status) => {
  switch (status) {
    case 'Quotation':
      return 'primary';
    case 'Performa Invoice (P.I)':
      return 'error';
    case 'Opportunity':
      return 'warning';
    case 'Sample Request':
      return 'info';
    case 'Purchase Order':
      return 'success';
    case 'Purchase Request':
      return 'default';
    default:
      return 'default';
  }
};

export default function ApprovalTableRow({ row, selected, onEditRow, onDeleteRow }) {
  const { Doc_Name, ApproverNickName, Approval_LvlID, Designation, SectionName, Dpt_Name } = row;

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const confirm = useBoolean();

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${day}-${month}-${year}`;
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>
          <Label color={getStatusColor(Doc_Name)}>{Doc_Name}</Label>
        </TableCell>
        <TableCell>{ApproverNickName}</TableCell>

        <TableCell sx={{ textAlign: 'center' }}>{Approval_LvlID}</TableCell>
        <TableCell>{Designation}</TableCell>
        <TableCell>{SectionName}</TableCell>
        <TableCell>{Dpt_Name}</TableCell>

        <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <>
            <IconButton onClick={() => onEditRow()}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>

            {/* <IconButton
              color="error"
              onClick={() => {
                confirm.onTrue();
              }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton> */}
          </>
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            approval="error"
            onClick={() => {
              onDeleteRow();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

ApprovalTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
