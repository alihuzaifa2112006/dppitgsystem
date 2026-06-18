import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { fCurrency, fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function DetailTableRow({ row, selected, onDeleteRow, onEditRow }) {
  const {
    VendorName,
    StoreID,
    StorageLocation,
    OpeningStockQuantity,
    AveragePrice,
    TotalPriceinUSD,
    TotalPriceinBDT,
    UOM,
    Currency,
  } = row;

  const confirm = useBoolean();
  const currencySymbol = Currency?.Currency_ID === 8 ? '৳' : '$';
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell sx={{ minWidth: 120 }}>{VendorName?.VendorName || ''}</TableCell>

        <TableCell sx={{ minWidth: 120 }}>{StoreID?.StoreName}</TableCell>

        <TableCell sx={{ minWidth: 120 }}>{StorageLocation?.StorageName || ''}</TableCell>
        {/* <TableCell sx={{ minWidth: 240, align="center" }}>
  {DODate ? new Date(DODate).toLocaleDateString() : ''}
</TableCell> */}
        <TableCell sx={{ minWidth: 120 }} align="center">
          {`${fNumber(OpeningStockQuantity || 0) || '0'} ${UOM?.UOMName}`}
        </TableCell>
        <TableCell sx={{ minWidth: 120, textAlign: 'center' }}>{fNumber(AveragePrice || 0) || '0'}</TableCell>

        <TableCell sx={{ minWidth: 120, textAlign: 'center' }}>
          {/* {currencySymbol} */}
          {`$${fNumber(TotalPriceinUSD || 0) || '0'} `}
        </TableCell>
        <TableCell sx={{ minWidth: 120, textAlign: 'center' }}>

          {`৳${fNumber(TotalPriceinBDT || 0) || '0'}`}
        </TableCell>

        {/* {forApproval && ( */}
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {/* {row?.Product && ( */}
          <IconButton
            onClick={() => {
              onEditRow();
            }}
          >
            <Iconify icon="solar:pen-bold" />
          </IconButton>
          {/* )} */}
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
  row: PropTypes.object,
  selected: PropTypes.bool,
};
