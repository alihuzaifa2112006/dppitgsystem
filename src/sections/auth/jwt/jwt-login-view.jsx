import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';

import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';


import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { Post } from 'src/api/apibasemethods';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export default function JwtLoginView() {
  const router = useRouter();

  const passwordVisibility = useBoolean();
  const [errorMsg, setErrorMsg] = useState('');

  const LoginSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    username: '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // FIX: Remove handleSubmit wrapper - use it directly
  const onSubmit = async (data) => {
    try {
      setErrorMsg('');

      const response = await Post('auth/login', {
        username: data.username,
        password: data.password,
      });

      // Check if response has data and status
      if (response?.status === 200 || response?.status === 201) {
        const loginTime = new Date().getTime();

        // API response: { Success, Message, Data: { token, company, ... } }
        // We no longer save UserData here. It will be saved after OTP verification.
        localStorage.setItem('loginTime', loginTime);

        // Save the temporary email for display on verification screen
        const email = response?.data?.Data?.company?.Email || response?.data?.company?.Email || '';
        if (email) {
          localStorage.setItem('tempLoginEmail', email);
        }

        // Don't call context login() yet — redirect to OTP verification first
        // Context login will happen after OTP is verified
        router.push(paths.auth.jwt.verify);
      } else {
        setErrorMsg('Incorrect Username or Password');
      }
    } catch (error) {
      console.error('Login error:', error);

      // Better error handling
      if (error?.response?.status === 401) {
        setErrorMsg('Incorrect Username or Password');
      } else if (error?.response?.status === 404) {
        setErrorMsg('Server endpoint not found. Please check your API URL.');
      } else if (error?.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg(error?.message || 'An error occurred. Please try again.');
      }
      reset();
    }
  };

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <img src="/logo/Logo.png" alt="logo" style={{ width: 120, display: 'block' }} />
      <Typography variant="h4">Sign in</Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <RHFTextField
        name="username"
        label="Username"
        InputLabelProps={{ shrink: true }}
      />

      <RHFTextField
        name="password"
        label="Password"
        InputLabelProps={{ shrink: true }}
        type={passwordVisibility.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={passwordVisibility.onToggle} edge="end">
                <Iconify icon={passwordVisibility.value ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Stack
        direction="row"
        spacing={0.5}
        justifyContent={{ xs: 'center', sm: 'flex-start' }}
      >
        <Typography variant="body2">Don&apos;t have an account?</Typography>
        <Link href={paths.auth.jwt.registerOrg} component={RouterLink} variant="subtitle2">
          Sign up
        </Link>
      </Stack>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Login
      </LoadingButton>
    </Stack>
  );

  return (
    <>
      {renderHead}

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {/* FIX: Use handleSubmit directly */}
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        {renderForm}
      </FormProvider>
    </>
  );
}