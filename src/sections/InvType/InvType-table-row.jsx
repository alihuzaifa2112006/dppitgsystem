import { useMemo } from 'react';
import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { Stack } from '@mui/system';

import Iconify from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { Button } from '@mui/material';

// ----------------------------------------------------------------------

export default function InvTypeTableRow({ row, selected, onEditRow, onDeleteRow }) {
  const {
    InvType_Name,
    isProcureable,
    isProducrable,
    isColorSensitive,
    isRepairable,
    isSubContracting,
    Code,
  } = row;

  const confirm = useBoolean();

  const renderBooleanIcon = (value) =>
    value ? (
      <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'success.main' }} />
    ) : (
      <Iconify icon="eva:close-circle-fill" sx={{ color: 'error.main' }} />
    );

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell>
          <Stack direction="row" alignItems="center">
            {InvType_Name}
          </Stack>
        </TableCell>

        <TableCell align="center">{Code}</TableCell>
        <TableCell align="center">{renderBooleanIcon(isProcureable)}</TableCell>

        <TableCell align="center">{renderBooleanIcon(isProducrable)}</TableCell>

        <TableCell align="center">{renderBooleanIcon(isColorSensitive)}</TableCell>

        <TableCell align="center">{renderBooleanIcon(isRepairable)}</TableCell>

        <TableCell align="center">{renderBooleanIcon(isSubContracting)}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
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
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure you want to delete this item?"
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

InvTypeTableRow.propTypes = {
  onEditRow: PropTypes.func,
  row: PropTypes.shape({
    InvType_Name: PropTypes.string,
    isProcureable: PropTypes.bool,
    isProducrable: PropTypes.bool,
    isColorSensitive: PropTypes.bool,
    isRepairable: PropTypes.bool,
    isSubContracting: PropTypes.bool,
    Code: PropTypes.string,
  }),
  selected: PropTypes.bool,
  onDeleteRow: PropTypes.func,
};
