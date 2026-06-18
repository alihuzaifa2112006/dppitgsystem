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
  forApproval,
  isPDO,
}) {
  const {
    PRINVTypeID,
    PRCategoryID,
    PRSubCatID,
    PRItemDescription,
    MRP,
    MRPItem,
    ProductionOrderNo,
    // Vendor,
    ProductionOrderID,
    ProductionOrderItem,
    PRQty,
    ItemOpen,
    PRUOMID,
    PRUnitPrice,
    PRCurrencyID,
    Remarks,
    NeededByDate,
  } = row;

  const currencySymbol = PRCurrencyID?.Currency_ID === 8 ? '৳' : '$';
  const totalValue = PRQty * PRUnitPrice;
  const confirm = useBoolean();

  return (
    <>
      <TableRow hover selected={selected}>
        {isPDO ? (
          <>
            <TableCell sx={{ minWidth: 200 }}>{MRP?.MRPNo || '-'}</TableCell>
            {/* <TableCell sx={{ minWidth: 200 }}>
              {ProductionOrderItem?.ProductionOrderNo || '-'}
            </TableCell> */}

            <TableCell sx={{ minWidth: 200 }}>{ProductionOrderItem?.Item_Code || '-'}</TableCell>
          </>
        ) : (
          <>
            <TableCell sx={{ minWidth: 200 }}>{PRINVTypeID?.ClassName || '-'}</TableCell>
            <TableCell sx={{ minWidth: 200 }}>{PRCategoryID?.Inv_Cat_Name || '-'}</TableCell>
            <TableCell sx={{ minWidth: 200 }}>{PRSubCatID?.SubCat_Name || '-'}</TableCell>
            <TableCell sx={{ minWidth: 200 }}>{ItemOpen?.ItemCode || '-'}</TableCell>
          </>
        )}
        <TableCell sx={{ minWidth: 200 }}>{PRItemDescription || '-'}</TableCell>
        {/* <TableCell sx={{ minWidth: 200 }}>{Vendor?.VendorName || '-'}</TableCell> */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {`${fNumber(PRQty)} ${PRUOMID?.UOMName}`}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
          {`${currencySymbol}${fNumber(PRUnitPrice)} / ${PRUOMID?.UOMName}`}
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
          {`${currencySymbol}${fNumber(totalValue)}`}
        </TableCell>
        {/* <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
          {fDate(NeededByDate)}
        </TableCell> */}

        <TableCell sx={{ minWidth: 200 }}>{Remarks || '-'}</TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton onClick={onEditRow}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>

          <IconButton color="error" onClick={confirm.onTrue}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </TableCell>
      </TableRow>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete this item?"
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
  forApproval: PropTypes.bool,
  isPDO: PropTypes.bool,
};
