import React, { useMemo, useEffect } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router';
import { Box, Card, Grid, Stack, Button, Typography, Container } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import FormProvider, { RHFTextField, RHFRadioGroup } from 'src/components/hook-form';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { Post, Put } from 'src/api/apibasemethods';
import PropTypes from 'prop-types';

export default function BuyingDepartmentForm({ currentData }) {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const BuyingDepartmentSchema = Yup.object().shape({
    DepartmentName: Yup.string().required('Department Name is required'),
    IsActive: Yup.boolean().required('Status is required'),
  });

  const defaultValues = useMemo(
    () => ({
      DepartmentName: currentData?.DepartmentName || currentData?.Name || '',
      IsActive: currentData?.IsActive !== undefined ? currentData.IsActive : true,
    }),
    [currentData]
  );

  const methods = useForm({
    resolver: yupResolver(BuyingDepartmentSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (currentData) {
      reset(defaultValues);
    }
  }, [currentData, reset, defaultValues]);

  const onSubmit = handleSubmit(
    async (data) => {
      try {
        const payload = {
          DepartmentName: data.DepartmentName,
          IsActive: String(data.IsActive) === 'true' || data.IsActive === true,
        };

        let response;
        if (currentData) {
          payload.DepartmentId = currentData?.DepartmentId || currentData?.BuyingDepartmentId || currentData?.Id || 0;
          response = await Put('Department/Update', payload);
        } else {
          response = await Post('Department/Create', payload);
        }

        if (response.status === 200) {
          enqueueSnackbar(currentData ? 'Buying Department updated successfully!' : 'Buying Department created successfully!');
          navigate(paths.dashboard.Powertool.BuyingDepartment.root);
        } else {
          enqueueSnackbar(response?.data?.Message || 'Something went wrong', { variant: 'error' });
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(error?.response?.data?.Message || 'Error saving Buying Department', { variant: 'error' });
      }
    },
    (errors) => {
      const errorMessages = Object.values(errors).map((err) => err.message);
      if (errorMessages.length > 0) {
        enqueueSnackbar(errorMessages[0], { variant: 'error' });
      }
    }
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={currentData ? 'Edit Buying Department' : 'Create a new Buying Department'}
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Buying Departments List', href: paths.dashboard.Powertool.BuyingDepartment.root },
          { name: currentData ? 'Edit Buying Department' : 'New Buying Department' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Card sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              DEPARTMENT DETAILS
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                Status:
              </Typography>
              <RHFRadioGroup
                row
                name="IsActive"
                options={[
                  { label: 'Active', value: true },
                  { label: 'Inactive', value: false },
                ]}
              />
            </Stack>
          </Stack>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <RHFTextField name="DepartmentName" label="Department Name *" placeholder="e.g. Casual Wear" />
            </Grid>
          </Grid>

          <Stack direction="row" justifyContent="flex-end" spacing={2} mt={5}>
            <Button variant="outlined" onClick={() => navigate(paths.dashboard.Powertool.BuyingDepartment.root)}>
              Cancel
            </Button>
            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
              {currentData ? 'Update Department' : 'Save Department'}
            </LoadingButton>
          </Stack>
        </Card>
      </FormProvider>
    </Container>
  );
}

BuyingDepartmentForm.propTypes = {
  currentData: PropTypes.object,
};
