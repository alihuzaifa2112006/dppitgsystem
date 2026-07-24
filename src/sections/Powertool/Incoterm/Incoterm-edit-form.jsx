import React, { useState, useEffect } from 'react';
import { Container, Card, TextField, Button, Grid, Stack, Typography, RadioGroup, FormControlLabel, Radio, Box, MenuItem, CircularProgress } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { useRouter, useParams } from 'src/routes/hooks';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';
import { Get, Put } from 'src/api/apibasemethods';
import Iconify from 'src/components/iconify';

export default function IncotermEditForm() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    code: '',
    group: '',
    name: '',
    description: '',
    transportMode: '',
    sortOrder: 0,
  });

  const [isActive, setIsActive] = useState(true);
  const [groups, setGroups] = useState([]);
  const [transportModes, setTransportModes] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchDropdownsAndData = async () => {
      try {
        const [groupRes, modeRes] = await Promise.all([
          Get('IncotermGroup/GetAll'),
          Get('ShipmentMode/GetAll')
        ]);
        if (groupRes.status === 200 && groupRes.data?.Data) {
          setGroups(groupRes.data.Data);
        }
        if (modeRes.status === 200 && modeRes.data?.Data) {
          setTransportModes(modeRes.data.Data);
        }

        if (id) {
          const response = await Get(`Incoterm/GetById?id=${id}`);
          if (response.status === 200 && response.data?.Success) {
            const data = response.data.Data;
            setFormData({
              code: data.Code || '',
              group: data.Group || '',
              name: data.Name || '',
              description: data.Description || '',
              transportMode: data.TransportMode || '',
              sortOrder: data.SortOrder || 0,
            });
            setIsActive(data.IsActive);
          } else {
            enqueueSnackbar('Failed to fetch Incoterm.', { variant: 'error' });
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        enqueueSnackbar('An error occurred while fetching.', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownsAndData();
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
      group: !formData.group,
      name: !formData.name.trim(),
    };
    setErrors(newErrors);

    if (newErrors.code || newErrors.group || newErrors.name) {
      enqueueSnackbar('Please fill in all required fields.', { variant: 'error' });
      return;
    }

    try {
      const payload = {
        IncotermId: parseInt(id, 10),
        Code: formData.code,
        Name: formData.name,
        Group: formData.group,
        Description: formData.description,
        TransportMode: formData.transportMode,
        SortOrder: parseInt(formData.sortOrder, 10) || 0,
        IsActive: isActive,
      };

      const response = await Put('Incoterm/Update', payload);

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('Incoterm updated successfully!', { variant: 'success' });
        router.push(paths.dashboard.Powertool.Incoterm.root);
      } else {
        enqueueSnackbar('Failed to update Incoterm.', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error updating incoterm:', error);
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
        heading="Edit Incoterm"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Incoterms List', href: paths.dashboard.Powertool.Incoterm.root },
          { name: 'Edit Incoterm' },
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
              <Iconify icon="solar:document-text-bold" width={24} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {formData.name || 'Edit Incoterm'}
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
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              label="CODE *" 
              placeholder="FOB" 
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
              select
              label="GROUP *"
              name="group"
              value={formData.group}
              onChange={handleChange}
              error={errors.group}
              helperText={errors.group ? 'Group is required' : ''}
            >
              {groups.map((g) => (
                <MenuItem key={g.IncotermGroupId || g.Code} value={g.Display || g.Name}>
                  {g.Display || g.Name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField 
              fullWidth 
              label="TERM NAME *" 
              placeholder="Free On Board" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              helperText={errors.name ? 'Term Name is required' : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField 
              fullWidth 
              multiline
              rows={4}
              label="DESCRIPTION" 
              placeholder="Description..." 
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="TRANSPORT MODE"
              name="transportMode"
              value={formData.transportMode}
              onChange={handleChange}
            >
              {transportModes.map((m) => (
                <MenuItem key={m.Id || m.ShipmentModeId} value={m.Name}>
                  {m.Name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField 
              fullWidth 
              type="number"
              label="SORT ORDER" 
              placeholder="0" 
              name="sortOrder"
              value={formData.sortOrder}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        <Stack direction="row" justifyContent="flex-end" mt={4}>
          <Button variant="contained" color="primary" onClick={handleUpdate} size="large">Update Incoterm</Button>
        </Stack>
      </Card>
    </Container>
  );
}
