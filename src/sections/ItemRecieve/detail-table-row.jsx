import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { fCurrency, fNumber } from 'src/utils/format-number';
import { formatDate } from '@fullcalendar/core';
import { Autocomplete, Checkbox, InputAdornment, TextField, Tooltip } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import AutocompleteWithAdd from 'src/components/AutocompleteWithAdd';
import { Box } from '@mui/system';
import { RHFAutocomplete } from 'src/components/hook-form';
import { Get } from 'src/api/apibasemethods';
import AddRackDialog from 'src/sections/room/AddDialog';
import { set } from 'lodash';

// ----------------------------------------------------------------------

export default function DetailTableRow({
  row,
  selected,
  onDeleteRow,
  onEditRow,
  userData,
  onSelectRow,
  isEditing,
  allStoreData,
  allRackData,
  Store,
}) {
  const {
    PODate,
    ClassID,
    ORDate,
    ClassName,
    POID,
    // Store,
    POUnitPrice,
    Symbol,
    ItemSubCategory,
    Inv_Cat_Name,
    SubCat_Name,
    ItemName,
    StoreName,
    RackName,
    Unit,
    RemainingQty,
    StoreID,
    PreviousQty,
    POQuantity,
    isClosed,
    ReceiveQty,
    ChallanQty,
    Remarks,
    GRNDTLID,
  } = row;
  const confirm = useBoolean();

  // const [allRackData, setallRackData] = useState([]);
  const [openRackDialog, setOpenRackDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  // RemainingQty + 5 % tolorrance
  const recievableQty = RemainingQty + (RemainingQty * 5) / 100;

  // const fetchRackData = useCallback(async () => {
  //   setLoading(true);
  //   if (Store?.StoreID) {
  //     try {
  //       const response = await Get(
  //         `GetStorageLocationsByUnitLocation?StoreID=${Store?.StoreID}&Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
  //       );
  //       setallRackData(response.data);
  //     } catch (error) {
  //       setallRackData([]);
  //     }
  //   } else {
  //     setallRackData([]);
  //   }
  //   setLoading(false);
  // }, [Store?.StoreID, userData.userDetails.branchID, userData.userDetails.orgId]);

  // useEffect(() => {
  //   fetchRackData();
  // }, [fetchRackData]);

  const handleCloseOpenRackDialog = () => {
    setOpenRackDialog(false);
    // fetchRackData();
  };

  const [localValues, setLocalValues] = useState({
    ReceiveQty: ReceiveQty || 0,
    RackName: RackName || null,
    Store: Store || null,
    isClosed: isClosed || false,
    Remarks: Remarks || '',
    ChallanQty: ChallanQty || 0,
  });

  useEffect(() => {
    setLocalValues({
      ReceiveQty: ReceiveQty || 0,
      RackName: RackName || null,
      Store: Store || null,
      Remarks: Remarks || '',
      ChallanQty: ChallanQty || 0,
      // eslint-disable-next-line
      isClosed: isClosed || false,
    });
  }, [row, ReceiveQty, RackName, isClosed, Store, Remarks, ChallanQty]);

  const handleValueChange = (field, value) => {
    let processedValue = value;

    if (value === '' || Number.isNaN(value)) {
      processedValue = 0;
    } else if (typeof value === 'string') {
      processedValue = parseFloat(value);
    }

    // Check if we should auto-check based on received quantity
    let shouldAutoCheck = localValues.isClosed;
    if (field === 'ReceiveQty') {
      // Correct comparison: value is between RemainingQty and recievableQty (inclusive)
      shouldAutoCheck = processedValue >= RemainingQty && processedValue <= recievableQty;
    }
    const updatedValues = {
      ...localValues,
      [field]: processedValue,
      isClosed: field === 'ReceiveQty' ? shouldAutoCheck : localValues.isClosed,
    };

    if (field === 'RackName') {
      updatedValues[field] = value;
    }
    if (field === 'Store') {
      updatedValues[field] = value;
    }
    if (field === 'Remarks') {
      updatedValues[field] = value;
    }
    if (field === 'isClosed') {
      updatedValues[field] = !isClosed;
    }
    if (field === 'ChallanQty') {
      updatedValues[field] = value;
    }

    setLocalValues(updatedValues);
    onEditRow({
      ...row,
      ...updatedValues,
    });
  };

  useEffect(() => {
    if (localValues?.Store) {
      setLocalValues({
        ...localValues,
        RackName: null,
      });
    }
    // eslint-disable-next-line
  }, [localValues?.Store]);
  return (
    <>
      <TableRow hover selected={selected}>
        {/* <TableCell align="center">{PODate || '-'}</TableCell> */}
        {/* <TableCell align="center">{ORDate || '-'}</TableCell> */}
        <TableCell padding="checkbox" align="center">
          <Checkbox
            checked={selected}
            onChange={() => onSelectRow(row)}
            disabled={isEditing && GRNDTLID !== 0}
          />
        </TableCell>
        <TableCell align="center">{POID?.POCODE || '-'}</TableCell>
        <TableCell align="center">{ClassID?.ClassName || '-'}</TableCell>
        <TableCell align="center">{Inv_Cat_Name?.Inv_Cat_Name || '-'}</TableCell>
        <Tooltip title={ItemSubCategory?.SubCat_Name || '-'} arrow>
          <TableCell
            align="center"
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 150,
            }}
          >
            <span>{ItemSubCategory?.SubCat_Name || '-'}</span>
          </TableCell>
        </Tooltip>

        <Tooltip title={ItemName?.ItemDescription || '-'} arrow>
          <TableCell
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 200,
            }}
          >
            <span>{ItemName?.ItemDescription || '-'}</span>
          </TableCell>
        </Tooltip>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <RHFAutocomplete
            name="Store"
            label="Store"
            placeholder="Choose an option"
            fullWidth
            size="small"
            disabled
            options={allStoreData}
            getOptionLabel={(option) => option?.StoreName || ''}
            isOptionEqualToValue={(option, value) => option?.StoreID === value?.StoreID}
            onchange={(newValue) => {
              const updatedValues = {
                ...localValues,
                Store: newValue,
                RackName: null, // Clear RackName when Store changes
              };
              setLocalValues(updatedValues);
              onEditRow({ ...row, ...updatedValues });
            }}
            value={localValues?.Store || null}
          />
          {/* {Store?.StoreName || '-'} */}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RHFAutocomplete
              // disabled={loading}
              name="RackName"
              // label="RackName"
              fullWidth
              options={allRackData}
              getOptionLabel={(option) => option?.StorageName || ''}
              isOptionEqualToValue={(option, value) => option?.StorageID === value?.StorageID}
              size="small"
              onchange={(newValue) => {
                const updatedValues = {
                  ...localValues,
                  RackName: newValue,
                };
                setLocalValues(updatedValues);
                onEditRow({ ...row, ...updatedValues });
              }}
              value={localValues?.RackName || null}
            />
            <Tooltip title="Add New Rack" placement="top">
              <IconButton color="primary" onClick={() => setOpenRackDialog(true)}>
                <Iconify icon="lets-icons:add-duotone" width={24} height={24} />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
        <TableCell align="right">
          {`${fNumber(POQuantity) || 0} ${Unit?.UOMName || '-'}` || '-'}
        </TableCell>
        <TableCell align="right">
          {`${fNumber(PreviousQty) || 0} ${Unit?.UOMName || '-'}` || '-'}
        </TableCell>
        <TableCell align="right">
          {`${fNumber(RemainingQty) || 0} ${Unit?.UOMName || '-'}` || '-'}
        </TableCell>
        <TableCell align="right">
          <TextField
            type="number"
            value={localValues.ChallanQty}
            onChange={(e) => {
              handleValueChange('ChallanQty', e.target.value);
            }}
            size="small"
            disabled={localValues.isClosed}
            inputProps={{
              min: 0,
              step: 0.01,
              style: { textAlign: 'right' },
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">{Unit?.UOMName}</InputAdornment>,
            }}
          />
        </TableCell>
        <TableCell align="right">
          <TextField
            type="number"
            value={localValues.ReceiveQty}
            onChange={(e) => {
              handleValueChange('ReceiveQty', e.target.value);
            }}
            size="small"
            disabled={localValues.isClosed}
            inputProps={{
              min: 0,
              max: recievableQty,
              step: 0.01,
              style: { textAlign: 'right' },
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">{Unit?.UOMName}</InputAdornment>,
            }}
            sx={{
              '& .MuiInputBase-input': {
                textAlign: 'right',
              },
              '& .MuiOutlinedInput-root': {
                paddingRight: '8px',
              },
            }}
            error={localValues.ReceiveQty > recievableQty}
            helperText={
              localValues.ReceiveQty > recievableQty ? `Exceeding tolerance (${recievableQty})` : ''
            }
          />
        </TableCell>
        <TableCell align="right">{`${fNumber(POUnitPrice)}` || '0.00'}</TableCell>
        <TableCell align="right">
          {`${Symbol} ${fNumber(localValues.ReceiveQty * POUnitPrice)}` || '0.00'}
        </TableCell>
        <TableCell align="center">
          <TextField
            value={localValues.Remarks}
            onChange={(e) => {
              handleValueChange('Remarks', e.target.value);
            }}
            size="small"
          />
        </TableCell>

        <TableCell padding="checkbox" align="center">
          <Checkbox
            checked={localValues.isClosed}
            onChange={(e) => handleValueChange('isClosed', e.target.checked)}
          />
        </TableCell>
      </TableRow>
      <AddRackDialog
        uploadOpen={openRackDialog}
        uploadClose={handleCloseOpenRackDialog}
        tableData={allRackData}
      />
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
  row: PropTypes.object,
  userData: PropTypes.object,
  selected: PropTypes.bool,
  onSelectRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  isEditing: PropTypes.bool,
  allStoreData: PropTypes.array,
  allRackData: PropTypes.array,
  Store: PropTypes.object,
};
