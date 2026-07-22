import React, { useState, useEffect } from 'react';
import { Container, Card, TextField, Button, Grid, Stack, Typography, RadioGroup, FormControlLabel, Radio, Box, Autocomplete } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { useRouter } from 'src/routes/hooks';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';
import { Get, Post } from 'src/api/apibasemethods';

export default function PaymentTermForm() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const [transactionTypes, setTransactionTypes] = useState([]);
  
  const [formData, setFormData] = useState({
    transactionType: null,
    paymentTerm: '',
  });

  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState({
    transactionType: false,
    paymentTerm: false,
  });

  useEffect(() => {
    const fetchTransactionTypes = async () => {
      try {
        const res = await Get('TransactionMode/GetAll');
        if (res.status === 200) {
          setTransactionTypes(res?.data?.Data || res?.data || []);
        }
      } catch (error) {
        console.error('Error fetching transaction types:', error);
      }
    };
    fetchTransactionTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSave = async () => {
    const newErrors = {
      transactionType: !formData.transactionType,
      paymentTerm: !formData.paymentTerm.trim(),
    };

    setErrors(newErrors);

    if (newErrors.transactionType || newErrors.paymentTerm) {
      enqueueSnackbar('Please fill in all required fields.', { variant: 'error' });
      return;
    }

    try {
      const payload = {
        TransactionModeId: formData.transactionType?.Id || formData.transactionType?.TransactionModeId || formData.transactionType?.TransactionTypeId || 0,
        Name: formData.paymentTerm,
        SortOrder: 0,
        IsActive: isActive,
      };

      const response = await Post('PaymentTerm/Create', payload);

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('Payment Term saved successfully!', { variant: 'success' });
        router.push(paths.dashboard.Powertool.PaymentTerm.root);
      } else {
        enqueueSnackbar('Failed to save Payment Term.', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error saving payment term:', error);
      enqueueSnackbar(error.response?.data?.message || 'An error occurred while saving.', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Payment Term"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Payment Terms List', href: paths.dashboard.Powertool.PaymentTerm.root },
          { name: 'New Payment Term' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <Box mb={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              BASIC INFORMATION
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                Status:
              </Typography>
              <RadioGroup
                row
                value={isActive ? 'true' : 'false'}
                onChange={(e) => setIsActive(e.target.value === 'true')}
              >
                <FormControlLabel value="true" control={<Radio color="primary" />} label="Active" />
                <FormControlLabel value="false" control={<Radio color="error" />} label="Inactive" />
              </RadioGroup>
            </Stack>
          </Stack>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={transactionTypes}
                getOptionLabel={(option) => option?.Name || option?.TypeName || ''}
                value={formData.transactionType}
                onChange={(event, newValue) => {
                  setFormData((prev) => ({ ...prev, transactionType: newValue }));
                  if (errors.transactionType) setErrors((prev) => ({ ...prev, transactionType: false }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Transaction Type *"
                    placeholder="— Select Transaction Type —"
                    error={errors.transactionType}
                    helperText={errors.transactionType ? 'Transaction Type is required' : ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField 
                fullWidth 
                label="Payment Term *" 
                placeholder="e.g. Net 30 Days" 
                name="paymentTerm"
                value={formData.paymentTerm}
                onChange={handleChange}
                error={errors.paymentTerm}
                helperText={errors.paymentTerm ? 'Payment Term is required' : ''}
              />
            </Grid>
          </Grid>
        </Box>

        <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
          <Button variant="outlined" onClick={() => router.push(paths.dashboard.Powertool.PaymentTerm.root)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
        </Stack>
      </Card>
    </Container>
  );
}
