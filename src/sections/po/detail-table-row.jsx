import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { useBoolean } from 'src/hooks/use-boolean';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { fCurrency, fNumber } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
import { Checkbox, InputAdornment, TextField } from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';

export default function DetailTableRow({
  row,
  selected,
  onDeleteRow,
  onEditRow,
  onSelectRow,
  poPurchaseTypes,
  PostPOPurchaseType,
  scopeOfWork,
  PostScopeOfWork,
}) {
  const {
    PRDetailID,
    PRINVTypeID,
    PRCategoryID,
    PRSubCatID,
    PRItemDescription,
    PRQty,
    RemainingQty,
    POQty,
    ItemID,
    PRUOMID,
    PRUnitPrice,
    POUnitPrice,
    PRCurrencyID,
    Remarks,
    NeededByDate,
    POPurchaseType,
    ScopeOfWork,
    PODeliveryDate,
  } = row;

  const [localValues, setLocalValues] = useState({
    POQty: POQty || 0,
    POUnitPrice: POUnitPrice || 0,
    PODeliveryDate: PODeliveryDate || NeededByDate,
    POPurchaseType: POPurchaseType || null,
    ScopeOfWork: ScopeOfWork || null,
  });

  useEffect(() => {
    setLocalValues({
      POQty: POQty || 0,
      POUnitPrice: POUnitPrice || 0,
      POPurchaseType: POPurchaseType || null,
      PODeliveryDate: PODeliveryDate || NeededByDate,
      // ScopeOfWork: ScopeOfWork || null,
    });
  }, [
    row,
    POQty,
    POUnitPrice,
    PODeliveryDate,
    PRUnitPrice,
    NeededByDate,
    POPurchaseType,
    // ScopeOfWork,
  ]);

  const handleValueChange = (field, value) => {
    let processedValue = value;

    if (value === '' || Number.isNaN(value)) {
      processedValue = 0;
    } else if (typeof value === 'string') {
      processedValue = parseFloat(value);
    }

    if (field === 'POQty') {
      processedValue = Math.min(processedValue, RemainingQty);
    }
    if (field === 'POUnitPrice') {
      processedValue = Math.min(processedValue, PRUnitPrice);
    }
    if (field === 'POPurchaseType') {
      processedValue = POPurchaseType;
    }
    // if (field === 'ScopeOfWork') {
    //   processedValue = ScopeOfWork;
    // }

    const updatedValues = {
      ...localValues,
      [field]: processedValue,
    };

    setLocalValues(updatedValues);

    // Update both detail list and selected rows
    onEditRow({
      ...row,
      ...updatedValues,
    });
  };

  const currencySymbol = PRCurrencyID?.Currency_ID === 8 ? '৳' : '$';
  const totalValue = localValues.POQty * localValues.POUnitPrice;
  const confirm = useBoolean();
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
          <DesktopDatePicker
            defaultValue={localValues.PODeliveryDate ? new Date(localValues.PODeliveryDate) : null}
            value={localValues.PODeliveryDate ? new Date(localValues.PODeliveryDate) : null}
            onChange={(newValue) => {
              const updatedValues = {
                ...localValues,
                PODeliveryDate: newValue,
              };
              setLocalValues(updatedValues);
              onEditRow({ ...row, ...updatedValues });
            }}
            slotProps={{
              textField: {
                size: 'small',
              },
            }}
          />
        </TableCell>
        <TableCell sx={{ minWidth: 200 }}>{ItemID?.ItemCode || '-'}</TableCell>
        <TableCell sx={{ minWidth: 200 }}>{PRItemDescription || '-'}</TableCell>
        <TableCell sx={{ minWidth: 200 }}>{PRINVTypeID?.ClassName || '-'}</TableCell>
        <TableCell sx={{ minWidth: 200 }}>{PRCategoryID?.Inv_Cat_Name || '-'}</TableCell>
        <TableCell sx={{ minWidth: 200 }}>{PRSubCatID?.SubCat_Name || '-'}</TableCell>

        {/* PO Purchase Type */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          <AutocompleteWithAdd
            name="POPurchaseType"
            label="Purchase Type"
            fullWidth
            options={poPurchaseTypes}
            getOptionLabel={(option) => option?.POPurchaseTypes || ''}
            isOptionEqualToValue={(option, value) =>
              option?.POPurchaseTypeID === value?.POPurchaseTypeID
            }
            size="small"
            onChange={(newValue) => {
              const updatedValues = {
                ...localValues,
                POPurchaseType: newValue,
              };
              setLocalValues(updatedValues);
              onEditRow({ ...row, ...updatedValues });
            }}
            value={localValues?.POPurchaseType || null}
            onAdd={PostPOPurchaseType}
          />
        </TableCell>
        {/* PO Scope of Work */}
        {/* <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          <AutocompleteWithAdd
            name="ScopeOfWork"
            label="Scope of Work"
            fullWidth
            options={scopeOfWork}
            getOptionLabel={(option) => option?.ScopeName || ''}
            isOptionEqualToValue={(option, value) => option?.ScopeID === value?.ScopeID}
            size="small"
            onChange={(newValue) => {
              const updatedValues = {
                ...localValues,
                ScopeOfWork: newValue,
              };
              setLocalValues(updatedValues);
              onEditRow({ ...row, ...updatedValues });
            }}
            value={localValues?.ScopeOfWork || null}
            onAdd={PostScopeOfWork}
          />
        </TableCell> */}
        {/* PR Quantity (readonly) */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {`${fNumber(PRQty)} ${PRUOMID?.UOMName}`}
        </TableCell>
        {/* Remaining Quantity (readonly) */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
          {`${fNumber(RemainingQty)} ${PRUOMID?.UOMName}`}
        </TableCell>

        {/* PO Quantity */}
        <TableCell align="right">
          <TextField
            type="number"
            value={localValues.POQty}
            onChange={(e) => {
              handleValueChange('POQty', e.target.value);
            }}
            size="small"
            inputProps={{
              min: 0,
              max: RemainingQty,
              step: 0.01,
              style: { textAlign: 'right' },
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">{PRUOMID?.UOMName}</InputAdornment>,
            }}
            sx={{
              '& .MuiInputBase-input': {
                textAlign: 'right',
              },
              '& .MuiOutlinedInput-root': {
                paddingRight: '8px',
              },
            }}
            error={localValues.POQty > RemainingQty}
            helperText={
              localValues.POQty > RemainingQty
                ? `Cannot exceed Remaining Qty (${RemainingQty})`
                : ''
            }
          />
        </TableCell>

        {/* PR Unit Price (readonly) */}
        <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
          {`${currencySymbol}${fNumber(PRUnitPrice)}`}
        </TableCell>

        {/* PO Unit Price (editable) */}
        <TableCell align="right">
          <TextField
            type="number"
            value={localValues.POUnitPrice}
            onChange={(e) => {
              handleValueChange('POUnitPrice', e.target.value);
            }}
            size="small"
            InputProps={{
              startAdornment: <InputAdornment position="start">{currencySymbol}</InputAdornment>,
            }}
            inputProps={{
              min: 0,
              step: 0.01,
              style: { textAlign: 'right' },
            }}
            sx={{
              '& .MuiInputBase-input': {
                textAlign: 'right',
              },
              '& .MuiOutlinedInput-root': {
                paddingRight: '8px',
              },
            }}
            error={localValues.POUnitPrice > PRUnitPrice}
            helperText={
              localValues.POUnitPrice > PRUnitPrice
                ? `Cannot exceed PR Unit Price (${PRUnitPrice})`
                : ''
            }
          />
        </TableCell>

        {/* Total */}
        <TableCell align="right">{`${currencySymbol}${fNumber(totalValue) || 0}`}</TableCell>
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
  onSelectRow: PropTypes.func,
  poPurchaseTypes: PropTypes.array,
  PostPOPurchaseType: PropTypes.func,
  scopeOfWork: PropTypes.array,
  PostScopeOfWork: PropTypes.func,
};
