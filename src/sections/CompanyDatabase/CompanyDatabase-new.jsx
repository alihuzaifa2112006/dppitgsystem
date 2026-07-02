import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  Typography,
  Container,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  OutlinedInput,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Divider,
  InputAdornment,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import { Get, Post } from 'src/api/apibasemethods';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPLOYEE_OPTIONS = ['1-10', '11-50', '51-200', '201-500', 'Over 500'].map(opt => ({ label: opt, value: opt }));
const EXPORT_BUSINESS_OPTIONS = ['0%', '25%', '50%', '75%', '100%'].map(opt => ({ label: opt, value: opt }));
const EUROPE_BUSINESS_OPTIONS = ['0%', 'Over 25%', 'Over 50%', 'Over 75%', '100%'].map(opt => ({ label: opt, value: opt }));
const SHIPPING_TERMS_OPTIONS = ['FOB', 'CIF', 'EXW', 'DDP', 'CFR'].map(opt => ({ label: opt, value: opt }));
const YEARS_OPTIONS = ['1-2', '3-5', '6-10', 'Over 10'].map(opt => ({ label: opt, value: opt }));
const BUSINESS_TYPE_OPTIONS = ['Manufacturer', 'Trader', 'Agent', 'Distributor'].map(opt => ({ label: opt, value: opt }));
const EXPERIENCE_OPTIONS = ['Whole Sale', 'Retail', 'Export', 'Import', 'E-Commerce'].map(opt => ({ label: opt, value: opt }));
const CERTIFICATE_OPTIONS = ['ISO 9001', 'ISO 14001', 'ISO 27001', 'API Q1', 'CE Marking', 'FDA Approval', 'GMP', 'HACCP', 'Other'];

// ─── Shared Styles ────────────────────────────────────────────────────────────

const INPUT_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontSize: '0.875rem',
    backgroundColor: '#fff',
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#94a3b8' },
    '&.Mui-focused fieldset': { borderColor: '#3b5bdb', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': { fontSize: '0.875rem' },
};

const SECTION_CARD_SX = {
  p: 3.5,
  borderRadius: '12px',
  border: '1px solid #eef0f6',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  backgroundColor: '#fff',
  transition: 'all 0.2s ease',
  minHeight: 400,
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
  },
};

// ─── File Upload Helper ───────────────────────────────────────────────────────

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await Post('SupplierOnboarding/UploadFile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  if (response.status === 200 || response.status === 201) {
    return response.data?.Data?.filePath || response.data?.filePath || '';
  }
  throw new Error(response.data?.Message || 'File upload failed');
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle, badge }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: '#eef2ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon={icon} width={20} sx={{ color: '#3b5bdb' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        {badge && (
          <Chip
            label={badge}
            size="small"
            sx={{
              bgcolor: '#eef2ff',
              color: '#3b5bdb',
              fontWeight: 600,
              fontSize: '0.7rem',
              border: '1px solid #c7d2fe',
            }}
          />
        )}
      </Stack>
      <Divider sx={{ mt: 2, borderColor: '#f1f5f9' }} />
    </Box>
  );
}

SectionHeader.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  badge: PropTypes.string,
};

function FileUploadButton({ file, onFileChange, onClear, accept = '.pdf,.jpg,.jpeg,.png', label = 'Upload file', hint = 'PDF, JPG, PNG up to 5MB' }) {
  const [fileError, setFileError] = useState('');

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!accept.includes('pdf') && !['image/jpeg', 'image/png'].includes(selected.type)) {
      setFileError('Only JPG or PNG files are allowed');
      return;
    } 
    if (accept.includes('pdf') && !validTypes.includes(selected.type)) {
      setFileError('Only PDF, JPG, or PNG files are allowed');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setFileError('File size must be less than 5MB');
      return;
    }
    setFileError('');
    onFileChange(selected);
  };

  return (
    <Box
      component="label"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 1.5,
        borderRadius: '8px',
        border: `1.5px dashed ${file ? '#22c55e' : '#c7d2fe'}`,
        cursor: 'pointer',
        bgcolor: file ? '#f0fdf4' : '#fff',
        transition: 'all 0.15s ease',
        '&:hover': {
          bgcolor: file ? '#dcfce7' : '#eef2ff',
          borderColor: file ? '#16a34a' : '#818cf8',
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '8px',
          bgcolor: file ? '#dcfce7' : '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: `1px solid ${file ? '#86efac' : '#e2e8f0'}`,
        }}
      >
        <Iconify
          icon={file ? 'mdi:file-check-outline' : 'mdi:cloud-upload-outline'}
          width={20}
          sx={{ color: file ? '#16a34a' : '#94a3b8' }}
        />
      </Box>
      <Box flex={1}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b', fontSize: '0.8rem' }}>
          {file ? file.name : label}
        </Typography>
        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
          {file ? `${(file.size / 1024).toFixed(1)} KB` : hint}
        </Typography>
        {fileError && (
          <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mt: 0.5 }}>
            {fileError}
          </Typography>
        )}
      </Box>
      {file && (
        <Chip
          label="Remove"
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setFileError('');
            onClear();
          }}
          sx={{
            bgcolor: '#fee2e2',
            color: '#ef4444',
            fontSize: '0.7rem',
            '&:hover': { bgcolor: '#fecaca' },
          }}
        />
      )}
      <input type="file" accept={accept} hidden onChange={handleChange} />
    </Box>
  );
}

FileUploadButton.propTypes = {
  file: PropTypes.object,
  onFileChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  accept: PropTypes.string,
  label: PropTypes.string,
  hint: PropTypes.string,
};

function CertificateEntry({ entry, onUpdate, onRemove, index }) {
  return (
    <Box
      sx={{
        p: 2.5,
        bgcolor: '#f8fafc',
        borderRadius: '10px',
        border: '1px solid #eef0f6',
        mb: 2,
        position: 'relative',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#c7d2fe',
          bgcolor: '#fafbff',
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: '#eef2ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="mdi:certificate-outline" width={18} sx={{ color: '#3b5bdb' }} />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
            Certificate #{index + 1}
          </Typography>
        </Stack>
        <IconButton
          size="small"
          onClick={() => onRemove(index)}
          sx={{
            color: '#ef4444',
            bgcolor: '#fff1f1',
            borderRadius: '6px',
            '&:hover': { bgcolor: '#fee2e2' },
          }}
        >
          <Iconify icon="mdi:trash-can-outline" width={16} />
        </IconButton>
      </Stack>

      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <RHFAutocomplete
            name={`certificates.${index}.document`}
            label="Document Name *"
            placeholder="Select certificate type"
            options={CERTIFICATE_OPTIONS}
            freeSolo
            size="small"
            sx={INPUT_SX}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            label="Description"
            placeholder="Optional description"
            value={entry.description || ''}
            onChange={(e) => onUpdate(index, 'description', e.target.value)}
            sx={INPUT_SX}
          />
        </Grid>

        <Grid xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Valid From *"
              value={entry.validityFrom}
              onChange={(val) => onUpdate(index, 'validityFrom', val)}
              format="DD/MM/YYYY"
              slotProps={{
                textField: { fullWidth: true, size: 'small', sx: INPUT_SX },
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Valid To *"
              value={entry.validityTo}
              onChange={(val) => onUpdate(index, 'validityTo', val)}
              format="DD/MM/YYYY"
              minDate={entry.validityFrom || undefined}
              slotProps={{
                textField: { fullWidth: true, size: 'small', sx: INPUT_SX },
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid xs={12}>
          <FileUploadButton
            file={entry.file}
            onFileChange={(file) => onUpdate(index, 'file', file)}
            onClear={() => onUpdate(index, 'file', null)}
            label="Upload certificate file *"
            hint="PDF, JPG, PNG up to 5MB (Required) — uploaded on Submit"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

CertificateEntry.propTypes = {
  entry: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
};

// ─── Validation Schema ────────────────────────────────────────────────────────

const NewCompanySchema = Yup.object().shape({
  supName: Yup.string().required('Company Name is required'),
  addressLine1: Yup.string().required('Address Line 1 is required'),
  addressLine2: Yup.string().nullable(),
  country: Yup.object()
    .nullable()
    .required('Country is required')
    .shape({
      Country_ID: Yup.string().required(),
      Country_Name: Yup.string().required(),
      Country_Code: Yup.string().nullable(),
    }),
  province: Yup.string().nullable(),
  city: Yup.string().required('City is required'),
  phone: Yup.string().required('Phone number is required'),
  fax: Yup.string().nullable(),
  zipCode: Yup.string().nullable(),
  webAddress: Yup.string().nullable(),
  mainExportMarket: Yup.object().nullable(),
  onboardingEmail: Yup.string().required('Email is required').email('Invalid email format'),
  capacityPerMonth: Yup.string().required('Capacity is required'),
  unit: Yup.object().nullable().required('Unit is required'),
  turnoverPerYear: Yup.string().required('Turnover is required'),
  currency: Yup.object().nullable().required('Currency is required'),
  businessLicenseNo: Yup.string().required('Business License No is required'),
  additionalInfo: Yup.string().nullable(),
  noOfEmployee: Yup.object().nullable().required('No. of Employees is required').shape({ label: Yup.string().required(), value: Yup.string().required() }),
  exportBusinessPct: Yup.object().nullable().required('% of Export Business is required').shape({ label: Yup.string().required(), value: Yup.string().required() }),
  experienceInBusiness: Yup.array().min(1, 'Select at least one experience type').required('Experience in Business is required'),
  businessInEuropePct: Yup.object().nullable().required('% of Business in Europe is required').shape({ label: Yup.string().required(), value: Yup.string().required() }),
  shippingTerms: Yup.object().nullable().required('Shipping Terms is required').shape({ label: Yup.string().required(), value: Yup.string().required() }),
  yearsInBusiness: Yup.object().nullable().required('Years in Business is required').shape({ label: Yup.string().required(), value: Yup.string().required() }),
  yearsEuropeanBusiness: Yup.object().nullable().required('Years in European Business is required').shape({ label: Yup.string().required(), value: Yup.string().required() }),
  businessType: Yup.object().nullable().required('Business Type is required').shape({ label: Yup.string().required(), value: Yup.string().required() }),
  contacts: Yup.array().of(
    Yup.object().shape({
      contactType: Yup.object().nullable().required('Contact Type is required'),
      name: Yup.string().required('Name is required'),
      jobTitle: Yup.string().nullable(),
      mobileNumber: Yup.string().required('Mobile Number is required'),
      email: Yup.string().required('Email is required').email('Invalid email'),
    })
  ).min(1, 'At least one contact is required'),
  certificates: Yup.array().of(
    Yup.object().shape({
      document: Yup.string().required('Document name is required'),
      description: Yup.string().nullable(),
      validityFrom: Yup.mixed().nullable().required('Valid from date is required'),
      validityTo: Yup.mixed().nullable().required('Valid to date is required'),
      file: Yup.mixed()
        .nullable()
        .required('Certificate file is required')
    })
  ).min(1, 'At least one certificate is required'),
});

const STEPS = [
  'Company Information',
  'Setup Details',
  'Business Profile',
  'Contacts',
  'Certificates',
  'Company Logo'
];

// Fields to validate per step
const STEP_FIELDS = {
  0: ['supName', 'addressLine1', 'addressLine2', 'country', 'province', 'city', 'phone', 'fax', 'zipCode', 'webAddress', 'mainExportMarket', 'onboardingEmail'],
  1: ['capacityPerMonth', 'unit', 'turnoverPerYear', 'currency', 'businessLicenseNo', 'additionalInfo'],
  2: ['noOfEmployee', 'exportBusinessPct', 'experienceInBusiness', 'businessInEuropePct', 'shippingTerms', 'yearsInBusiness', 'yearsEuropeanBusiness', 'businessType'],
  3: ['contacts'],
  4: ['certificates'],
  5: [] // logo validated manually if required
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CompanyDatabaseCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [exportMarketValue, setExportMarketValue] = useState([]);
  const [unitValue, setUnitValue] = useState([]);
  const [currencyValue, setCurrencyValue] = useState([]);
  const [contactTypeValue, setContactTypeValue] = useState([]);

  // Local file states
  const [logoFile, setLogoFile] = useState(null);
  const [businessLicenseFile, setBusinessLicenseFile] = useState(null);

  // Fetch helpers
  useEffect(() => {
    Get('ExportMarket/GetAll').then(r => { if (r.status === 200) setExportMarketValue(r?.data?.Data || []); }).catch(console.error);
    Get('Unit/GetAll').then(r => { if (r.status === 200) setUnitValue(r?.data?.Data || []); }).catch(console.error);
    Get('Currency/GetAll').then(r => { if (r.status === 200) setCurrencyValue(r?.data?.Data || []); }).catch(console.error);
    Get('ContactType/GetAll').then(r => { if (r.status === 200) setContactTypeValue(r?.data?.Data || []); }).catch(console.error);
    Get('Country/GetAll').then(r => { if (r.status === 200) setCountries(r?.data?.Data || []); }).catch(console.error);
  }, []);

  const methods = useForm({
    resolver: yupResolver(NewCompanySchema),
    defaultValues: {
      supName: '',
      addressLine1: '',
      addressLine2: '',
      country: null,
      province: '',
      city: '',
      phone: '',
      fax: '',
      zipCode: '',
      webAddress: '',
      mainExportMarket: null,
      onboardingEmail: '',
      capacityPerMonth: '',
      unit: null,
      turnoverPerYear: '',
      currency: null,
      businessLicenseNo: '',
      additionalInfo: '',
      noOfEmployee: null,
      exportBusinessPct: null,
      experienceInBusiness: [],
      businessInEuropePct: null,
      shippingTerms: null,
      yearsInBusiness: null,
      yearsEuropeanBusiness: null,
      businessType: null,
      contacts: [{ contactType: null, name: '', jobTitle: '', mobileNumber: '', email: '' }],
      certificates: [],
    },
    mode: 'onChange',
  });

  const { reset, watch, control, setValue, trigger, handleSubmit, formState: { isSubmitting } } = methods;
  const values = watch();

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({ control, name: 'contacts' });
  const { fields: certificateFields, append: appendCertificate, remove: removeCertificate } = useFieldArray({ control, name: 'certificates' });

  const handleNext = async () => {
    // Validate current step fields
    const fieldsToValidate = STEP_FIELDS[activeStep];
    let isValid = true;
    
    if (fieldsToValidate && fieldsToValidate.length > 0) {
      isValid = await trigger(fieldsToValidate);
    }
    
    // Custom logic for file fields on step 1 (businessLicenseFile) if we wanted to enforce it here
    if (activeStep === 1 && !businessLicenseFile) {
      enqueueSnackbar('Business license document is required', { variant: 'error' });
      isValid = false;
    }

    if (isValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    window.scrollTo(0, 0);
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);

      // Upload files similar to SupplierForm.jsx
      let businessLicenseFilePath = '';
      if (businessLicenseFile) {
        businessLicenseFilePath = await uploadFile(businessLicenseFile);
      } else {
        throw new Error("Business license file is missing");
      }

      const uploadedCertificates = await Promise.all(
        data.certificates.map(async (cert, index) => {
          let filePath = '';
          if (cert.file) {
            filePath = await uploadFile(cert.file);
          }
          return {
            Name: cert.document,
            FilePath: filePath,
            ValidFrom: cert.validityFrom ? dayjs(cert.validityFrom).format('YYYY-MM-DD') : '',
            ValidTo: cert.validityTo ? dayjs(cert.validityTo).format('YYYY-MM-DD') : '',
          };
        })
      );

      let logoFilePath = '';
      if (logoFile) {
        logoFilePath = await uploadFile(logoFile);
      }

      // Payload mock or actual API
      const payload = {
        SupplierName: data.supName,
        AddressLine1: data.addressLine1,
        AddressLine2: data.addressLine2 || '',
        CountryID: parseInt(data.country?.Country_ID, 10) || 0,
        Province: data.province || '',
        City: data.city,
        Phone: data.phone,
        Fax: data.fax || '',
        ZipPostalCode: data.zipCode || '',
        Website: data.webAddress || '',
        ExportMarketId: data.mainExportMarket?.ExportMarketId || 0,
        OnboardingEmail: data.onboardingEmail,

        CapacityPerMonth: Number(data.capacityPerMonth) || 0,
        UnitId: data.unit?.UnitId || 0,
        AnnualTurnover: Number(data.turnoverPerYear) || 0,
        CurrencyId: data.currency?.CurrencyId || 0,
        BusinessLicenseNo: data.businessLicenseNo,
        BusinessLicenseFilePath: businessLicenseFilePath,
        AdditionalInformation: data.additionalInfo || '',

        NumberOfEmployees: data.noOfEmployee?.value || '',
        ExportBusinessPercent: data.exportBusinessPct?.value || '',
        ExperienceInBusiness: Array.isArray(data.experienceInBusiness) ? data.experienceInBusiness.join(', ') : (data.experienceInBusiness || ''),
        BusinessInEuropePercent: data.businessInEuropePct?.value || '',
        ShippingTerms: data.shippingTerms?.value || '',
        BusinessType: data.businessType?.value || '',
        YearsInBusiness: data.yearsInBusiness?.value || '',
        YearsInEuropeanBusiness: data.yearsEuropeanBusiness?.value || '',

        CompanyLogoPath: logoFilePath,

        Contacts: data.contacts.map((c) => ({
          ContactTypeId: c.contactType?.ContactTypeId || '',
          FullName: c.name,
          JobTitle: c.jobTitle || '',
          MobileNumber: c.mobileNumber,
          Email: c.email,
        })),

        Certificates: uploadedCertificates,
      };

      // In real scenario we'd call a submit API here
      console.log('Final Payload:', payload);
      // const response = await Post('SupplierOnboarding/Submit', payload);
      
      enqueueSnackbar('Company Database Entry created successfully!', { variant: 'success' });
      reset();
      setLogoFile(null);
      setBusinessLicenseFile(null);
      router.push(paths.dashboard.root);

    } catch (error) {
      console.error('Submission error:', error);
      enqueueSnackbar(error.message || 'Something went wrong', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  });

  const renderLoading = (
    <LoadingScreen
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh',
      }}
    />
  );

  return isLoading ? (
    renderLoading
  ) : (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}>
          Company Database
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Add comprehensive company information using the wizard below.
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Step 0: Company Information */}
          <Card sx={{ ...SECTION_CARD_SX, width: '100%', display: activeStep === 0 ? 'block' : 'none' }}>
            <SectionHeader
              icon="mdi:domain"
              title="Company Information"
              subtitle="Enter your company's primary details and contact address"
              badge="Required"
            />
            <Grid container spacing={2.5}>
              <Grid xs={12}>
                <RHFTextField name="supName" label="Supplier Name *" placeholder="e.g. IVT International Ltd" InputProps={{ startAdornment: <InputAdornment position="start"><Iconify icon="mdi:domain" width={18} sx={{ color: '#94a3b8' }} /></InputAdornment> }} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12}>
                <RHFTextField name="addressLine1" label="Address Line 1 *" placeholder="Flat A, 10/F, Lockhart Centre" InputProps={{ startAdornment: <InputAdornment position="start"><Iconify icon="mdi:map-marker-outline" width={18} sx={{ color: '#94a3b8' }} /></InputAdornment> }} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12}>
                <RHFTextField name="addressLine2" label="Address Line 2" placeholder="Building, Street, Suite etc." sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={4}>
                <RHFAutocomplete name="country" label="Country *" placeholder="Select Country" options={countries} getOptionLabel={(o) => o?.Country_Name || ''} isOptionEqualToValue={(o, v) => o?.Country_ID === v?.Country_ID} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={4}>
                <RHFTextField name="province" label="Province / State" placeholder="Province" sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={4}>
                <RHFTextField name="city" label="City *" placeholder="Hong Kong" InputProps={{ startAdornment: <InputAdornment position="start"><Iconify icon="mdi:city-variant-outline" width={18} sx={{ color: '#94a3b8' }} /></InputAdornment> }} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={4}>
                <RHFTextField name="phone" label="Phone *" placeholder="+852 2369-4734" InputProps={{ startAdornment: <InputAdornment position="start"><Iconify icon="mdi:phone-outline" width={18} sx={{ color: '#94a3b8' }} /></InputAdornment> }} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={4}>
                <RHFTextField name="fax" label="Fax" placeholder="Fax number" InputProps={{ startAdornment: <InputAdornment position="start"><Iconify icon="mdi:fax" width={18} sx={{ color: '#94a3b8' }} /></InputAdornment> }} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={4}>
                <RHFTextField name="zipCode" label="Zip / Postal Code" placeholder="78121" sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={4}>
                <RHFTextField name="webAddress" label="Website" placeholder="https://www.example.com" InputProps={{ startAdornment: <InputAdornment position="start"><Iconify icon="mdi:web" width={18} sx={{ color: '#94a3b8' }} /></InputAdornment> }} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={4}>
                <RHFAutocomplete name="mainExportMarket" label="Main Export Market" placeholder="Select market" options={exportMarketValue} getOptionLabel={(o) => o?.Name || ''} isOptionEqualToValue={(o, v) => o?.ExportMarketId === v?.ExportMarketId} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={4}>
                <RHFTextField name="onboardingEmail" label="Onboarding Email *" placeholder="contact@company.com" type="email" InputProps={{ startAdornment: <InputAdornment position="start"><Iconify icon="mdi:email-outline" width={18} sx={{ color: '#94a3b8' }} /></InputAdornment> }} sx={INPUT_SX} />
              </Grid>
            </Grid>
          </Card>

          {/* Step 1: Setup Details */}
          <Card sx={{ ...SECTION_CARD_SX, width: '100%', display: activeStep === 1 ? 'block' : 'none' }}>
            <SectionHeader
              icon="mdi:cog-outline"
              title="Setup Details"
              subtitle="Capacity, financials, and licensing information"
              badge="Required"
            />
            <Grid container spacing={2.5}>
              <Grid xs={12} md={6}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <RHFTextField name="capacityPerMonth" label="Capacity per Month *" placeholder="100" sx={{ ...INPUT_SX, flex: 1 }} helperText="Monthly production capacity" />
                  <RHFAutocomplete name="unit" label="Unit" placeholder="Select unit" options={unitValue} getOptionLabel={(o) => o?.Code || ''} isOptionEqualToValue={(o, v) => o?.UnitId === v?.UnitId} sx={INPUT_SX} />
                </Stack>
              </Grid>
              <Grid xs={12} md={6}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <RHFTextField name="turnoverPerYear" label="Annual Turnover *" placeholder="500,000" sx={{ ...INPUT_SX, flex: 1 }} />
                  <RHFAutocomplete name="currency" label="Currency" placeholder="Select currency" options={currencyValue} getOptionLabel={(o) => o?.Code || ''} isOptionEqualToValue={(o, v) => o?.CurrencyId === v?.CurrencyId} sx={INPUT_SX} />
                </Stack>
              </Grid>
              <Grid xs={12} md={6}>
                <RHFTextField name="businessLicenseNo" label="Business License No. *" placeholder="e.g. BL-2001-HK" sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={6}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.75, display: 'block' }}>
                    Business License Document *
                  </Typography>
                  <FileUploadButton file={businessLicenseFile} onFileChange={setBusinessLicenseFile} onClear={() => setBusinessLicenseFile(null)} label="Upload license document" hint="PDF, JPG, PNG up to 5MB" />
                </Box>
              </Grid>
              <Grid xs={12}>
                <RHFTextField name="additionalInfo" label="Additional Information" placeholder="Any other relevant details about your company..." multiline rows={3} sx={INPUT_SX} />
              </Grid>
            </Grid>
          </Card>

          {/* Step 2: Business Profile */}
          <Card sx={{ ...SECTION_CARD_SX, width: '100%', display: activeStep === 2 ? 'block' : 'none' }}>
            <SectionHeader
              icon="mdi:chart-bar"
              title="Business Profile"
              subtitle="Business metrics, experience, and operational details"
              badge="Required"
            />
            <Grid container spacing={2.5}>
              <Grid xs={12} md={6}>
                <RHFAutocomplete name="noOfEmployee" label="Number of Employees *" options={EMPLOYEE_OPTIONS} getOptionLabel={(o) => o?.label || ''} isOptionEqualToValue={(o, v) => o?.value === v?.value} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={6}>
                <RHFAutocomplete name="exportBusinessPct" label="Export Business % *" options={EXPORT_BUSINESS_OPTIONS} getOptionLabel={(o) => o?.label || ''} isOptionEqualToValue={(o, v) => o?.value === v?.value} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={6}>
                <Controller
                  name="experienceInBusiness"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error} sx={INPUT_SX}>
                      <InputLabel>Experience in Business *</InputLabel>
                      <Select {...field} multiple input={<OutlinedInput label="Experience in Business *" />} renderValue={(selected) => (<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{selected.map((val) => (<Chip key={val} label={val} size="small" />))}</Box>)}>
                        {EXPERIENCE_OPTIONS.map((opt) => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
                      </Select>
                      {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <RHFAutocomplete name="businessInEuropePct" label="Business in Europe % *" options={EUROPE_BUSINESS_OPTIONS} getOptionLabel={(o) => o?.label || ''} isOptionEqualToValue={(o, v) => o?.value === v?.value} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={6}>
                <RHFAutocomplete name="shippingTerms" label="Shipping Terms *" options={SHIPPING_TERMS_OPTIONS} getOptionLabel={(o) => o?.label || ''} isOptionEqualToValue={(o, v) => o?.value === v?.value} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={6}>
                <RHFAutocomplete name="businessType" label="Business Type *" options={BUSINESS_TYPE_OPTIONS} getOptionLabel={(o) => o?.label || ''} isOptionEqualToValue={(o, v) => o?.value === v?.value} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={6}>
                <RHFAutocomplete name="yearsInBusiness" label="Years in Business *" options={YEARS_OPTIONS} getOptionLabel={(o) => o?.label || ''} isOptionEqualToValue={(o, v) => o?.value === v?.value} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={6}>
                <RHFAutocomplete name="yearsEuropeanBusiness" label="Years in European Business *" options={YEARS_OPTIONS} getOptionLabel={(o) => o?.label || ''} isOptionEqualToValue={(o, v) => o?.value === v?.value} sx={INPUT_SX} />
              </Grid>
            </Grid>
          </Card>

          {/* Step 3: Contacts */}
          <Card sx={{ ...SECTION_CARD_SX, width: '100%', display: activeStep === 3 ? 'block' : 'none' }}>
            <SectionHeader
              icon="mdi:contacts-outline"
              title="Contact Information"
              subtitle="Add key contacts for different departments"
              badge={contactFields.length > 0 ? `${contactFields.length} contacts` : 'Required'}
            />
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '10px', border: '1px solid #eef0f6', boxShadow: 'none' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    {['Contact Type', 'Full Name', 'Job Title', 'Mobile Number', 'Email', ''].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', py: 1.5, whiteSpace: 'nowrap' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contactFields.map((field, index) => (
                    <TableRow key={field.id} sx={{ '&:last-child td': { border: 0 }, '&:hover': { bgcolor: '#fafbff' } }}>
                      <TableCell sx={{ minWidth: 175, py: 1.5 }}>
                        <RHFAutocomplete name={`contacts.${index}.contactType`} label="Contact Type" options={contactTypeValue} getOptionLabel={(o) => o?.Name || ''} isOptionEqualToValue={(o, v) => o?.ContactTypeId === v?.ContactTypeId} sx={INPUT_SX} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 150, py: 1.5 }}>
                        <Controller name={`contacts.${index}.name`} control={control} render={({ field: f, fieldState }) => (<TextField {...f} size="small" fullWidth placeholder="Full Name" error={!!fieldState.error} helperText={fieldState.error?.message} sx={INPUT_SX} />)} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 130, py: 1.5 }}>
                        <Controller name={`contacts.${index}.jobTitle`} control={control} render={({ field: f }) => (<TextField {...f} size="small" fullWidth placeholder="Job Title" sx={INPUT_SX} />)} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 155, py: 1.5 }}>
                        <Controller name={`contacts.${index}.mobileNumber`} control={control} render={({ field: f, fieldState }) => (<TextField {...f} size="small" fullWidth placeholder="Mobile" error={!!fieldState.error} helperText={fieldState.error?.message} sx={INPUT_SX} />)} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 190, py: 1.5 }}>
                        <Controller name={`contacts.${index}.email`} control={control} render={({ field: f, fieldState }) => (<TextField {...f} size="small" fullWidth placeholder="Email" error={!!fieldState.error} helperText={fieldState.error?.message} sx={INPUT_SX} />)} />
                      </TableCell>
                      <TableCell sx={{ py: 1.5, pr: 2 }}>
                        <IconButton size="small" onClick={() => removeContact(index)} disabled={contactFields.length === 1} sx={{ color: '#ef4444', bgcolor: '#fff1f1', borderRadius: '6px' }}>
                          <Iconify icon="mdi:trash-can-outline" width={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button size="small" variant="outlined" startIcon={<Iconify icon="mdi:plus" width={16} />} onClick={() => appendContact({ contactType: null, name: '', jobTitle: '', mobileNumber: '', email: '' })}>
                Add Contact
              </Button>
            </Box>
          </Card>

          {/* Step 4: Certificates */}
          <Card sx={{ ...SECTION_CARD_SX, width: '100%', display: activeStep === 4 ? 'block' : 'none' }}>
            <SectionHeader
              icon="mdi:certificate-outline"
              title="Certificates & Patents"
              subtitle="Upload all certifications and patents your company holds"
              badge={certificateFields.length > 0 ? `${certificateFields.length} added` : 'Required'}
            />
            <Stack spacing={2}>
              {certificateFields.map((field, index) => (
                <CertificateEntry
                  key={field.id}
                  entry={values.certificates?.[index] || field}
                  index={index}
                  onUpdate={(idx, key, value) => {
                    setValue(`certificates.${idx}.${key}`, value, { shouldValidate: true, shouldDirty: true });
                  }}
                  onRemove={removeCertificate}
                />
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button size="small" variant="contained" onClick={() => appendCertificate({ document: '', description: '', validityFrom: null, validityTo: null, file: null })} startIcon={<Iconify icon="mdi:plus" width={16} />}>
                  Add Certificate
                </Button>
              </Box>
            </Stack>
          </Card>

          {/* Step 5: Company Logo */}
          <Card sx={{ ...SECTION_CARD_SX, width: '100%', display: activeStep === 5 ? 'block' : 'none' }}>
            <SectionHeader
              icon="mdi:image-outline"
              title="Company Logo"
              subtitle="Upload your company's logo"
            />
            <Stack direction="row" alignItems="center" spacing={2}>
              {logoFile && (
                <Box sx={{ width: 64, height: 64, borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={URL.createObjectURL(logoFile)} alt="logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              )}
              <Box flex={1}>
                <FileUploadButton file={logoFile} onFileChange={setLogoFile} onClear={() => setLogoFile(null)} accept="image/*" label="Upload company logo" hint="PNG, JPG up to 5MB" />
              </Box>
            </Stack>
          </Card>

        </Box>

        <Divider sx={{ my: 4, borderStyle: 'dashed' }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            color="inherit"
            disabled={activeStep === 0 || isSubmitting || isLoading}
            onClick={handleBack}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
            sx={{ borderRadius: 2 }}
          >
            Back
          </Button>

          {activeStep === STEPS.length - 1 ? (
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting || isLoading}
              endIcon={<Iconify icon="eva:checkmark-fill" />}
              sx={{ borderRadius: 2, px: 4 }}
            >
              Submit Database Entry
            </LoadingButton>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
              sx={{ borderRadius: 2, px: 4 }}
            >
              Next
            </Button>
          )}
        </Stack>
      </FormProvider>
    </Container>
  );
}
