import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { Post } from 'src/api/apibasemethods';

// ----------------------------------------------------------------------

export default function JwtRegisterOrgView() {
  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();

  const RegisterSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    companyName: Yup.string().required('Company Name is required'),
    brn: Yup.string().required('Business Registration Number (BRN/Tax ID) is required'),
    facilityLocation: Yup.string().required('Facility Location is required'),
  });

  const defaultValues = {
    username: '',
    password: '',
    companyName: '',
    brn: '',
    facilityLocation: '',
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMsg('');
      setSuccessMsg('');

      const response = await Post('auth/registerOrg', {
        UserName: data.username,
        Password: data.password,
        CompanyName: data.companyName,
        BRN: data.brn,
        FacilityLocation: data.facilityLocation,
      });

      if (response.status === 200 || response.status === 201) {
        setSuccessMsg('Registration successful! Redirecting to login...');
        setTimeout(() => {
          router.push(paths.auth.jwt.login);
        }, 1500);
      } else if (response.status === 409) {
        setErrorMsg('Username or Company already exists.');
      } else {
        setErrorMsg('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error(error);
      reset();
      if (error?.response?.status === 409) {
        setErrorMsg('Username or Company already exists.');
      } else {
        setErrorMsg(typeof error === 'string' ? error : error.message || 'An error occurred. Please try again.');
      }
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 3 }}>
      <Box
        component="img"
        src="/logo/Logo.png"
        alt="logo"
        sx={{
          width: { xs: 200, sm: 250, md: 300 },
          height: 'auto',
          alignSelf: { xs: 'center', sm: 'flex-start' },
        }}
      />

      <Typography variant="h4" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
        Register your Company
      </Typography>


    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>

      {/* Row 1 — Username full width */}
      <RHFTextField
        name="username"
        label="Username"
        InputLabelProps={{ shrink: true }}
        sx={{ '& .MuiInputBase-root': { height: 56 } }}
      />

      {/* Row 2 — Password full width */}
      <RHFTextField
        name="password"
        label="Password"
        InputLabelProps={{ shrink: true }}
        type={password.value ? 'text' : 'password'}
        sx={{ '& .MuiInputBase-root': { height: 56 } }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Row 3 — Company Name + BRN side by side */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2.5,
        }}
      >
        <RHFTextField
          name="companyName"
          label="Company Name"
          InputLabelProps={{ shrink: true }}
          sx={{ '& .MuiInputBase-root': { height: 56 } }}
        />

        <RHFTextField
          name="facilityLocation"
          label="Facility Location"
          InputLabelProps={{ shrink: true }}
          sx={{ '& .MuiInputBase-root': { height: 56 } }}
        />
      </Box>




      {/* Register button */}
      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        sx={{ height: 52, fontSize: 16 }}
      >
        Register
      </LoadingButton>

      <Stack direction="row" spacing={0.5} justifyContent="center">
        <Typography variant="body2">Already have an account?</Typography>
        <Link href={paths.auth.jwt.login} component={RouterLink} variant="subtitle2">
          Sign in
        </Link>
      </Stack>

    </Stack>
  );

  return (
    <>
      {renderHead}

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {!!successMsg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMsg}
        </Alert>
      )}

      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>
    </>
  );
}