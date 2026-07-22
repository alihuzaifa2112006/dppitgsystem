import React, { useState } from 'react';
import { Container, Card, TextField, Button, Grid, Stack, Typography, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { useRouter } from 'src/routes/hooks';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';
import { Post } from 'src/api/apibasemethods';

export default function TransactionTypeForm() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const [formData, setFormData] = useState({
    typeName: '',
    code: '',
    description: '',
  });

  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState({
    typeName: false,
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
      typeName: !formData.typeName.trim(),
    };

    setErrors(newErrors);

    if (newErrors.typeName) {
      enqueueSnackbar('Please fill in all required fields.', { variant: 'error' });
      return;
    }

    try {
      const payload = {
        Name: formData.typeName,
        Code: formData.code,
        Description: formData.description,
        SortOrder: 0,
        IsActive: isActive,
      };

      const response = await Post('TransactionType/Create', payload);

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('Transaction Type saved successfully!', { variant: 'success' });
        router.push(paths.dashboard.Powertool.TransactionType.root);
      } else {
        enqueueSnackbar('Failed to save Transaction Type.', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error saving transaction type:', error);
      enqueueSnackbar(error.response?.data?.message || 'An error occurred while saving.', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new Transaction Type"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Transaction Types List', href: paths.dashboard.Powertool.TransactionType.root },
          { name: 'New Transaction Type' },
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
          <Grid item xs={12} md={8}>
            <TextField 
              fullWidth 
              label="TYPE NAME *" 
              placeholder="e.g. Trade" 
              name="typeName"
              value={formData.typeName}
              onChange={handleChange}
              error={errors.typeName}
              helperText={errors.typeName ? 'Type Name is required' : ''}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField 
              fullWidth 
              label="CODE" 
              placeholder="e.g. TRADE" 
              name="code"
              value={formData.code}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <TextField 
              fullWidth 
              label="DESCRIPTION" 
              placeholder="Optional description" 
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        <Stack direction="row" justifyContent="flex-end" mt={3}>
          <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
        </Stack>
      </Card>
    </Container>
  );
}
