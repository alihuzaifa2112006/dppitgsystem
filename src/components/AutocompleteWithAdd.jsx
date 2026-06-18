import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  Button,
  Tooltip,
} from '@mui/material';
import { RHFAutocomplete } from './hook-form';
import Iconify from './iconify';
import PropTypes from 'prop-types';

const AutocompleteWithAdd = ({
  name,
  label,
  options,
  getOptionLabel,
  isOptionEqualToValue,
  onAdd,
  isAddDisabled,
  disabled,
  onChange,
  value,
  size = 'medium',
  valueKey = 'id',
  labelKey = 'name',
}) => {
  const [open, setOpen] = useState(false);
  const [dialogValue, setDialogValue] = useState('');

  const handleClose = () => {
    setOpen(false);
    setDialogValue('');
  };

  const handleAdd = async () => {
    await onAdd(dialogValue); // Add item using provided function
    handleClose();
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <RHFAutocomplete
          name={name}
          label={label}
          fullWidth
          options={options}
          getOptionLabel={getOptionLabel || ''}
          isOptionEqualToValue={isOptionEqualToValue || null}
          value={value || null}
          size={size}
          onchange={onChange}
          disabled={disabled}
        />
        <Tooltip title={`Add New ${label}`} placement="top">
          <IconButton color="primary" onClick={() => setOpen(true)} disabled={isAddDisabled || disabled}>
            <Iconify icon="lets-icons:add-duotone" width={size === 'small' ? 24 : 32} height={size === 'small' ? 24 : 32} />
          </IconButton>
        </Tooltip>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New {label}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the name for the new {label.toLowerCase()}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            value={dialogValue}
            onChange={(e) => setDialogValue(e.target.value)}
            label={label}
            type="text"
            fullWidth
            variant="outlined"
            sx={{ mt: 3 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" color="primary" disabled={!dialogValue}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AutocompleteWithAdd;

AutocompleteWithAdd.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  getOptionLabel: PropTypes.func.isRequired,
  isOptionEqualToValue: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  valueKey: PropTypes.string,
  value: PropTypes.any,
  labelKey: PropTypes.string,
  isAddDisabled: PropTypes.bool,
  onChange: PropTypes.func,
  size: PropTypes.string,
  disabled: PropTypes.bool,
};
