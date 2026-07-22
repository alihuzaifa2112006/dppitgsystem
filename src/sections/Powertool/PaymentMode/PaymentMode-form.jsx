import React, { useState } from 'react';
import { Container, Card, TextField, Button, Grid, Stack, Typography, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { useRouter } from 'src/routes/hooks';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';
import { Post } from 'src/api/apibasemethods';

export default function PaymentModeForm() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const [formData, setFormData] = useState({
    code: '',
    modeName: '',
    description: '',
  });

  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState({
    code: false,
    modeName: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSave = async () => {
    const newErrors = {
      code: !formData.code.trim(),
      modeName: !formData.modeName.trim(),
    };

    setErrors(newErrors);

    if (newErrors.code || newErrors.modeName) {
      enqueueSnackbar('Please fill in all required fields.', { variant: 'error' });
      return;
    }

    try {
      const payload = {
        Code: formData.code,
        Name: formData.modeName,
        Description: formData.description,
        SortOrder: 0,
        IsActive: isActive,
      };

      const response = await Post('PaymentMode/Create', payload);

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('Payment Mode saved successfully!', { variant: 'success' });
        router.push(paths.dashboard.Powertool.PaymentMode.root);
      } else {
        enqueueSnackbar('Failed to save Payment Mode.', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error saving payment mode:', error);
      enqueueSnackbar(error.response?.data?.message || 'An error occurred while saving.', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Payment Mode"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Payment Modes List', href: paths.dashboard.Powertool.PaymentMode.root },
          { name: 'New Payment Mode' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mb: 3 }}>
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

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              label="CODE *" 
              placeholder="e.g. TT" 
              name="code"
              value={formData.code}
              onChange={handleChange}
              error={errors.code}
              helperText={errors.code ? 'Code is required' : ''}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              label="MODE NAME *" 
              placeholder="e.g. Telegraphic Transfer" 
              name="modeName"
              value={formData.modeName}
              onChange={handleChange}
              error={errors.modeName}
              helperText={errors.modeName ? 'Mode Name is required' : ''}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <TextField 
              fullWidth 
              label="DESCRIPTION" 
              placeholder="Brief description of this payment mode" 
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
          <Button variant="outlined" onClick={() => router.push(paths.dashboard.Powertool.PaymentMode.root)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
        </Stack>
      </Card>
    </Container>
  );
}
