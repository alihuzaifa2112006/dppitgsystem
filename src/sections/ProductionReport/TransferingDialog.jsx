import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Button,
  Box,
} from '@mui/material';

const options = [
  { value: '1', label: 'Transfer to Store' },
  { value: '2', label: 'Sorted Clips Storage Location' },
  { value: '3', label: 'Transfer To Margasa Section' },
];

// Prop types define karein
const ConfirmationDialog = ({ open, onClose, onConfirm }) => {
  const [selectedValue, setSelectedValue] = useState('');

  const handleRadioChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleSave = () => {
    if (selectedValue) {
      onConfirm(selectedValue);
      onClose();
      setSelectedValue('');
    }
  };

  const handleCancel = () => {
    onClose();
    setSelectedValue('');
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Select Option</DialogTitle>
      <DialogContent>
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend">Please choose an option:</FormLabel>
          <RadioGroup value={selectedValue} onChange={handleRadioChange} sx={{ mt: 2 }}>
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="error">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={!selectedValue}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Prop types validation add karein
ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default ConfirmationDialog;
