import React, { useState } from 'react';
import { Container, Card, TextField, Button, Grid, Stack } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';

export default function TransactionTypeForm() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    typeName: '',
    code: '',
    description: '',
    sortOrder: 0,
  });

  const [errors, setErrors] = useState({
    typeName: false,
    sortOrder: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSave = () => {
    const newErrors = {
      typeName: !formData.typeName.trim(),
      sortOrder: formData.sortOrder === '' || formData.sortOrder === null || Number(formData.sortOrder) <= 0,
    };

    setErrors(newErrors);

    if (newErrors.typeName || newErrors.sortOrder) {
      enqueueSnackbar('Please fill in all required fields.', { variant: 'error' });
      return;
    }

    enqueueSnackbar('Transaction Type saved successfully!', { variant: 'success' });
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
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              label="DESCRIPTION" 
              placeholder="Optional description" 
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              label="SORT ORDER *" 
              placeholder="0" 
              type="number" 
              name="sortOrder"
              value={formData.sortOrder}
              onChange={handleChange}
              error={errors.sortOrder}
              helperText={errors.sortOrder ? 'Sort Order must be greater than 0' : ''}
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
