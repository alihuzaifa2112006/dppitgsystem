import React, { useMemo } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router';
import { Box, Card, Grid, Stack, Button, Typography, Container } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import PropTypes from 'prop-types';
import { Post, Put } from 'src/api/apibasemethods';

export default function BankForm({ currentData }) {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const BankSchema = Yup.object().shape({
    TitleOfAccount: Yup.string().required('Title of Account is required'),
    BankName: Yup.string().required('Bank Name is required'),
    Branch: Yup.string().required('Branch is required'),
    AccountNumber: Yup.string().required('Account Number is required'),
    SwiftIban: Yup.string(),
  });

  const defaultValues = useMemo(() => ({
    TitleOfAccount: currentData?.TitleOfAccount || '',
    BankName: currentData?.BankName || '',
    Branch: currentData?.Branch || '',
    AccountNumber: currentData?.AccountNumber || '',
    SwiftIban: currentData?.SwiftIban || '',
  }), [currentData]);

  const methods = useForm({
    resolver: yupResolver(BankSchema),
    defaultValues,
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const onSubmit = handleSubmit(
    async (data) => {
      try {
        const payload = {
          TitleOfAccount: data.TitleOfAccount,
          BankName: data.BankName,
          Branch: data.Branch || '',
          AccountNumber: data.AccountNumber || '',
          SwiftIban: data.SwiftIban || '',
          IsActive: true,
        };

        let response;
        if (currentData) {
          payload.BankAccountId = currentData?.BankAccountId || currentData?.Id || 0;
          response = await Put('Bank/Update', payload);
        } else {
          response = await Post('Bank/Create', payload);
        }

        if (response.status === 200) {
          enqueueSnackbar(currentData ? 'Bank updated successfully!' : 'Bank created successfully!');
          navigate(paths.dashboard.Powertool.Bank.root);
        } else {
          enqueueSnackbar(response?.data?.Message || 'Something went wrong', { variant: 'error' });
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(error?.response?.data?.Message || 'Error saving Bank', { variant: 'error' });
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
        heading={currentData ? 'Edit Bank Account' : 'Add Bank Account'}
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Banks', href: paths.dashboard.Powertool.Bank.root },
          { name: currentData ? 'Edit Bank Account' : 'Add Bank Account' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
        icon={<Iconify icon="mingcute:bank-line" width={32} sx={{ mr: 1 }} />}
      />

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Card sx={{ p: 4, borderRadius: '16px', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
          <Box mb={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <RHFTextField name="TitleOfAccount" label="Title of Account *" placeholder="Account holder name" />
              </Grid>
              <Grid item xs={12}>
                <RHFTextField name="BankName" label="Bank Name *" placeholder="e.g. DBS Bank (Hong Kong) Ltd" />
              </Grid>
              <Grid item xs={12}>
                <RHFTextField name="Branch" label="Branch *" placeholder="Branch name" />
              </Grid>
              <Grid item xs={12}>
                <RHFTextField name="AccountNumber" label="Account Number *" placeholder="Account number" />
              </Grid>
              <Grid item xs={12}>
                <RHFTextField name="SwiftIban" label="SWIFT / IBAN" placeholder="SWIFT or IBAN code" />
              </Grid>
            </Grid>
          </Box>
          <Stack direction="row" justifyContent="flex-end" spacing={2} mt={5}>
            <Button variant="outlined" onClick={() => navigate(paths.dashboard.Powertool.Bank.root)}>Cancel</Button>
            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting}>
              {currentData ? 'Update Bank' : 'Save Bank'}
            </LoadingButton>
          </Stack>
        </Card>
      </FormProvider>
    </Container>
  );
}

BankForm.propTypes = {
  currentData: PropTypes.object,
};
