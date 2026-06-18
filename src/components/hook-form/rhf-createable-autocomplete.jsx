import { useState } from 'react';
import PropTypes from 'prop-types';
import { Controller, useFormContext } from 'react-hook-form';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

import { useSnackbar } from 'src/components/snackbar';

const filter = createFilterOptions();

export default function RHFCreatableAutocomplete({
  name,
  label,
  placeholder,
  onchange,
  options,
  onAddOption,
  defaultValue, // Add the defaultValue prop
  ...other
}) {
  const { enqueueSnackbar } = useSnackbar();

  const { control, setValue, resetField } = useFormContext();
  const { multiple } = other;

  const [dialogValue, setDialogValue] = useState('');
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setDialogValue('');
    setOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation(); // Prevent parent form submission

    const normalizedValue = dialogValue.trim().toUpperCase(); // Convert input to uppercase

    if (normalizedValue === '') {
      enqueueSnackbar('Please enter an option', { variant: 'warning' });
      return;
    }

    if (options.some((option) => option.label.trim().toUpperCase() === normalizedValue)) {
      enqueueSnackbar('This option already exists', { variant: 'error' });
      return;
    }

    setValue(name, null, { shouldValidate: true }); // Clear the Autocomplete field
    onAddOption(normalizedValue); // Pass the uppercase value
    resetField(name); // Ensure the field is reset
    handleClose(); // Close the dialog
  };

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue || null} // Pass the defaultValue to the Controller
        render={({ field, fieldState: { error } }) => (
          <Autocomplete
            {...field}
            id={`autocomplete-${name}`}
            autoHighlight={!multiple}
            disableCloseOnSelect={multiple}
            options={options || []}
            onChange={(event, newValue) => {
              if (newValue && newValue.inputValue) {
                // Clear the Autocomplete field
                setValue(name, null, { shouldValidate: true });
                setOpen(true);
                setDialogValue(newValue.inputValue.toUpperCase());
              } else {
                // Only set the value if it's a valid option (not a custom suggestion)
                const transformedValue = newValue
                  ? { ...newValue, label: newValue.label.toUpperCase() }
                  : null; // Reset to null if no valid selection
                setValue(name, transformedValue, { shouldValidate: true });
                if (onchange) {
                  onchange(transformedValue);
                }
              }
            }}
            filterOptions={(optionz, params) => {
              const filtered = filter(optionz, params);
              const { inputValue } = params;

              const isExisting = optionz.some(
                (option) => option.label.toUpperCase() === inputValue.toUpperCase()
              );
              if (inputValue !== '' && !isExisting) {
                filtered.push({
                  inputValue: inputValue.toUpperCase(),
                  label: `Add "${inputValue.toUpperCase()}"`,
                });
              }

              return filtered;
            }}
            getOptionLabel={(option) => option?.label || ''}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                placeholder={placeholder}
                error={!!error}
                helperText={error ? error.message : ''}
                inputProps={{
                  ...params.inputProps,
                  autoComplete: 'off',
                }}
              />
            )}
            {...other}
          />
        )}
      />

      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add a new option</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Did you miss any options in our list? Please, add it!
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="new-option"
              value={dialogValue}
              onChange={(event) => setDialogValue(event.target.value.toUpperCase())} // Convert input to uppercase
              label="New Option"
              type="text"
              fullWidth
              variant="standard"
              sx={{ mt: 3 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Add
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

RHFCreatableAutocomplete.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  onchange: PropTypes.func,
  options: PropTypes.array.isRequired,
  onAddOption: PropTypes.func.isRequired,
  defaultValue: PropTypes.any,
};
