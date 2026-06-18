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

export default function RHFEditableAutocomplete({
  name,
  label,
  placeholder,
  onchange,
  options,
  onAddOption,
  defaultValue,
  value, // Controlled value from the parent
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
    const normalizedValue = dialogValue.trim().toUpperCase();

    if (!normalizedValue) {
      enqueueSnackbar('Please enter an option', { variant: 'warning' });
      return;
    }

    if (options.some((option) => option.label.trim().toUpperCase() === normalizedValue)) {
      enqueueSnackbar('This option already exists', { variant: 'error' });
      return;
    }

    setValue(name, null, { shouldValidate: true });
    onAddOption(normalizedValue);
    resetField(name);
    handleClose();
  };

  return (
    <>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue || null}
        render={({ field, fieldState: { error } }) => (
          <Autocomplete
            {...field}
            value={value  || null} // Ensure the controlled value is applied
            id={`autocomplete-${name}`}
            autoHighlight={!multiple}
            disableCloseOnSelect={multiple}
            options={options || []}
            onChange={(event, newValue) => {
              if (newValue?.inputValue) {
                setValue(name, null, { shouldValidate: true });
                setOpen(true);
                setDialogValue(newValue.inputValue.toUpperCase());
              } else {
                const transformedValue = newValue
                  ? { ...newValue, label: newValue.label.toUpperCase() }
                  : null;
                setValue(name, transformedValue, { shouldValidate: true });
                if (onchange) onchange(transformedValue);
              }
            }}
            filterOptions={(optionsList, params) => {
              const filtered = filter(optionsList, params);
              const { inputValue } = params;

              if (inputValue && !optionsList.some(
                  (option) => option.label.toUpperCase() === inputValue.toUpperCase()
              )) {
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
              Did you miss any options in our list? Please add it!
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              value={dialogValue}
              onChange={(e) => setDialogValue(e.target.value.toUpperCase())}
              label="New Option"
              fullWidth
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              Add
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}


RHFEditableAutocomplete.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  onchange: PropTypes.func,
  options: PropTypes.array.isRequired,
  onAddOption: PropTypes.func.isRequired,
  defaultValue: PropTypes.any,
  value:  PropTypes.any,
};
