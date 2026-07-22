import React, { useState, useEffect } from 'react';
import { Container, Card, TextField, Button, Grid, Stack, Typography, RadioGroup, FormControlLabel, Radio, Box, LinearProgress } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { useRouter, useParams } from 'src/routes/hooks';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';
import { Get, Put } from 'src/api/apibasemethods';

export default function PaymentModeEditForm() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    code: '',
    modeName: '',
    description: '',
    sortOrder: 0,
  });

  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState({
    code: false,
    modeName: false,
  });

  // Fetch Existing Payment Mode Data
  useEffect(() => {
    const fetchPaymentMode = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await Get(`PaymentMode/GetById?id=${id}`);
        const resData = response.data?.Data || response.data;
        
        if (response.status === 200 && resData) {
          setFormData({
            code: resData.Code || '',
            modeName: resData.Name || '',
            description: resData.Description || '',
            sortOrder: resData.SortOrder || 0,
          });
          setIsActive(resData.IsActive);
        } else {
          enqueueSnackbar('Failed to fetch data.', { variant: 'error' });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        enqueueSnackbar('An error occurred while fetching data.', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentMode();
  }, [id, enqueueSnackbar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleUpdate = async () => {
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
        PaymentModeId: Number(id),
        Code: formData.code,
        Name: formData.modeName,
        Description: formData.description,
        SortOrder: formData.sortOrder,
        IsActive: isActive,
      };

      const response = await Put('PaymentMode/Update', payload);

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('Payment Mode updated successfully!', { variant: 'success' });
        router.push(paths.dashboard.Powertool.PaymentMode.root);
      } else {
        enqueueSnackbar('Failed to update Payment Mode.', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error updating payment mode:', error);
      enqueueSnackbar(error.response?.data?.message || 'An error occurred while updating.', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Payment Mode"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Payment Modes List', href: paths.dashboard.Powertool.PaymentMode.root },
          { name: 'Edit Payment Mode' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <LinearProgress sx={{ maxWidth: 300, mx: 'auto', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">Loading data...</Typography>
          </Box>
        ) : (
          <>
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
              <Button variant="contained" color="primary" onClick={handleUpdate}>Update</Button>
            </Stack>
          </>
        )}
      </Card>
    </Container>
  );
}
