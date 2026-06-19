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
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import { Post } from 'src/api/apibasemethods';
import { countries } from 'src/assets/data';

// ----------------------------------------------------------------------

const ORGANIZATION_TYPES = [
  { id: 1, name: 'Manufacturer' },
  { id: 2, name: 'Supplier' },
  { id: 3, name: 'Retailer' },
  { id: 4, name: 'Distributor' },
  { id: 5, name: 'Exporter' },
  { id: 6, name: 'Importer' },
  { id: 7, name: 'Other' },
];


// ----------------------------------------------------------------------

export default function JwtRegisterOrgView() {
  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();
  const confirmPasswordVisible = useBoolean();

  const RegisterSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
      .required('Confirm Password is required')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
    organizationName: Yup.string().required('Organization Name is required'),
    organizationBusiness: Yup.string().required('Organization Business is required'),
    organizationType: Yup.object().nullable().required('Organization Type is required'),
    country: Yup.object().nullable().required('Country is required'),
  });

  const defaultValues = {
    username: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    organizationBusiness: '',
    organizationType: null,
    country: null,
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
        OrganizationName: data.organizationName,
        OrganizationBusiness: data.organizationBusiness,
        OrganizationType: data.organizationType?.name,
        Country: data.country?.label,
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
    <Stack spacing={1.5} sx={{ mb: 2 }}>
      <Box
        component="img"
        src="/logo/Logo.png"
        alt="logo"
        sx={{
          width: { xs: 180, sm: 220, md: 250 },
          height: 'auto',
          alignSelf: 'flex-start',
        }}
      />

      <Typography variant="h4" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
        Register your Organization
      </Typography>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>

      {/* Row 1 — Organization Name + Organization Business side by side */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2.5,
        }}
      >
        <RHFTextField
          name="organizationName"
          label="Organization Name"
          InputLabelProps={{ shrink: true }}
          sx={{ '& .MuiInputBase-root': { height: 56 } }}
        />

        <RHFTextField
          name="organizationBusiness"
          label="Organization Business"
          InputLabelProps={{ shrink: true }}
          sx={{ '& .MuiInputBase-root': { height: 56 } }}
        />
      </Box>

      {/* Row 2 — Organization Type + Country side by side */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2.5,
        }}
      >
        <RHFAutocomplete
          name="organizationType"
          label="Organization Type"
          placeholder="Select Organization Type"
          fullWidth
          options={ORGANIZATION_TYPES}
          getOptionLabel={(option) => option?.name || ''}
          isOptionEqualToValue={(option, value) => option?.id === value?.id}
        />

        <RHFAutocomplete
          name="country"
          label="Country"
          placeholder="Select Country"
          fullWidth
          options={countries.filter((c) => c.label)}
          getOptionLabel={(option) => option?.label || ''}
          isOptionEqualToValue={(option, value) => option?.code === value?.code}
        />
      </Box>

      {/* Row 3 — Username full width */}
      <RHFTextField
        name="username"
        label="Username"
        InputLabelProps={{ shrink: true }}
        sx={{ '& .MuiInputBase-root': { height: 56 } }}
      />

      {/* Row 4 — Password + Confirm Password side by side */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2.5,
        }}
      >
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
                  <Iconify icon={password.value ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <RHFTextField
          name="confirmPassword"
          label="Confirm Password"
          InputLabelProps={{ shrink: true }}
          type={confirmPasswordVisible.value ? 'text' : 'password'}
          sx={{ '& .MuiInputBase-root': { height: 56 } }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={confirmPasswordVisible.onToggle} edge="end">
                  <Iconify icon={confirmPasswordVisible.value ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
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