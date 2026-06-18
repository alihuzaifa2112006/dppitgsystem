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

export default function DetailTableRow({ row, selected, onDeleteRow, onEditRow, currentData }) {
  const {
    ProductName,
    Description,
    Product,
    Quantity,
    DtlDeliveryDate,
    NoOfCones,
    Price,
    TotalAmountinBDT,
    CustomerFBDate,
    Remarks,
    TotalAmount,
    EstimatedDeliveryDate,
    UOM,
    Sample_Type,
    Fabric_Type,
    ColorID,
    Yarn_Type_ID,
    Yarn_Count_ID,
    Composition_ID,
    Priority,
    Cost,
  } = row;
  const currencySymbol = Product?.currencyID === 8 ? '৳' : '$';

  const confirm = useBoolean();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ minWidth: 200 }}>{ProductName}</TableCell>
        
        {/* Sample Type */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {Sample_Type?.Sample_Name || '-'}
        </TableCell>
        
        {/* Fabric Type */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {Fabric_Type?.Fabric_Types || '-'}
        </TableCell>
        
        {/* Color */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {ColorID?.ColorNameandCode  || '-'}
        </TableCell>
        
        {/* Yarn Type */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {Yarn_Type_ID?.Yarn_Type || '-'}
        </TableCell>
        
        {/* Yarn Count */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {Yarn_Count_ID?.Yarn_Count_Name || '-'}
        </TableCell>
        
        {/* Composition */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {Composition_ID?.Composition_Name || '-'}
        </TableCell>
        
        {/* Priority */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {Priority?.Priority_Category || '-'}
        </TableCell>
        
        {/* Quantity */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{`${Quantity} ${UOM?.UOMName || ''}`}</TableCell>
        
        {/* No of Cones */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{NoOfCones || '-'}</TableCell>
        
        {/* Cost */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {Cost ? `$${fNumber(Cost)}` : '-'}
        </TableCell>
        
        {/* Unit Price */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {`${fCurrency(Price)} / ${UOM?.UOMName || ''}`}
        </TableCell>
        
        {/* Total in USD */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {fCurrency(TotalAmount)}
        </TableCell>
        
        {/* Total in BDT */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {`৳ ${fNumber(TotalAmountinBDT)}`}
        </TableCell>
        
        {/* Est. Delivery Date */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {fDate(EstimatedDeliveryDate) || '-/-/-'}
        </TableCell>
        
        {/* Est. Feedback Date */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {fDate(CustomerFBDate) || '-/-/-'}
        </TableCell>
        
        {/* Remarks */}
        <TableCell sx={{ minWidth: 200 }}>{Remarks || '-'}</TableCell>

        {!currentData && (
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
        )}
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
  row: PropTypes.object,
  selected: PropTypes.bool,
  currentData: PropTypes.object,
};
