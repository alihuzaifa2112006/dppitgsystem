import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
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
  LinearProgress,
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

const TABS = [
  { label: 'Company Info', icon: 'mdi:domain' },
  { label: 'Setup Details', icon: 'mdi:cog-outline' },
  { label: 'Business Profile', icon: 'mdi:chart-bar' },
  // { label: 'Supply Chain', icon: 'mdi:truck-delivery-outline' },
  { label: 'Contacts', icon: 'mdi:contacts-outline' },
  { label: 'Certificates', icon: 'mdi:certificate-outline' },
  { label: 'Logo', icon: 'mdi:image-outline' },
];

// ─── Shared Styles ────────────────────────────────────────────────────────────

const INPUT_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontSize: '0.875rem',
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': { fontSize: '0.875rem' },
};

const SECTION_CARD_SX = {
  p: 3,
  borderRadius: '12px',
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};

// ─── Animated Tab Panel ───────────────────────────────────────────────────────

function TabPanel({ children, value, index }) {
  const isActive = value === index;
  return (
    <Box
      role="tabpanel"
      hidden={!isActive}
      sx={{
        animation: isActive ? 'slideIn 0.28s cubic-bezier(0.4,0,0.2,1)' : 'none',
        '@keyframes slideIn': {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {isActive && children}
    </Box>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
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
    <Box sx={{ mb: 2.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Iconify icon={icon} width={20} sx={{ color: 'primary.main', flexShrink: 0 }} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        {badge && (
          <Chip
            label={badge}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.68rem' }}
          />
        )}
      </Stack>
      <Divider sx={{ mt: 1.5 }} />
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
        border: '1.5px dashed',
        borderColor: file ? 'success.light' : 'primary.light',
        cursor: 'pointer',
        bgcolor: file ? 'success.lighter' : 'background.neutral',
        transition: 'all 0.15s ease',
        '&:hover': {
          bgcolor: file ? 'success.light' : 'action.hover',
          borderColor: file ? 'success.main' : 'primary.main',
        },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '8px',
          bgcolor: 'action.selected',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Iconify
          icon={file ? 'mdi:file-check-outline' : 'mdi:cloud-upload-outline'}
          width={18}
          sx={{ color: file ? 'success.main' : 'text.secondary' }}
        />
      </Box>
      <Box flex={1}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', fontSize: '0.8rem' }}>
          {file ? file.name : label}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {file ? `${(file.size / 1024).toFixed(1)} KB` : hint}
        </Typography>
        {fileError && (
          <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 0.5 }}>
            {fileError}
          </Typography>
        )}
      </Box>
      {file && (
        <Chip
          label="Remove"
          size="small"
          color="error"
          variant="soft"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setFileError('');
            onClear();
          }}
          sx={{ fontSize: '0.7rem' }}
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
        p: 2,
        bgcolor: (theme) => theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.6) : '#f8fafc',
        borderRadius: '10px',
        border: '1px solid',
        borderColor: 'divider',
        mb: 1.5,
        position: 'relative',
        transition: 'all 0.2s ease',
        animation: 'fadeIn 0.25s ease',
        '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        '&:hover': {
          borderColor: 'primary.light',
          bgcolor: (theme) => theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.04) : '#fafbff',
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '7px',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.12) : '#eef2ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon="mdi:certificate-outline" width={16} sx={{ color: 'primary.main' }} />
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Certificate #{index + 1}
          </Typography>
        </Stack>
        <IconButton
          size="small"
          onClick={() => onRemove(index)}
          sx={{
            color: 'error.main',
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
            borderRadius: '6px',
            width: 26,
            height: 26,
            '&:hover': { bgcolor: (theme) => alpha(theme.palette.error.main, 0.16) },
          }}
        >
          <Iconify icon="mdi:trash-can-outline" width={14} />
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
          {entry.filePath && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Iconify icon="mdi:file-check-outline" width={18} sx={{ color: 'primary.main' }} />
              <Typography
                variant="caption"
                component="a"
                href={entry.filePath}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'primary.main', textDecoration: 'underline', fontWeight: 500, cursor: 'pointer' }}
              >
                View Uploaded File
              </Typography>
            </Stack>
          )}
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
  addressLine1: Yup.string().nullable(),
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
  phone: Yup.string().nullable(),
  fax: Yup.string().nullable(),
  zipCode: Yup.string().nullable(),
  webAddress: Yup.string().nullable(),
  mainExportMarket: Yup.object().nullable(),
  onboardingEmail: Yup.string().required('Email is required').email('Invalid email format'),
  // Supply Chain
  supplyChain: Yup.array().of(
    Yup.object().shape({
      supplierName: Yup.string().nullable(),
      city: Yup.string().nullable(),
      country: Yup.object().nullable(),
      email: Yup.string().nullable().email('Invalid email'),
    })
  ),
  capacityPerMonth: Yup.string().nullable(),
  unit: Yup.object().nullable(),
  turnoverPerYear: Yup.string().nullable(),
  currency: Yup.object().nullable(),
  businessLicenseNo: Yup.string().nullable(),
  additionalInfo: Yup.string().nullable(),
  noOfEmployee: Yup.object().nullable(),
  exportBusinessPct: Yup.object().nullable(),
  experienceInBusiness: Yup.array().nullable(),
  businessInEuropePct: Yup.object().nullable(),
  shippingTerms: Yup.object().nullable(),
  yearsInBusiness: Yup.object().nullable(),
  yearsEuropeanBusiness: Yup.object().nullable(),
  businessType: Yup.object().nullable(),
  contacts: Yup.array().of(
    Yup.object().shape({
      contactType: Yup.object().nullable(),
      name: Yup.string().nullable(),
      jobTitle: Yup.string().nullable(),
      mobileNumber: Yup.string().nullable(),
      email: Yup.string().nullable().email('Invalid email'),
    })
  ),
  certificates: Yup.array().of(
    Yup.object().shape({
      document: Yup.string().nullable(),
      description: Yup.string().nullable(),
      validityFrom: Yup.mixed().nullable(),
      validityTo: Yup.mixed().nullable(),
      file: Yup.mixed().nullable(),
    })
  ),
});


// Fields to validate per tab
const TAB_FIELDS = {
  0: ['supName', 'addressLine1', 'addressLine2', 'country', 'province', 'city', 'phone', 'fax', 'zipCode', 'webAddress', 'mainExportMarket', 'onboardingEmail'],
  1: ['capacityPerMonth', 'unit', 'turnoverPerYear', 'currency', 'businessLicenseNo', 'additionalInfo'],
  2: ['noOfEmployee', 'exportBusinessPct', 'experienceInBusiness', 'businessInEuropePct', 'shippingTerms', 'yearsInBusiness', 'yearsEuropeanBusiness', 'businessType'],
  3: ['supplyChain'],
  4: ['contacts'],
  5: ['certificates'],
  6: [],
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CompanyDatabaseCreateForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [exportMarketValue, setExportMarketValue] = useState([]);
  const [unitValue, setUnitValue] = useState([]);
  const [currencyValue, setCurrencyValue] = useState([]);
  const [contactTypeValue, setContactTypeValue] = useState([]);

  const [logoFile, setLogoFile] = useState(null);
  const [businessLicenseFile, setBusinessLicenseFile] = useState(null);

  // Store file paths from API (to send back in update)
  const [storedPaths, setStoredPaths] = useState({
    businessLicenseFilePath: '',
    companyLogoPath: '',
  });


  // Get companyId from localStorage
  const companyId = useMemo(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('UserData') || '{}');
      return userData?.Data?.company?.CompanyId || userData?.Data?.CompanyId || null;
    } catch { return null; }
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch all dropdown data in parallel
        const [exportRes, unitRes, currencyRes, contactTypeRes, countryRes] = await Promise.all([
          Get('ExportMarket/GetAll'),
          Get('Unit/GetAll'),
          Get('Currency/GetAll'),
          Get('ContactType/GetAll'),
          Get('Country/GetAll'),
        ]);

        const exportMarkets = exportRes?.data?.Data || [];
        const units         = unitRes?.data?.Data || [];
        const currencies    = currencyRes?.data?.Data || [];
        const contactTypes  = contactTypeRes?.data?.Data || [];
        const countriesList = countryRes?.data?.Data || [];

        if (exportRes.status === 200) setExportMarketValue(exportMarkets);
        if (unitRes.status === 200) setUnitValue(units);
        if (currencyRes.status === 200) setCurrencyValue(currencies);
        if (contactTypeRes.status === 200) setContactTypeValue(contactTypes);
        if (countryRes.status === 200) setCountries(countriesList);

        // Fetch company data and populate form
        if (companyId) {
          const companyRes = await Get(`Company/GetByCompanyId?companyId=${companyId}`);
          if (companyRes.status === 200 && companyRes.data?.Success) {
            const d = companyRes.data.Data;

            // Helper: find option by id or value
            const findById  = (arr, idKey, val) => arr.find(o => String(o[idKey]) === String(val)) || null;
            const findByVal = (arr, val) => arr.find(o => o.value === val) || null;

            // Map experience string to array
            const expArr = d.ExperienceInBusiness
              ? d.ExperienceInBusiness.split(',').map(s => s.trim()).filter(Boolean)
              : [];

            // Map contacts
            const mappedContacts = d.Contacts?.length
              ? d.Contacts.map(c => ({
                  contactType: findById(contactTypes, 'ContactTypeId', c.ContactTypeId) || null,
                  name: c.FullName || '',
                  jobTitle: c.JobTitle || '',
                  mobileNumber: c.MobileNumber || '',
                  email: c.Email || '',
                }))
              : [{ contactType: null, name: '', jobTitle: '', mobileNumber: '', email: '' }];

            // Map certificates
            const mappedCerts = d.Certificates?.length
              ? d.Certificates.map(cert => ({
                  document: cert.Name || '',
                  description: cert.IssuingBody || '',
                  certificateNo: cert.CertificateNo || '',
                  validityFrom: cert.IssueDate ? dayjs(cert.IssueDate) : null,
                  validityTo: cert.ExpiryDate ? dayjs(cert.ExpiryDate) : null,
                  filePath: cert.FilePath || '',
                  file: null,
                }))
              : [];

            // Map supply chain entries
            const mappedSupplyChain = d.SupplyChain?.length
              ? d.SupplyChain.map(sc => ({
                  supplierName: sc.SupplierName || '',
                  city: sc.City || '',
                  country: findById(countriesList, 'Country_ID', sc.CountryID) || null,
                  email: sc.Email || '',
                }))
              : [{ supplierName: '', city: '', country: null, email: '' }];

            const populated = {
              // Company Info
              ...(d.OrganizationName   && { supName: d.OrganizationName }),
              ...(d.AddressLine1       && { addressLine1: d.AddressLine1 }),
              ...(d.AddressLine2       && { addressLine2: d.AddressLine2 }),
              ...(d.Province           && { province: d.Province }),
              ...(d.City               && { city: d.City }),
              ...(d.Phone              && { phone: d.Phone }),
              ...(d.Fax                && { fax: d.Fax }),
              ...(d.ZipPostalCode      && { zipCode: d.ZipPostalCode }),
              ...(d.Website            && { webAddress: d.Website }),
              ...(d.OnboardingEmail    && { onboardingEmail: d.OnboardingEmail }),
              ...(d.Email && !d.OnboardingEmail && { onboardingEmail: d.Email }),
              ...(d.CountryID          && { country: findById(countriesList, 'Country_ID', d.CountryID) }),
              ...(d.ExportMarketId     && { mainExportMarket: findById(exportMarkets, 'ExportMarketId', d.ExportMarketId) }),
              // Setup Details
              ...(d.CapacityPerMonth   && { capacityPerMonth: String(d.CapacityPerMonth) }),
              ...(d.UnitId             && { unit: findById(units, 'UnitId', d.UnitId) }),
              ...(d.AnnualTurnover     && { turnoverPerYear: String(d.AnnualTurnover) }),
              ...(d.CurrencyId         && { currency: findById(currencies, 'CurrencyId', d.CurrencyId) }),
              ...(d.BusinessLicenseNo  && { businessLicenseNo: d.BusinessLicenseNo }),
              ...(d.AdditionalInformation && { additionalInfo: d.AdditionalInformation }),
              // Business Profile
              ...(d.NumberOfEmployees  && { noOfEmployee: findByVal(EMPLOYEE_OPTIONS, d.NumberOfEmployees) }),
              ...(d.ExportBusinessPercent && { exportBusinessPct: findByVal(EXPORT_BUSINESS_OPTIONS, d.ExportBusinessPercent) }),
              ...(expArr.length        && { experienceInBusiness: expArr }),
              ...(d.BusinessInEuropePercent && { businessInEuropePct: findByVal(EUROPE_BUSINESS_OPTIONS, d.BusinessInEuropePercent) }),
              ...(d.ShippingTerms      && { shippingTerms: findByVal(SHIPPING_TERMS_OPTIONS, d.ShippingTerms) }),
              ...(d.BusinessType       && { businessType: findByVal(BUSINESS_TYPE_OPTIONS, d.BusinessType) }),
              ...(d.YearsInBusiness    && { yearsInBusiness: findByVal(YEARS_OPTIONS, d.YearsInBusiness) }),
              ...(d.YearsInEuropeanBusiness && { yearsEuropeanBusiness: findByVal(YEARS_OPTIONS, d.YearsInEuropeanBusiness) }),
              // Supply Chain (all entries)
              supplyChain: mappedSupplyChain,
              // Contacts & Certificates
              contacts: mappedContacts,
              ...(mappedCerts.length   && { certificates: mappedCerts }),
            };

            // Store file paths from API response
            setStoredPaths({
              businessLicenseFilePath: d.BusinessLicenseFilePath || '',
              companyLogoPath: d.CompanyLogoPath || '',
            });

            // Reset form with populated values merged over defaults
            reset((prev) => ({ ...prev, ...populated }));
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

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
      // Supply Chain
      supplyChain: [{ supplierName: '', city: '', country: null, email: '' }],
      contacts: [{ contactType: null, name: '', jobTitle: '', mobileNumber: '', email: '' }],
      certificates: [],
    },
    mode: 'onChange',
  });

  const { reset, watch, control, setValue, trigger, handleSubmit, formState: { isSubmitting } } = methods;
  const values = watch();

  const { fields: supplyChainFields, append: appendSupplyChain, remove: removeSupplyChain } = useFieldArray({ control, name: 'supplyChain' });
  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({ control, name: 'contacts' });
  const { fields: certificateFields, append: appendCertificate, remove: removeCertificate } = useFieldArray({ control, name: 'certificates' });

  // ── Profile Completion (reactive) ──
  const hasValue = (v) => v !== null && v !== undefined && v !== '' && v !== 0;
  const profileCompletion = useMemo(() => {
    const fields = [
      // Company Info
      values.supName,
      values.addressLine1,
      values.country,
      values.onboardingEmail,
      values.city,
      values.phone,
      values.webAddress,
      values.province,
      values.zipCode,
      values.mainExportMarket,
      // Setup Details
      values.capacityPerMonth,
      values.unit,
      values.turnoverPerYear,
      values.currency,
      values.businessLicenseNo,
      businessLicenseFile || storedPaths.businessLicenseFilePath || null,
      // Business Profile
      values.noOfEmployee,
      values.exportBusinessPct,
      values.experienceInBusiness?.length > 0 ? true : null,
      values.businessInEuropePct,
      values.shippingTerms,
      values.businessType,
      values.yearsInBusiness,
      values.yearsEuropeanBusiness,
      // Contacts — at least 1 with name filled
      values.contacts?.some(c => c.name) ? true : null,
      // Certificates — at least 1 with document filled
      values.certificates?.some(c => c.document) ? true : null,
      // Logo
      logoFile || storedPaths.companyLogoPath || null,
    ];
    const filled = fields.filter(hasValue).length;
    return Math.round((filled / fields.length) * 100);
  }, [values, logoFile, businessLicenseFile, storedPaths]);

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    setActiveTab((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setActiveTab((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);

      // ─── Upload all files via Company/UploadFile ───
      let logoPath = storedPaths.companyLogoPath || '';
      let businessLicensePath = storedPaths.businessLicenseFilePath || '';

      // Helper: upload a single file and return the path
      const uploadSingleFile = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await Post(`Company/UploadFile?companyId=${companyId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('File upload response:', res?.data);
        if (res?.data?.Success && res?.data?.FilePath) {
          return res.data.FilePath;
        }
        return '';
      };

      try {
        // Upload logo
        if (logoFile) {
          const path = await uploadSingleFile(logoFile);
          if (path) logoPath = path;
        }

        // Upload business license
        if (businessLicenseFile) {
          const path = await uploadSingleFile(businessLicenseFile);
          if (path) businessLicensePath = path;
        }

        // Upload certificate files (all in parallel)
        const certUploadPromises = data.certificates.map((cert, i) => {
          if (cert.file && typeof cert.file !== 'string') {
            return uploadSingleFile(cert.file).then((path) => { if (path) data.certificates[i].filePath = path; });
          }
          return Promise.resolve();
        });
        await Promise.all(certUploadPromises);
      } catch (uploadErr) {
        console.error('File upload error:', uploadErr);
        enqueueSnackbar('File upload failed, continuing with saved paths', { variant: 'warning' });
      }


      // Build certificates payload
      const uploadedCertificates = data.certificates.map((cert) => ({
        Name: cert.document || '',
        FilePath: cert.filePath || '',
        IssuingBody: cert.description || '',
        CertificateNo: cert.certificateNo || '',
        IssueDate: cert.validityFrom ? dayjs(cert.validityFrom).format('YYYY-MM-DD') : '',
        ExpiryDate: cert.validityTo ? dayjs(cert.validityTo).format('YYYY-MM-DD') : '',
        Status: 'Active',
      }));


      const payload = {
        CompanyId: companyId,

        // Company Info
        OrganizationName: data.supName,
        Email: data.onboardingEmail,
        OnboardingEmail: data.onboardingEmail,
        Website: data.webAddress || '',
        CountryID: data.country?.Country_ID ? String(data.country.Country_ID) : '',
        AddressLine1: data.addressLine1,
        AddressLine2: data.addressLine2 || '',
        Province: data.province || '',
        City: data.city,
        Phone: data.phone,
        Fax: data.fax || '',
        ZipPostalCode: data.zipCode || '',
        ExportMarketId: data.mainExportMarket?.ExportMarketId || null,

        // Setup Details
        CapacityPerMonth: Number(data.capacityPerMonth) || 0,
        UnitId: data.unit?.UnitId || null,
        AnnualTurnover: Number(data.turnoverPerYear) || 0,
        CurrencyId: data.currency?.CurrencyId || null,
        BusinessLicenseNo: data.businessLicenseNo || '',
        BusinessLicenseFilePath: businessLicensePath,
        AdditionalInformation: data.additionalInfo || '',

        // Business Profile
        NumberOfEmployees: data.noOfEmployee?.value || '',
        ExportBusinessPercent: data.exportBusinessPct?.value || '',
        ExperienceInBusiness: Array.isArray(data.experienceInBusiness)
          ? data.experienceInBusiness.join(', ')
          : (data.experienceInBusiness || ''),
        BusinessInEuropePercent: data.businessInEuropePct?.value || '',
        ShippingTerms: data.shippingTerms?.value || '',
        BusinessType: data.businessType?.value || '',
        YearsInBusiness: data.yearsInBusiness?.value || '',
        YearsInEuropeanBusiness: data.yearsEuropeanBusiness?.value || '',

        // Logo
        CompanyLogoPath: logoPath,
        ProfileCompleted: true,

        // Supply Chain
        SupplyChain: data.supplyChain.map((sc) => ({
          SupplierName: sc.supplierName,
          City: sc.city,
          CountryID: sc.country ? parseInt(sc.country.Country_ID, 10) : 0,
          Email: sc.email,
        })),

        // Contacts
        Contacts: data.contacts.map((c) => ({
          ContactTypeId: c.contactType?.ContactTypeId || null,
          FullName: c.name,
          JobTitle: c.jobTitle || '',
          MobileNumber: c.mobileNumber,
          Email: c.email,
        })),

        // Certificates
        Certificates: uploadedCertificates,
      };

      console.log('Update Payload:', payload);

      const response = await Post('Company/UpdateProfile', payload);

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('Company profile updated successfully!', { variant: 'success' });
        setActiveTab(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(response?.data?.Message || 'Update failed');
      }

    } catch (error) {
      console.error('Submission error:', error);
      enqueueSnackbar(error.message || 'Something went wrong', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  });


  if (isLoading) {
    return (
      <LoadingScreen
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}
      />
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>

      {/* ── Minimal Page Header ── */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <Iconify icon="mdi:domain" width={22} sx={{ color: 'primary.main', flexShrink: 0 }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
            Company Profile
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Fill in your company details across all sections
          </Typography>
        </Box>
        <Box flex={1} />
        <Chip
          label={`Step ${activeTab + 1} / ${TABS.length}`}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: '0.72rem' }}
        />
      </Stack>

      {/* ── Profile Completion Bar ── */}
      <Card
        sx={{
          mb: 2,
          p: 2,
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="mdi:chart-donut" width={18} sx={{ color: profileCompletion === 100 ? 'success.main' : 'primary.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
              Profile Completion
            </Typography>
          </Stack>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              fontSize: '0.85rem',
              color: profileCompletion === 100 ? 'success.main' : profileCompletion >= 70 ? 'warning.main' : 'primary.main',
            }}
          >
            {profileCompletion}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={profileCompletion}
          sx={{
            height: 8,
            borderRadius: 0,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            '& .MuiLinearProgress-bar': {
              borderRadius: 0,
              bgcolor: profileCompletion === 100 ? 'success.main' : profileCompletion >= 70 ? 'warning.main' : 'primary.main',
              transition: 'width 0.6s ease',
            },
          }}
        />
      </Card>

      {/* ── Tabs ── */}
      <Card
        sx={{
          mb: 2,
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1,
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'text.secondary',
              textTransform: 'none',
              gap: 0.75,
              px: 2,
              transition: 'color 0.2s ease',
              '&.Mui-selected': { color: 'primary.main' },
            },
            '& .MuiTabs-indicator': {
              bgcolor: 'primary.main',
              height: 2,
              borderRadius: '2px 2px 0 0',
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            },
          }}
        >
          {TABS.map((tab, i) => (
            <Tab
              key={tab.label}
              label={tab.label}
              icon={<Iconify icon={tab.icon} width={16} />}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Card>

      {/* ── Form ── */}
      <FormProvider methods={methods} onSubmit={onSubmit}>

        {/* Tab 0: Company Information */}
        <TabPanel value={activeTab} index={0}>
          <Card sx={SECTION_CARD_SX}>
            <SectionHeader
              icon="mdi:domain"
              title="Company Information"
              subtitle="Primary details and contact address"
              badge="Required"
            />
            <Grid container spacing={2}>
              <Grid xs={12}>
                <RHFTextField name="supName" label="Company Name *" placeholder="e.g. ABC Textiles" InputProps={{ startAdornment: <InputAdornment position="start"><Iconify icon="mdi:domain" width={18} sx={{ color: 'text.disabled' }} /></InputAdornment> }} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12}>
                <RHFTextField name="addressLine1" label="Address Line 1 *" placeholder="Flat A, 10/F, Lockhart Centre" InputProps={{ startAdornment: <InputAdornment position="start"><Iconify icon="mdi:map-marker-outline" width={18} sx={{ color: 'text.disabled' }} /></InputAdornment> }} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12}>
                <RHFTextField name="addressLine2" label="Address Line 2" placeholder="Building, Street, Suite etc." sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={4}>
                <RHFAutocomplete name="country" label="Country *" placeholder="Select Country" options={countries} getOptionLabel={(o) => o?.Country_Name || ''} isOptionEqualToValue={(o, v) => o?.Country_ID === v?.Country_ID} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={4}>
                <RHFTextField name="onboardingEmail" label="Email *" placeholder="contact@company.com" type="email" InputProps={{ startAdornment: <InputAdornment position="start"><Iconify icon="mdi:email-outline" width={18} sx={{ color: 'text.disabled' }} /></InputAdornment> }} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={4}>
                <RHFTextField name="province" label="Province / State" placeholder="Province" sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={4}>
                <RHFTextField name="city" label="City *" placeholder="Hong Kong" InputProps={{ startAdornment: <InputAdornment position="start"><Iconify icon="mdi:city-variant-outline" width={18} sx={{ color: 'text.disabled' }} /></InputAdornment> }} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={4}>
                <RHFTextField name="phone" label="Phone *" placeholder="+852 2369-4734" InputProps={{ startAdornment: <InputAdornment position="start"><Iconify icon="mdi:phone-outline" width={18} sx={{ color: 'text.disabled' }} /></InputAdornment> }} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={4}>
                <RHFTextField name="fax" label="Fax" placeholder="Fax number" InputProps={{ startAdornment: <InputAdornment position="start"><Iconify icon="mdi:fax" width={18} sx={{ color: 'text.disabled' }} /></InputAdornment> }} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={4}>
                <RHFTextField name="zipCode" label="Zip / Postal Code" placeholder="78121" sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={4}>
                <RHFTextField name="webAddress" label="Website" placeholder="https://www.example.com" InputProps={{ startAdornment: <InputAdornment position="start"><Iconify icon="mdi:web" width={18} sx={{ color: 'text.disabled' }} /></InputAdornment> }} sx={INPUT_SX} />
              </Grid>
              <Grid xs={12} md={4}>
                <RHFAutocomplete name="mainExportMarket" label="Main Export Market" placeholder="Select market" options={exportMarketValue} getOptionLabel={(o) => o?.Name || ''} isOptionEqualToValue={(o, v) => o?.ExportMarketId === v?.ExportMarketId} sx={INPUT_SX} />
              </Grid>

            </Grid>
          </Card>
        </TabPanel>

        {/* Tab 1: Setup Details */}
        <TabPanel value={activeTab} index={1}>
          <Card sx={SECTION_CARD_SX}>
            <SectionHeader
              icon="mdi:cog-outline"
              title="Setup Details"
              subtitle="Capacity, financials, and licensing"
              badge="Required"
            />
            <Grid container spacing={2}>
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
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.75, display: 'block' }}>
                    Business License Document *
                  </Typography>
                  {storedPaths.businessLicenseFilePath && !businessLicenseFile && (
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Iconify icon="mdi:file-check-outline" width={18} sx={{ color: 'primary.main' }} />
                      <Typography
                        variant="caption"
                        component="a"
                        href={storedPaths.businessLicenseFilePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: 'primary.main', textDecoration: 'underline', fontWeight: 500, cursor: 'pointer' }}
                      >
                        View Uploaded File
                      </Typography>
                    </Stack>
                  )}
                  <FileUploadButton file={businessLicenseFile} onFileChange={setBusinessLicenseFile} onClear={() => setBusinessLicenseFile(null)} label="Upload license document" hint="PDF, JPG, PNG up to 5MB" />
                </Box>
              </Grid>
              <Grid xs={12}>
                <RHFTextField name="additionalInfo" label="Additional Information" placeholder="Any other relevant details about your company..." multiline rows={3} sx={INPUT_SX} />
              </Grid>
            </Grid>
          </Card>
        </TabPanel>

        {/* Tab 2: Business Profile */}
        <TabPanel value={activeTab} index={2}>
          <Card sx={SECTION_CARD_SX}>
            <SectionHeader
              icon="mdi:chart-bar"
              title="Company Profile"
              subtitle="Business metrics, experience, and operational details"
              badge="Required"
            />
            <Grid container spacing={2}>
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
                      <InputLabel sx={{ fontSize: '0.875rem' }}>Experience in Business</InputLabel>
                      <Select
                        {...field}
                        multiple
                        input={<OutlinedInput label="Experience in Business" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 0.25 }}>
                            {selected.map((val) => (
                              <Chip
                                key={val}
                                label={val}
                                size="small"
                                color="primary"
                                variant="soft"
                                onMouseDown={(e) => e.stopPropagation()}
                                onDelete={(e) => {
                                  e.stopPropagation();
                                  const newVal = field.value.filter((v) => v !== val);
                                  field.onChange(newVal);
                                }}
                                deleteIcon={
                                  <Iconify
                                    icon="eva:close-fill"
                                    width={14}
                                    onMouseDown={(e) => e.stopPropagation()}
                                  />
                                }
                                sx={{
                                  fontWeight: 500,
                                  fontSize: '0.75rem',
                                  borderRadius: '6px',
                                  height: 24,
                                }}
                              />
                            ))}
                          </Box>
                        )}
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': { borderRadius: '8px' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                            borderWidth: '1.5px',
                          },
                        }}
                      >
                        {EXPERIENCE_OPTIONS.map((opt) => (
                          <MenuItem
                            key={opt.value}
                            value={opt.value}
                            sx={{
                              fontSize: '0.875rem',
                              borderRadius: '6px',
                              mx: 0.5,
                              '&.Mui-selected': {
                                bgcolor: 'primary.lighter',
                                color: 'primary.main',
                                fontWeight: 600,
                                '&:hover': { bgcolor: 'primary.light' },
                              },
                            }}
                          >
                            {opt.label}
                          </MenuItem>
                        ))}
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
        </TabPanel>

        {/* ── Supply Chain Tab (commented out - not active) ──
        <TabPanel value={activeTab} index={3}>
          ... Supply Chain UI ...
        </TabPanel>
        */}

        {/* Tab 3: Contacts */}
        <TabPanel value={activeTab} index={3}>
          <Card sx={SECTION_CARD_SX}>
            <SectionHeader
              icon="mdi:contacts-outline"
              title="Contact Information"
              subtitle="Add key contacts for different departments"
              badge={contactFields.length > 0 ? `${contactFields.length} contacts` : 'Required'}
            />
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '10px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.neutral' }}>
                    {['Contact Type', 'Full Name', 'Job Title', 'Mobile Number', 'Email', ''].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.72rem', color: 'text.secondary', textTransform: 'uppercase', py: 1.5, whiteSpace: 'nowrap' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contactFields.map((field, index) => (
                    <TableRow key={field.id} sx={{ '&:last-child td': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}>
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
                        <IconButton size="small" onClick={() => removeContact(index)} disabled={contactFields.length === 1} sx={{ color: 'error.main', bgcolor: (theme) => alpha(theme.palette.error.main, 0.08), borderRadius: '6px' }}>
                          <Iconify icon="mdi:trash-can-outline" width={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
              <Button size="small" variant="outlined" startIcon={<Iconify icon="mdi:plus" width={16} />} onClick={() => appendContact({ contactType: null, name: '', jobTitle: '', mobileNumber: '', email: '' })}>
                Add Contact
              </Button>
            </Box>
          </Card>
        </TabPanel>

        {/* Tab 4: Certificates */}
        <TabPanel value={activeTab} index={4}>
          <Card sx={SECTION_CARD_SX}>
            <SectionHeader
              icon="mdi:certificate-outline"
              title="Certificates & Patents"
              subtitle="Upload all certifications and patents your company holds"
              badge={certificateFields.length > 0 ? `${certificateFields.length} added` : 'Required'}
            />
            <Stack spacing={0}>
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
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button size="small" variant="contained" onClick={() => appendCertificate({ document: '', description: '', validityFrom: null, validityTo: null, file: null })} startIcon={<Iconify icon="mdi:plus" width={16} />}>
                  Add Certificate
                </Button>
              </Box>
            </Stack>
          </Card>
        </TabPanel>

        {/* Tab 5: Company Logo */}
        <TabPanel value={activeTab} index={5}>
          <Card sx={SECTION_CARD_SX}>
            <SectionHeader
              icon="mdi:image-outline"
              title="Company Logo"
              subtitle="Upload your company's logo"
            />
            <Stack spacing={2}>
              {/* Show existing logo from API */}
              {storedPaths.companyLogoPath && !logoFile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 120, height: 120, borderRadius: '14px', border: '2px solid', borderColor: 'divider', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', bgcolor: 'background.paper' }}>
                    <img src={storedPaths.companyLogoPath} alt="company logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </Box>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>Current Logo</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>Upload a new logo below to replace</Typography>
                  </Stack>
                </Box>
              )}
              {/* Show new logo preview */}
              {logoFile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 120, height: 120, borderRadius: '14px', border: '2px solid', borderColor: 'primary.main', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 12px rgba(51,102,255,0.12)', bgcolor: 'background.paper' }}>
                    <img src={URL.createObjectURL(logoFile)} alt="logo preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </Box>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>New Logo</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{logoFile.name}</Typography>
                  </Stack>
                </Box>
              )}
              <Box>
                <FileUploadButton file={logoFile} onFileChange={setLogoFile} onClear={() => setLogoFile(null)} accept="image/*" label="Upload company logo" hint="PNG, JPG up to 5MB" />
              </Box>
            </Stack>
          </Card>
        </TabPanel>

        {/* ── Navigation Buttons ── */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
          <Button
            color="inherit"
            disabled={activeTab === 0 || isSubmitting || isLoading}
            onClick={handleBack}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
            sx={{ borderRadius: 2, fontSize: '0.82rem' }}
          >
            Back
          </Button>

          {activeTab === TABS.length - 1 ? (
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting || isLoading}
              endIcon={<Iconify icon="eva:checkmark-fill" />}
              sx={{ borderRadius: 2, px: 3, fontSize: '0.82rem' }}
            >
              Submit Entry
            </LoadingButton>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
              sx={{ borderRadius: 2, px: 3, fontSize: '0.82rem' }}
            >
              Next
            </Button>
          )}
        </Stack>

      </FormProvider>
    </Container>
  );
}
