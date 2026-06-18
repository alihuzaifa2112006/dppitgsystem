import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { fCurrency, fNumber } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function DetailTableRow({
  row,
  selected,
  onDeleteRow,
  onEditRow,
  currentData,
  UnitOfMeasure,
  forApproval,
}) {
  const {
    Requirement,
    Description,
    Product,
    Quantity,
    ConesQty,
    ColorRefCode,
    Unit_Price,
    UOM,
    Remarks,
    Item_Code,
    DeliveryDueDate,
  } = row;
  // const currencySymbol = Product?.currencyID === 8 ? '৳' : '$';
  const currencySymbol = '$';
  const totalValue = Quantity * Unit_Price;
  const confirm = useBoolean();
  console.log(DeliveryDueDate);
  return (
    <>
      <TableRow hover selected={selected}>
        {currentData && <TableCell sx={{ minWidth: 200 }}>{Item_Code || '-'}</TableCell>}
        {/* <TableCell sx={{ minWidth: 200 }}>{Product?.Product_Name}</TableCell> */}
        <TableCell sx={{ minWidth: 120 }}>{Description}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'right' }}>{fDate(DeliveryDueDate)}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center', minWidth: 120  }}>{ColorRefCode || '-'}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {`${fNumber(Quantity)} ${UnitOfMeasure}`}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {fNumber(ConesQty) || '-'}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {`${fCurrency(Unit_Price)} / ${UnitOfMeasure}`}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
          {fCurrency(totalValue) || '-'}
        </TableCell>
        <TableCell sx={{ minWidth: 240 }}>{Remarks || '-'}</TableCell>

        {/* {forApproval && ( */}
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton
            onClick={() => {
              onEditRow();
            }}
          >
            <Iconify icon="solar:pen-bold" />
          </IconButton>

          <IconButton
            color="error"
            onClick={() => {
              confirm.onTrue();
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </TableCell>
        {/* )} */}
      </TableRow>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
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

DetailTableRow.propTypes = {
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
  UnitOfMeasure: PropTypes.string,
  row: PropTypes.object,
  selected: PropTypes.bool,
  currentData: PropTypes.object,
  forApproval: PropTypes.bool,
};
