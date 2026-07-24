import React, { useState, useEffect } from 'react';
import { Container, Card, TextField, Button, Grid, Stack, Typography, RadioGroup, FormControlLabel, Radio, Box, CircularProgress } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { useRouter, useParams } from 'src/routes/hooks';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';
import { Get, Put } from 'src/api/apibasemethods';
import Iconify from 'src/components/iconify';

export default function TransportModeEditForm() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
  });

  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const [errors, setErrors] = useState({
    name: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Get(`ShipmentMode/GetById?id=${id}`);
        if (response.status === 200 && response.data?.Success) {
          const data = response.data.Data;
          setFormData({
            name: data.Name || '',
            code: data.Code || '',
          });
          setIsActive(data.IsActive);
          setSortOrder(data.SortOrder || 0);
        } else {
          enqueueSnackbar('Failed to fetch Transport Mode.', { variant: 'error' });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        enqueueSnackbar('An error occurred while fetching.', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
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
      name: !formData.name.trim(),
    };

    setErrors(newErrors);

    if (newErrors.name) {
      enqueueSnackbar('Please fill in all required fields.', { variant: 'error' });
      return;
    }

    try {
      const payload = {
        ShipmentModeId: parseInt(id, 10),
        Name: formData.name,
        Code: formData.code,
        SortOrder: sortOrder,
        IsActive: isActive,
      };

      const response = await Put('ShipmentMode/Update', payload);

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('Transport Mode updated successfully!', { variant: 'success' });
        router.push(paths.dashboard.Powertool.TransportMode.root);
      } else {
        enqueueSnackbar('Failed to update Transport Mode.', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error updating transport mode:', error);
      enqueueSnackbar(error.response?.data?.message || 'An error occurred while updating.', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Transport Mode"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Transport Modes List', href: paths.dashboard.Powertool.TransportMode.root },
          { name: 'Edit Transport Mode' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        {/* Form Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Iconify icon="solar:bus-bold" width={24} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {formData.name || 'Edit Transport Mode'}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={2}>
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
          <Grid item xs={12} md={8}>
            <TextField 
              fullWidth 
              label="MODE NAME *" 
              placeholder="e.g. Sea Freight" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              helperText={errors.name ? 'Mode Name is required' : ''}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField 
              fullWidth 
              label="CODE" 
              placeholder="e.g. SEA" 
              name="code"
              value={formData.code}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        <Stack direction="row" justifyContent="flex-end" mt={4}>
          <Button variant="contained" color="primary" onClick={handleUpdate} size="large">Update</Button>
        </Stack>
      </Card>
    </Container>
  );
}
