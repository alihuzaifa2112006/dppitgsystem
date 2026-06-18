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
  Autocomplete,
  InputAdornment,
} from '@mui/material';
import { RHFAutocomplete } from './hook-form';
import Iconify from './iconify';
import PropTypes from 'prop-types';
import { getCountry } from './country-select/country-select';

const AutocompleteWithDropDown = ({
  name,
  label,
  options,
  getOptionLabel,
  isOptionEqualToValue,
  dropdownLabel,
  optionLable2,
  isOptionEqualToValue2,
  onAdd,
  type1,
  typesData,
  setTypesData,
  valueKey = 'id',
  labelKey = 'name',
  blendTypeOptions = [],
}) => {
  const [open, setOpen] = useState(false);
  const [dialogValue, setDialogValue] = useState('');
  const [selectedBlendType, setSelectedBlendType] = useState(null);
  const handleClose = () => {
    setOpen(false);
    setDialogValue('');
  };

  const handleAdd = async () => {
    if (!dialogValue || !selectedBlendType) return;
    // Pass both values to parent
    await onAdd(dialogValue, selectedBlendType);
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

          <Autocomplete
            fullWidth
            options={blendTypeOptions}
            getOptionLabel={optionLable2 || ((option) => option?.Country_Name || '')}
            isOptionEqualToValue={isOptionEqualToValue2}
            value={selectedBlendType}
            onChange={(e, newValue) => setSelectedBlendType(newValue)}
            renderOption={(props, option) => {
              if (type1 === 'country') {
                const country = getCountry(option?.Country_Name);
                const flagIcon = country?.code ? `circle-flags:${country.code.toLowerCase()}` : '';

                return (
                  <li {...props} key={country?.label || option?.Country_Name}>
                    {flagIcon && (
                      <Iconify
                        icon={flagIcon}
                        sx={{ mr: 1 }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    {country?.label || option?.Country_Name}
                  </li>
                );
              }

              // fallback (non-country)
              return (
                <li {...props} key={option?.id || option?.Country_ID}>
                  {option?.Country_Name || ''}
                </li>
              );
            }}
            renderInput={(params) => {
              if (type1 === 'country') {
                const country = getCountry(selectedBlendType?.Country_Name);
                const flagIcon = country?.code ? `circle-flags:${country.code.toLowerCase()}` : '';

                return (
                  <TextField
                    {...params}
                    label={dropdownLabel || label}
                    margin="normal"
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: flagIcon && (
                        <InputAdornment position="start">
                          <Iconify icon={flagIcon} sx={{ mr: -0.5, ml: 0.5 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                );
              }

              return (
                <TextField {...params} label={dropdownLabel || label} margin="normal" required />
              );
            }}
          />

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

export default AutocompleteWithDropDown;

AutocompleteWithDropDown.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  getOptionLabel: PropTypes.func.isRequired,
  isOptionEqualToValue2: PropTypes.func,
  optionLable2: PropTypes.func,
  isOptionEqualToValue: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  valueKey: PropTypes.string,
  labelKey: PropTypes.string,
  typesData: PropTypes.object,
  setTypesData: PropTypes.object,
  blendTypeOptions: PropTypes.array.isRequired,
  dropdownLabel: PropTypes.string,
  type1: PropTypes.string,
};
