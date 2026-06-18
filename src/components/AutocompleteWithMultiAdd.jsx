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
  Switch,
  Typography,
} from '@mui/material';
import { RHFAutocomplete } from './hook-form';
import Iconify from './iconify';
import PropTypes from 'prop-types';

const AutocompleteWithMultiAdd = ({
  name,
  label,
  options,
  getOptionLabel,
  isOptionEqualToValue,
  onAdd,
  fields,
  value,
  valueKey = 'id',
  labelKey = 'name',
  hasBit = false,
  labelBit,
}) => {
  const [open, setOpen] = useState(false);
  const [dialogValue, setDialogValue] = useState({});

  const handleClose = () => {
    setOpen(false);
    setDialogValue('');
  };

  const handleAdd = async () => {
    await onAdd(dialogValue);
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
        />
        <Tooltip title={`Add New ${label}`} placement="top">
          <IconButton color="primary" onClick={() => setOpen(true)}>
            <Iconify icon="lets-icons:add-duotone" width={32} height={32} />
          </IconButton>
        </Tooltip>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New {label}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the name for the new {label.toLowerCase()}
          </DialogContentText>
          {fields?.map((field) => (
            <TextField
              key={field.name}
              margin="dense"
              value={dialogValue[field.name] || ''}
              onChange={(e) =>
                setDialogValue({ ...dialogValue, [field.name]: e.target.value })
              }
              label={field.label}
              type={field.type || 'text'}
              fullWidth
              variant="outlined"
              sx={{ mt: 3 }}
              required
            />
          ))}
          {
            hasBit && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Switch
                  checked={dialogValue.hasBit}
                  onChange={(e) => setDialogValue({ ...dialogValue, hasBit: e.target.checked })}
                />
                <Typography variant="body2">{labelBit}</Typography>
              </Box>
            )
          }

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

export default AutocompleteWithMultiAdd;

AutocompleteWithMultiAdd.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  getOptionLabel: PropTypes.func.isRequired,
  isOptionEqualToValue: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.string,
    })
  ),
  valueKey: PropTypes.string,
  value: PropTypes.any,
  labelKey: PropTypes.string,
  hasBit: PropTypes.bool,
  labelBit: PropTypes.string,
};

