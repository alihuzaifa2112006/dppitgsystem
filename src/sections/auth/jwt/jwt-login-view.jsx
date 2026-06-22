import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';
import { PATH_AFTER_LOGIN } from 'src/config-global';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import { Get, Post } from 'src/api/apibasemethods';
import { encrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { Link } from '@mui/material';

// ----------------------------------------------------------------------

const ALLOWED_EXTERNAL_DOMAINS = ['cyclohr.scmcloud.online'];

export const navigateToExternalHR = (userCode, password) => {
  try {
    const baseUrl = 'https://cyclohr.scmcloud.online/login.aspx';
    const url = new URL(baseUrl);

    // Validate domain
    if (!ALLOWED_EXTERNAL_DOMAINS.includes(url.hostname)) {
      throw new Error('Invalid external domain');
    }

    // Set parameters securely
    url.searchParams.set('UserCode', userCode);
    url.searchParams.set('PassWord', password);

    window.location.href = url.toString();
  } catch (error) {
    console.error('Navigation error:', error);
    // Handle error appropriately
  }
};

export default function JwtLoginView() {
  const { login } = useAuthContext();

  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');
  const [loginInfo, setLoginInfo] = useState({
    // Agency: 'Ashtex'
  });

  // // const loginType = [
  //   { id: 1, name: 'Supply Chain' },
  //   { id: 2, name: 'HRM' },
  // ];

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();

  const LoginUser = async () => { };

  const LoginSchema = Yup.object().shape({
    userCode: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
    LoginTo: Yup.object().required('Login to is required'),
  });

  const defaultValues = {
    userCode: '',
    password: '',
    LoginTo: { id: 1, name: 'Supply Chain' } || null,
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async () => {
    try {
      // if (values?.LoginTo?.id === 2) {
      //   const res = await Post('auth/login', {
      //     UserCode: loginInfo.UserCode,
      //     Password: loginInfo.Password,
      //   });
      //   if (res.status === 200) {
      //     window.location.href = `https://cyclohr.scmcloud.online/login.aspx?UserCode=${loginInfo?.UserCode}&PassWord=${loginInfo?.Password}`;
      //   } else if (res.status === 401) {
      //     setErrorMsg('Incorrect Username or Password');
      //   }
      //   return;
      // }
      // const encryptedUserCode = encodeURIComponent(encrypt(loginInfo.UserCode));
      // const encryptedPassword = encodeURIComponent(encrypt(loginInfo.Password));
      // const encryptedAgencyName = encodeURIComponent(encrypt(loginInfo.Agency));
      // console.log(loginInfo);

      const response = await Post('auth/login', {
        UserCode: loginInfo.UserCode,
        Password: loginInfo.Password,
        APPMODULE_ID: values?.LoginTo?.id,
      });

      if (response.status === 200) {
        const loginTime = new Date().getTime();
        localStorage.setItem('UserData', JSON.stringify(response.data));

        localStorage.setItem('loginTime', loginTime);
        router.push(returnTo || PATH_AFTER_LOGIN);
      } else if (response.status === 401) {
        setErrorMsg('Incorrect Username or Password');
      }
    } catch (error) {
      if (error.response.status === 401) {
        setErrorMsg('Incorrect Username or Password');
      } else setErrorMsg('An error occurred. Please try again.');
      console.log(error);
      reset();
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <img src="/logo/Logo.png" alt="logo" style={{ width: 120, display: 'block' }} />

      <Typography variant="h4">Sign in</Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <RHFTextField
        InputLabelProps={{
          shrink: true,
        }}
        name="userCode"
        label="Username"
        onchange={(e) => setLoginInfo({ ...loginInfo, UserCode: e.target.value })}
      />

      <RHFTextField
        name="password"
        label="Password"
        InputLabelProps={{
          shrink: true,
        }}
        type={password.value ? 'text' : 'password'}
        onchange={(e) => setLoginInfo({ ...loginInfo, Password: e.target.value })}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* <RHFAutocomplete
        // size="small"
        name="LoginTo"
        label="Login To"
        placeholder="Choose an option"
        fullWidth
        options={loginType || ''}
        getOptionLabel={(option) => option?.name || null}
      /> */}
      {/* href={paths.auth.jwt.forgot} */}
      {/* <Link
        component={RouterLink}
        href={paths.auth.jwt.forgot}
        variant="body2"
        color="inherit"
        underline="always"
        sx={{ alignSelf: 'flex-end' }}
      >
        Forgot password?
      </Link> */}
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

      {/* <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">New to Cyclo?</Typography>

        <Link component={RouterLink} href={paths.auth.jwt.registerOrg} variant="subtitle2">
          Create an Organization
        </Link>
      </Stack> */}

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

      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>
    </>
  );
}
