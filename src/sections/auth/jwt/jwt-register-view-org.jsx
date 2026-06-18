import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

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

import { useAuthContext } from 'src/auth/hooks';
import { PATH_AFTER_LOGIN } from 'src/config-global';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField, RHFUpload } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function JwtRegisterOrgView() {
  const { register } = useAuthContext();

  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');
  const [logo, setLogo] = useState(null);

  const password = useBoolean();

  const RegisterSchema = Yup.object().shape({
    OrgName: Yup.string().required('First name required'),
    OrgUserName: Yup.string().required('Last name required'),
    OrgAddress: Yup.string().required('Address is required'),
    OrgUserPwd: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    OrgName: '',
    OrgUserName: '',
    OrgAddress: '',
    OrgUserPwd: '',
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const handleLogo = (acceptedFiles) => {
    const newFile = acceptedFiles[0];
    if (newFile) {
      newFile.preview = URL.createObjectURL(newFile);
      setLogo(newFile); // Store the uploaded file in state
      setValue('logo', newFile);
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    console.log('data', data);
    try {
      // await register?.(data.OrgAddress, data.OrgUserPwd, data.OrgName, data.OrgUserName);
      // router.push(returnTo || PATH_AFTER_LOGIN);
    } catch (error) {
      console.error(error);
      reset();
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
      <Typography variant="h4">Get started absolutely free</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2"> Already have an account? </Typography>

        <Link href={paths.auth.jwt.login} component={RouterLink} variant="subtitle2">
          Sign in
        </Link>
      </Stack>
    </Stack>
  );

  const renderTerms = (
    <Typography
      component="div"
      sx={{
        mt: 2.5,
        textAlign: 'center',
        typography: 'caption',
        color: 'text.secondary',
      }}
    >
      {'By signing up, I agree to '}
      <Link underline="always" color="text.primary">
        Terms of Service
      </Link>
      {' and '}
      <Link underline="always" color="text.primary">
        Privacy Policy
      </Link>
      .
    </Typography>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      {/* <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}> */}
      <RHFTextField name="OrgName" label="Oranization name" />
      <RHFTextField name="OrgAddress" label="Address" />
      <RHFTextField name="OrgUserName" label="User name" />
      {/* </Stack> */}

      <RHFTextField
        name="OrgUserPwd"
        label="Password"
        type={password.value ? 'text' : 'password'}
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
      <RHFUpload
        title="Logo"
        name="logo"
        file={logo}
        accept={{ 'image/*': [] }}
        onDrop={handleLogo}
        onDelete={() => setLogo(null)}
      />

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Create Organization
      </LoadingButton>
    </Stack>
  );

  return (
    <>
      {renderHead}

      {!!errorMsg && (
        <Alert severity="error" sx={{ m: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>

      {renderTerms}
    </>
  );
}
