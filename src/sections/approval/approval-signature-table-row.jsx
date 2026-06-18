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
import Image from 'src/components/image';
import { APP_API_STORAGE } from 'src/config-global';
import { Box } from '@mui/system';

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
    default:
      return 'default';
  }
};

export default function ApprovalSigantureTableRow({ row, selected, onEditRow, onDeleteRow }) {
  const { EsignaturePath, ApproverNickName, hasSignature } = row;
  const confirm = useBoolean();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>{ApproverNickName}</TableCell>

        <TableCell
          align="center"
          sx={{
            width: 80,
            height: 30,
          }}
        >
          {EsignaturePath ? (
            // <Box

            // >
            <Image
              src={`${APP_API_STORAGE}${EsignaturePath}`}
              alt="Signature"
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1,
                objectFit: 'contain',
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            />
          ) : (
            // </Box>
            <Label color="error">No Signature</Label>
          )}
        </TableCell>

        <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton onClick={onEditRow} disabled={hasSignature} color="primary" sx={{ mr: 1 }}>
            <Iconify icon="mingcute:add-line" />
          </IconButton>

          {/* {hasSignature && (
            <IconButton color="error" onClick={() => confirm.onTrue()}>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          )} */}
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Signature"
        content="Are you sure you want to delete this signature?"
        action={
          <Button
            variant="contained"
            color="error"
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

ApprovalSigantureTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  selected: PropTypes.bool,
  onEditRow: PropTypes.func.isRequired,
  onDeleteRow: PropTypes.func.isRequired,
};
