import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
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

const STEPS = ['Organization', 'Account'];

// ----------------------------------------------------------------------

export default function JwtRegisterOrgView() {
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();
  const confirmPasswordVisible = useBoolean();

  const RegisterSchema = Yup.object().shape({
    organizationName: Yup.string().required('Organization Name is required'),
    organizationBusiness: Yup.string().required('Organization Description is required'),
    organizationType: Yup.object().nullable().required('Organization Type is required'),
    country: Yup.object().nullable().required('Country is required'),
    username: Yup.string().required('Username is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
      .required('Confirm Password is required')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
  });

  const defaultValues = {
    organizationName: '',
    organizationBusiness: '',
    organizationType: null,
    country: null,
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });

  const {
    reset,
    trigger,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // Step 1 field validation before proceeding
  const handleNext = async () => {
    const step1Fields = ['organizationName', 'organizationBusiness', 'organizationType', 'country'];
    const isValid = await trigger(step1Fields);
    if (isValid) {
      setActiveStep(1);
    }
  };

  const handleBack = () => {
    setActiveStep(0);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMsg('');
      setSuccessMsg('');

      const response = await Post('auth/registerOrg', {
        UserName: data.username,
        Email: data.email,
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

      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Step {activeStep + 1} of 2 —{' '}
        <Typography component="span" variant="subtitle2" sx={{ color: 'primary.main' }}>
          {STEPS[activeStep]}
        </Typography>
      </Typography>
    </Stack>
  );

  const renderStepper = (
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      sx={{
        mb: 3,
        '& .MuiStepConnector-line': {
          borderColor: 'divider',
        },
        '& .MuiStepLabel-label': {
          fontSize: '0.8rem',
          fontWeight: 600,
        },
        '& .MuiStepIcon-root': {
          color: '#c4cdd5',
          '&.Mui-active': {
            color: '#103996',
          },
          '&.Mui-completed': {
            color: '#103996',
          },
        },
        '& .MuiStepLabel-label.Mui-active': {
          color: '#103996',
          fontWeight: 700,
        },
        '& .MuiStepLabel-label.Mui-completed': {
          color: '#103996',
        },
      }}
    >
      {STEPS.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );

  const renderStep1 = (
    <Stack spacing={2.5}>
      {/* Organization Name */}
      <RHFTextField
        name="organizationName"
        label="Organization Name"
        InputLabelProps={{ shrink: true }}
        sx={{ '& .MuiInputBase-root': { height: 56 } }}
      />

      {/* Organization Description */}
      <RHFTextField
        name="organizationBusiness"
        label="Organization Description"
        InputLabelProps={{ shrink: true }}
        sx={{ '& .MuiInputBase-root': { height: 56 } }}
      />

      {/* Organization Type + Country side by side */}
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

      {/* Next button */}
      <Button
        fullWidth
        size="large"
        variant="contained"
        color="inherit"
        onClick={handleNext}
        endIcon={<Iconify icon="solar:arrow-right-linear" width={18} />}
        sx={{ height: 46, fontSize: 15 }}
      >
        Continue
      </Button>

      <Stack direction="row" spacing={0.5} justifyContent="center">
        <Typography variant="body2">Already have an account?</Typography>
        <Link href={paths.auth.jwt.login} component={RouterLink} variant="subtitle2">
          Sign in
        </Link>
      </Stack>
    </Stack>
  );

  const renderStep2 = (
    <Stack spacing={2.5}>
      {/* Email */}
      <RHFTextField
        name="email"
        label="Email"
        InputLabelProps={{ shrink: true }}
        sx={{ '& .MuiInputBase-root': { height: 56 } }}
      />

      {/* Username */}
      <RHFTextField
        name="username"
        label="Username"
        InputLabelProps={{ shrink: true }}
        sx={{ '& .MuiInputBase-root': { height: 56 } }}
      />

      {/* Password + Confirm Password side by side */}
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

      {/* Back + Register buttons */}
      <Stack direction="row" spacing={2}>
        <Button
          fullWidth
          size="large"
          variant="outlined"
          color="inherit"
          onClick={handleBack}
          startIcon={<Iconify icon="solar:arrow-left-linear" width={18} />}
          sx={{ height: 46, fontSize: 15 }}
        >
          Back
        </Button>

        <LoadingButton
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          sx={{ height: 46, fontSize: 15 }}
        >
          Register
        </LoadingButton>
      </Stack>

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

      {renderStepper}

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
        {activeStep === 0 && renderStep1}
        {activeStep === 1 && renderStep2}
      </FormProvider>
    </>
  );
}