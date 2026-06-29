import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { Controller, useForm, useWatch, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSearchParams } from 'react-router-dom';
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
    Alert,
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
    Avatar,
    InputAdornment,
} from '@mui/material';

import { LoadingScreen } from 'src/components/loading-screen';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
    RHFAutocomplete,
    RHFTextField,
} from 'src/components/hook-form';
import { Get, Post } from 'src/api/apibasemethods';

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPLOYEE_OPTIONS = ['1-10', '11-50', '51-200', '201-500', 'Over 500'].map(opt => ({
    label: opt,
    value: opt
}));

const EXPORT_BUSINESS_OPTIONS = ['0%', '25%', '50%', '75%', '100%'].map(opt => ({
    label: opt,
    value: opt
}));

const EUROPE_BUSINESS_OPTIONS = ['0%', 'Over 25%', 'Over 50%', 'Over 75%', '100%'].map(opt => ({
    label: opt,
    value: opt
}));

const SHIPPING_TERMS_OPTIONS = ['FOB', 'CIF', 'EXW', 'DDP', 'CFR'].map(opt => ({
    label: opt,
    value: opt
}));

const YEARS_OPTIONS = ['1-2', '3-5', '6-10', 'Over 10'].map(opt => ({
    label: opt,
    value: opt
}));

const BUSINESS_TYPE_OPTIONS = ['Manufacturer', 'Trader', 'Agent', 'Distributor'].map(opt => ({
    label: opt,
    value: opt
}));

const EXPERIENCE_OPTIONS = ['Whole Sale', 'Retail', 'Export', 'Import', 'E-Commerce'].map(opt => ({
    label: opt,
    value: opt
}));

const EXPORT_MARKET_OPTIONS = ['Europe', 'USA', 'Asia', 'Middle East', 'Africa'].map(opt => ({
    label: opt,
    value: opt
}));

const CONTACT_TYPE_OPTIONS = ['BUSINESS', 'TECHNICAL', 'FINANCE', 'LOGISTICS', 'OTHER'].map(opt => ({
    label: opt,
    value: opt
}));

const UNIT_OPTIONS = ['KG', 'TON', 'PCS', 'MTR'].map(opt => ({
    label: opt,
    value: opt
}));

const CURRENCY_OPTIONS = ['EURO', 'USD', 'GBP', 'PKR'].map(opt => ({
    label: opt,
    value: opt
}));

const DOCUMENT_OPTIONS = ['ISO Certificate', 'Business License', 'Patent', 'Quality Certificate', 'Other'].map(opt => ({
    label: opt,
    value: opt
}));

// Helper function to get country flag URL
const getCountryFlag = (countryCode) => {
    if (!countryCode) return '';
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PublicSupplierOnboardingForm() {
    const { enqueueSnackbar } = useSnackbar();
    const [searchParams] = useSearchParams();

    const vendorID = searchParams.get('vendorID');
    const companyID = searchParams.get('companyID');
    const otp = searchParams.get('otp');

    const [isLoading, setLoading] = useState(false);
    const [countries, setCountries] = useState([]);
    const [isLinkValid, setIsLinkValid] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    // Cert staged entry (outside RHF — own state because it has file + date)
    const [certEntry, setCertEntry] = useState({
        document: '',
        description: '',
        validityFrom: null,
        validityTo: null,
        file: null,
    });
    const [certList, setCertList] = useState([]);

    // Logo
    const [logoFile, setLogoFile] = useState(null);

    // ── Validation Schema ────────────────────────────────────────────────────────
    const NewSupplierSchema = Yup.object().shape({
        supName: Yup.string().required('Supplier Name is required'),
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
        mainExportMarket: Yup.object()
            .nullable()
            .shape({
                label: Yup.string().required(),
                value: Yup.string().required(),
            }),
        onboardingEmail: Yup.string()
            .required('Email is required')
            .email('Invalid email format'),
        capacityPerMonth: Yup.string().required('Capacity is required'),
        capacityUnit: Yup.object()
            .nullable()
            .required('Unit is required')
            .shape({
                label: Yup.string().required(),
                value: Yup.string().required(),
            }),
        turnoverPerYear: Yup.string().required('Turnover is required'),
        turnoverUnit: Yup.object()
            .nullable()
            .required('Currency is required')
            .shape({
                label: Yup.string().required(),
                value: Yup.string().required(),
            }),
        businessLicenseNo: Yup.string().required('Business License No is required'),
        additionalInfo: Yup.string().nullable(),
        noOfEmployee: Yup.object()
            .nullable()
            .required('No. of Employees is required')
            .shape({
                label: Yup.string().required(),
                value: Yup.string().required(),
            }),
        exportBusinessPct: Yup.object()
            .nullable()
            .required('% of Export Business is required')
            .shape({
                label: Yup.string().required(),
                value: Yup.string().required(),
            }),
        experienceInBusiness: Yup.array()
            .min(1, 'Select at least one experience type')
            .required('Experience in Business is required'),
        businessInEuropePct: Yup.object()
            .nullable()
            .required('% of Business in Europe is required')
            .shape({
                label: Yup.string().required(),
                value: Yup.string().required(),
            }),
        shippingTerms: Yup.object()
            .nullable()
            .required('Shipping Terms is required')
            .shape({
                label: Yup.string().required(),
                value: Yup.string().required(),
            }),
        yearsInBusiness: Yup.object()
            .nullable()
            .required('Years in Business is required')
            .shape({
                label: Yup.string().required(),
                value: Yup.string().required(),
            }),
        yearsEuropeanBusiness: Yup.object()
            .nullable()
            .required('Years in European Business is required')
            .shape({
                label: Yup.string().required(),
                value: Yup.string().required(),
            }),
        businessType: Yup.object()
            .nullable()
            .required('Business Type is required')
            .shape({
                label: Yup.string().required(),
                value: Yup.string().required(),
            }),
        contacts: Yup.array().of(
            Yup.object().shape({
                contactType: Yup.object()
                    .nullable()
                    .required('Contact Type is required')
                    .shape({
                        label: Yup.string().required(),
                        value: Yup.string().required(),
                    }),
                name: Yup.string().required('Name is required'),
                jobTitle: Yup.string().nullable(),
                mobileNumber: Yup.string().required('Mobile Number is required'),
                email: Yup.string()
                    .required('Email is required')
                    .email('Invalid email'),
            })
        ),
    });

    // ── React Hook Form ───────────────────────────────────────────────────────
    const methods = useForm({
        resolver: yupResolver(NewSupplierSchema),
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
            capacityUnit: UNIT_OPTIONS[0],
            turnoverPerYear: '',
            turnoverUnit: CURRENCY_OPTIONS[0],
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
            contacts: [
                { contactType: null, name: '', jobTitle: '', mobileNumber: '', email: '' },
            ],
        },
    });

    const {
        reset,
        watch,
        control,
        setValue,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const values = watch();

    const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
        control,
        name: 'contacts',
    });

    // ── Fetch Countries ───────────────────────────────────────────────────────
    const getCountries = async () => {
        try {
            const response = await Get('Country/GetAll');
            if (response.status === 200) {
                setCountries(response?.data?.Data || []);
            }
        } catch (error) {
            console.error('Error fetching countries:', error);
        }
    };

    useEffect(() => {
        if (isLinkValid) {
            getCountries();
        }
    }, [isLinkValid]);

    // ── Submit ────────────────────────────────────────────────────────────────
    const onSubmit = handleSubmit(async (data) => {
        console.log('📝 Form Data:', data);

        const payload = {
            vendorID,
            companyID,
            otp,
            supplierName: data.supName,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2,
            province: data.province,
            city: data.city,
            countryID: parseInt(data.country?.Country_ID, 10) || 0,
            phone: data.phone,
            fax: data.fax,
            zipCode: data.zipCode,
            webAddress: data.webAddress,
            mainExportMarket: data.mainExportMarket?.value || '',
            email: data.onboardingEmail,
            capacityPerMonth: data.capacityPerMonth,
            capacityUnit: data.capacityUnit?.value || '',
            turnoverPerYear: data.turnoverPerYear,
            turnoverUnit: data.turnoverUnit?.value || '',
            businessLicenseNo: data.businessLicenseNo,
            additionalInfo: data.additionalInfo,
            noOfEmployee: data.noOfEmployee?.value || '',
            exportBusinessPct: data.exportBusinessPct?.value || '',
            experienceInBusiness: data.experienceInBusiness,
            businessInEuropePct: data.businessInEuropePct?.value || '',
            shippingTerms: data.shippingTerms?.value || '',
            yearsInBusiness: data.yearsInBusiness?.value || '',
            yearsEuropeanBusiness: data.yearsEuropeanBusiness?.value || '',
            businessType: data.businessType?.value || '',
            contacts: data.contacts.map(contact => ({
                ...contact,
                contactType: contact.contactType?.value || '',
            })),
            certificates: certList,
        };

        console.log('📦 Payload to send:', payload);

        try {
            setLoading(true);

            // ✅ The interceptor will automatically add the Authorization header
            const response = await Post('Supplier/CompletePublicOnboarding', payload);

            console.log('✅ Response:', response);

            if (response.status === 200 || response.status === 201) {
                enqueueSnackbar('Your profile details submitted successfully!');
                reset();
                setCertList([]);
                setLogoFile(null);
            } else {
                enqueueSnackbar(response?.data?.message || 'Failed to submit data', { variant: 'error' });
            }
        } catch (error) {
            console.error('❌ Error submitting form:', error);

            if (error?.response?.status === 401 || error?.response?.status === 403) {
                enqueueSnackbar('Authentication failed. Please login again.', { variant: 'error' });
            } else {
                enqueueSnackbar(
                    error?.response?.data?.message || error?.message || 'Something went wrong',
                    { variant: 'error' }
                );
            }
        } finally {
            setLoading(false);
        }
    });

    const handleCancel = () => {
        reset();
        setCertList([]);
        setLogoFile(null);
    };

    const handleAddCert = () => {
        if (!certEntry.document) {
            enqueueSnackbar('Please select a document type', { variant: 'warning' });
            return;
        }
        setCertList((prev) => [...prev, { ...certEntry }]);
        setCertEntry({
            document: '',
            description: '',
            validityFrom: null,
            validityTo: null,
            file: null,
        });
    };

    // ── Guards ────────────────────────────────────────────────────────────────
    if (!isLinkValid) {
        return (
            <Container maxWidth="sm" sx={{ mt: 10 }}>
                <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                    {errorMessage}
                </Alert>
            </Container>
        );
    }

    if (isLoading) {
        return (
            <LoadingScreen
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '70vh',
                }}
            />
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Container maxWidth="lg" sx={{ py: 5 }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4
            }}>
                <Box>
                    <Typography
                        sx={{
                            color: '#1a1a2e',
                            fontWeight: 700,
                            fontSize: '1.5rem',
                            letterSpacing: '0.5px',
                        }}
                        variant="h5"
                    >
                        Supplier Onboarding Details
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Onboard &rsaquo; Supplier Onboarding Details
                    </Typography>
                </Box>
                <Box
                    component="img"
                    src="/logo/Logo-mini.png"
                    alt="logo"
                    sx={{ width: '42px', height: '42px' }}
                />
            </Box>

            <FormProvider methods={methods} onSubmit={onSubmit}>
                <Stack spacing={4}>
                    {/* ══════════════════════════════════════════════
                        SECTION 1 — Company Information
                    ══════════════════════════════════════════════ */}
                    <Card
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            border: '1px solid #e8ecf4',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#1a1a2e',
                                fontWeight: 700,
                                mb: 3,
                            }}
                        >
                            Company Information
                        </Typography>

                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={3}>
                            {/* Supplier Name */}
                            <Grid xs={12}>
                                <RHFTextField
                                    name="supName"
                                    label="Supplier Name *"
                                    placeholder="IVT International Ltd"
                                    InputProps={{
                                        startAdornment: (
                                            <Iconify
                                                icon="mdi:domain"
                                                width={20}
                                                sx={{ color: '#666', mr: 1 }}
                                            />
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': {
                                                borderColor: '#3366ff',
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Address Line 1 */}
                            <Grid xs={12}>
                                <RHFTextField
                                    name="addressLine1"
                                    label="Address Line 1 *"
                                    placeholder="Flat A, 10/F, Lockhart Centre"
                                    InputProps={{
                                        startAdornment: (
                                            <Iconify
                                                icon="mdi:home"
                                                width={20}
                                                sx={{ color: '#666', mr: 1 }}
                                            />
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': {
                                                borderColor: '#3366ff',
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Address Line 2 */}
                            <Grid xs={12}>
                                <RHFTextField
                                    name="addressLine2"
                                    label="Address Line 2"
                                    placeholder="Building, Street etc."
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': {
                                                borderColor: '#3366ff',
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Country */}
                            <Grid xs={12} md={4}>
                                <RHFAutocomplete
                                    name="country"
                                    label="Country *"
                                    placeholder="Select Country"
                                    options={countries}
                                    getOptionLabel={(option) => option?.Country_Name || ''}
                                    isOptionEqualToValue={(option, value) =>
                                        option?.Country_ID === value?.Country_ID
                                    }
                                    renderOption={(props, option) => (
                                        <Box
                                            component="li"
                                            {...props}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1.5,
                                                py: 1,
                                                px: 2,
                                            }}
                                        >
                                            {option?.Country_Code && (
                                                <img
                                                    src={getCountryFlag(option.Country_Code)}
                                                    alt={option.Country_Name}
                                                    style={{
                                                        width: 28,
                                                        height: 18,
                                                        objectFit: 'cover',
                                                        borderRadius: 2,
                                                        border: '1px solid #e0e0e0',
                                                        flexShrink: 0,
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            )}
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {option?.Country_Name}
                                            </Typography>
                                        </Box>
                                    )}
                                    TextFieldProps={{
                                        InputProps: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    {values?.country?.Country_Code ? (
                                                        <img
                                                            src={getCountryFlag(values.country.Country_Code)}
                                                            alt={values.country.Country_Name}
                                                            style={{
                                                                width: 28,
                                                                height: 18,
                                                                objectFit: 'cover',
                                                                borderRadius: 2,
                                                                border: '1px solid #e0e0e0',
                                                            }}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <Iconify
                                                            icon="mdi:flag"
                                                            width={20}
                                                            sx={{ color: '#666' }}
                                                        />
                                                    )}
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Province */}
                            <Grid xs={12} md={4}>
                                <RHFTextField
                                    name="province"
                                    label="Province"
                                    placeholder="Province"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': {
                                                borderColor: '#3366ff',
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            {/* City */}
                            <Grid xs={12} md={4}>
                                <RHFTextField
                                    name="city"
                                    label="City *"
                                    placeholder="Hong Kong"
                                    InputProps={{
                                        startAdornment: (
                                            <Iconify
                                                icon="mdi:city"
                                                width={20}
                                                sx={{ color: '#666', mr: 1 }}
                                            />
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': {
                                                borderColor: '#3366ff',
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Phone */}
                            <Grid xs={12} md={4}>
                                <RHFTextField
                                    name="phone"
                                    label="Phone *"
                                    placeholder="852 2369-4734"
                                    InputProps={{
                                        startAdornment: (
                                            <Iconify
                                                icon="mdi:phone"
                                                width={20}
                                                sx={{ color: '#666', mr: 1 }}
                                            />
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': {
                                                borderColor: '#3366ff',
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Fax */}
                            <Grid xs={12} md={4}>
                                <RHFTextField
                                    name="fax"
                                    label="Fax"
                                    placeholder="123450..."
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': {
                                                borderColor: '#3366ff',
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Zip Code */}
                            <Grid xs={12} md={4}>
                                <RHFTextField
                                    name="zipCode"
                                    label="Zip Code"
                                    placeholder="78121..."
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': {
                                                borderColor: '#3366ff',
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Web Address */}
                            <Grid xs={12} md={4}>
                                <RHFTextField
                                    name="webAddress"
                                    label="Web Address *"
                                    placeholder="https://www.example.com"
                                    InputProps={{
                                        startAdornment: (
                                            <Iconify
                                                icon="mdi:web"
                                                width={20}
                                                sx={{ color: '#666', mr: 1 }}
                                            />
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': {
                                                borderColor: '#3366ff',
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Main Export Market */}
                            <Grid xs={12} md={4}>
                                <RHFAutocomplete
                                    name="mainExportMarket"
                                    label="Main Export Market *"
                                    placeholder="Select Export Market"
                                    options={EXPORT_MARKET_OPTIONS}
                                    getOptionLabel={(option) => option?.label || ''}
                                    isOptionEqualToValue={(option, value) =>
                                        option?.value === value?.value
                                    }
                                    TextFieldProps={{
                                        InputProps: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Iconify
                                                        icon="mdi:earth"
                                                        width={20}
                                                        sx={{ color: '#666' }}
                                                    />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Onboarding Email */}
                            <Grid xs={12} md={4}>
                                <RHFTextField
                                    name="onboardingEmail"
                                    label="Onboarding Email *"
                                    placeholder="lucindalee@ivt-hk.com"
                                    type="email"
                                    InputProps={{
                                        startAdornment: (
                                            <Iconify
                                                icon="mdi:email"
                                                width={20}
                                                sx={{ color: '#666', mr: 1 }}
                                            />
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': {
                                                borderColor: '#3366ff',
                                            },
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Card>

                    {/* ══════════════════════════════════════════════
                        SECTION 2 — Setup Details
                    ══════════════════════════════════════════════ */}
                    <Card
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            border: '1px solid #e8ecf4',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#1a1a2e',
                                fontWeight: 700,
                                mb: 3,
                            }}
                        >
                            Setup Details
                        </Typography>

                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={3}>
                            {/* Capacity per Month + Unit */}
                            <Grid xs={12} md={6}>
                                <Stack direction="row" spacing={1} alignItems="flex-start">
                                    <RHFTextField
                                        name="capacityPerMonth"
                                        label="Capacity per Month *"
                                        placeholder="100"
                                        sx={{
                                            flex: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&:hover fieldset': {
                                                    borderColor: '#3366ff',
                                                },
                                            },
                                        }}
                                        helperText="Please select the appropriate unit for your product"
                                    />
                                    <RHFAutocomplete
                                        name="capacityUnit"
                                        label="Unit"
                                        placeholder="Select Unit"
                                        options={UNIT_OPTIONS}
                                        getOptionLabel={(option) => option?.label || ''}
                                        isOptionEqualToValue={(option, value) =>
                                            option?.value === value?.value
                                        }
                                        sx={{ width: 120 }}
                                        TextFieldProps={{
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Iconify
                                                            icon="mdi:weight"
                                                            width={16}
                                                            sx={{ color: '#666' }}
                                                        />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                    />
                                </Stack>
                            </Grid>

                            {/* Turnover per Year + Currency */}
                            <Grid xs={12} md={6}>
                                <Stack direction="row" spacing={1} alignItems="flex-start">
                                    <RHFTextField
                                        name="turnoverPerYear"
                                        label="Turnover per Year *"
                                        placeholder="100"
                                        sx={{
                                            flex: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&:hover fieldset': {
                                                    borderColor: '#3366ff',
                                                },
                                            },
                                        }}
                                    />
                                    <RHFAutocomplete
                                        name="turnoverUnit"
                                        label="Currency"
                                        placeholder="Select Currency"
                                        options={CURRENCY_OPTIONS}
                                        getOptionLabel={(option) => option?.label || ''}
                                        isOptionEqualToValue={(option, value) =>
                                            option?.value === value?.value
                                        }
                                        sx={{ width: 130 }}
                                        TextFieldProps={{
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Iconify
                                                            icon="mdi:currency-usd"
                                                            width={16}
                                                            sx={{ color: '#666' }}
                                                        />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                    />
                                </Stack>
                            </Grid>

                            {/* Business License No + upload */}
                            <Grid xs={12} md={6}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <RHFTextField
                                        name="businessLicenseNo"
                                        label="Business License No. *"
                                        placeholder="2001"
                                        sx={{
                                            flex: 1,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&:hover fieldset': {
                                                    borderColor: '#3366ff',
                                                },
                                            },
                                        }}
                                    />
                                    <IconButton
                                        component="label"
                                        sx={{
                                            bgcolor: '#3366ff',
                                            color: '#fff',
                                            borderRadius: 1,
                                            '&:hover': { bgcolor: '#2952d6' },
                                        }}
                                    >
                                        <Iconify icon="mdi:upload" />
                                        <input type="file" hidden />
                                    </IconButton>
                                </Stack>
                            </Grid>

                            {/* Additional Info */}
                            <Grid xs={12}>
                                <RHFTextField
                                    name="additionalInfo"
                                    label="Additional Info"
                                    placeholder="Additional info..."
                                    multiline
                                    rows={3}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': {
                                                borderColor: '#3366ff',
                                            },
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Card>

                    {/* ══════════════════════════════════════════════
                        SECTION 3 — Business Numbers
                    ══════════════════════════════════════════════ */}
                    <Card
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            border: '1px solid #e8ecf4',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#1a1a2e',
                                fontWeight: 700,
                                mb: 3,
                            }}
                        >
                            Business Numbers
                        </Typography>

                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={3}>
                            {/* No. of Employee */}
                            <Grid xs={12} md={6}>
                                <RHFAutocomplete
                                    name="noOfEmployee"
                                    label="No. of Employee *"
                                    placeholder="Select Employee Range"
                                    options={EMPLOYEE_OPTIONS}
                                    getOptionLabel={(option) => option?.label || ''}
                                    isOptionEqualToValue={(option, value) =>
                                        option?.value === value?.value
                                    }
                                    TextFieldProps={{
                                        InputProps: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Iconify
                                                        icon="mdi:account-group"
                                                        width={20}
                                                        sx={{ color: '#666' }}
                                                    />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            {/* % of Export Business */}
                            <Grid xs={12} md={6}>
                                <RHFAutocomplete
                                    name="exportBusinessPct"
                                    label="% of Export Business *"
                                    placeholder="Select Percentage"
                                    options={EXPORT_BUSINESS_OPTIONS}
                                    getOptionLabel={(option) => option?.label || ''}
                                    isOptionEqualToValue={(option, value) =>
                                        option?.value === value?.value
                                    }
                                    TextFieldProps={{
                                        InputProps: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Iconify
                                                        icon="mdi:percent"
                                                        width={20}
                                                        sx={{ color: '#666' }}
                                                    />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Experience in Business Type — multi-select with Controller */}
                            <Grid xs={12} md={6}>
                                <Controller
                                    name="experienceInBusiness"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <FormControl fullWidth error={!!fieldState.error}>
                                            <InputLabel>Experience in Business Type *</InputLabel>
                                            <Select
                                                {...field}
                                                multiple
                                                input={<OutlinedInput label="Experience in Business Type *" />}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((val) => (
                                                            <Chip
                                                                key={val}
                                                                label={val}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: '#3366ff',
                                                                    color: '#fff',
                                                                    fontSize: 12,
                                                                }}
                                                            />
                                                        ))}
                                                    </Box>
                                                )}
                                                sx={{
                                                    borderRadius: 2,
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#3366ff',
                                                    },
                                                }}
                                            >
                                                {EXPERIENCE_OPTIONS.map((opt) => (
                                                    <MenuItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {fieldState.error && (
                                                <FormHelperText>{fieldState.error.message}</FormHelperText>
                                            )}
                                        </FormControl>
                                    )}
                                />
                            </Grid>

                            {/* % of Business in Europe */}
                            <Grid xs={12} md={6}>
                                <RHFAutocomplete
                                    name="businessInEuropePct"
                                    label="% of Business in Europe *"
                                    placeholder="Select Percentage"
                                    options={EUROPE_BUSINESS_OPTIONS}
                                    getOptionLabel={(option) => option?.label || ''}
                                    isOptionEqualToValue={(option, value) =>
                                        option?.value === value?.value
                                    }
                                    TextFieldProps={{
                                        InputProps: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Iconify
                                                        icon="mdi:map-marker"
                                                        width={20}
                                                        sx={{ color: '#666' }}
                                                    />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Shipping Terms */}
                            <Grid xs={12} md={6}>
                                <RHFAutocomplete
                                    name="shippingTerms"
                                    label="Shipping Terms *"
                                    placeholder="Select Shipping Terms"
                                    options={SHIPPING_TERMS_OPTIONS}
                                    getOptionLabel={(option) => option?.label || ''}
                                    isOptionEqualToValue={(option, value) =>
                                        option?.value === value?.value
                                    }
                                    TextFieldProps={{
                                        InputProps: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Iconify
                                                        icon="mdi:ship"
                                                        width={20}
                                                        sx={{ color: '#666' }}
                                                    />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Years in Business */}
                            <Grid xs={12} md={6}>
                                <RHFAutocomplete
                                    name="yearsInBusiness"
                                    label="Years in Business *"
                                    placeholder="Select Years"
                                    options={YEARS_OPTIONS}
                                    getOptionLabel={(option) => option?.label || ''}
                                    isOptionEqualToValue={(option, value) =>
                                        option?.value === value?.value
                                    }
                                    TextFieldProps={{
                                        InputProps: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Iconify
                                                        icon="mdi:clock"
                                                        width={20}
                                                        sx={{ color: '#666' }}
                                                    />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Years in European Business */}
                            <Grid xs={12} md={6}>
                                <RHFAutocomplete
                                    name="yearsEuropeanBusiness"
                                    label="Years in European Business *"
                                    placeholder="Select Years"
                                    options={YEARS_OPTIONS}
                                    getOptionLabel={(option) => option?.label || ''}
                                    isOptionEqualToValue={(option, value) =>
                                        option?.value === value?.value
                                    }
                                    TextFieldProps={{
                                        InputProps: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Iconify
                                                        icon="mdi:clock-outline"
                                                        width={20}
                                                        sx={{ color: '#666' }}
                                                    />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            {/* Business Type */}
                            <Grid xs={12} md={6}>
                                <RHFAutocomplete
                                    name="businessType"
                                    label="Business Type *"
                                    placeholder="Select Business Type"
                                    options={BUSINESS_TYPE_OPTIONS}
                                    getOptionLabel={(option) => option?.label || ''}
                                    isOptionEqualToValue={(option, value) =>
                                        option?.value === value?.value
                                    }
                                    TextFieldProps={{
                                        InputProps: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Iconify
                                                        icon="mdi:store"
                                                        width={20}
                                                        sx={{ color: '#666' }}
                                                    />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Card>

                    {/* ══════════════════════════════════════════════
                        SECTION 4 — General Contact Information
                    ══════════════════════════════════════════════ */}
                    <Card
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            border: '1px solid #e8ecf4',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#1a1a2e',
                                fontWeight: 700,
                                mb: 3,
                            }}
                        >
                            General Contact Information
                        </Typography>

                        <Divider sx={{ mb: 3 }} />

                        <TableContainer
                            component={Paper}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                        >
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                            Contact Type
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                            Name
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                            Job Title
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                            Mobile Number
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                            Email
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {contactFields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            {/* Contact Type */}
                                            <TableCell sx={{ minWidth: 180 }}>
                                                <Controller
                                                    name={`contacts.${index}.contactType`}
                                                    control={control}
                                                    render={({ field: f, fieldState }) => (
                                                        <RHFAutocomplete
                                                            {...f}
                                                            name={`contacts.${index}.contactType`}
                                                            label="Contact Type *"
                                                            placeholder="Select Type"
                                                            options={CONTACT_TYPE_OPTIONS}
                                                            getOptionLabel={(option) => option?.label || ''}
                                                            isOptionEqualToValue={(option, value) =>
                                                                option?.value === value?.value
                                                            }
                                                            size="small"
                                                            error={!!fieldState.error}
                                                            helperText={fieldState.error?.message}
                                                            TextFieldProps={{
                                                                InputProps: {
                                                                    startAdornment: (
                                                                        <InputAdornment position="start">
                                                                            <Iconify
                                                                                icon="mdi:account"
                                                                                width={16}
                                                                                sx={{ color: '#666' }}
                                                                            />
                                                                        </InputAdornment>
                                                                    ),
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </TableCell>

                                            {/* Name */}
                                            <TableCell sx={{ minWidth: 140 }}>
                                                <Controller
                                                    name={`contacts.${index}.name`}
                                                    control={control}
                                                    render={({ field: f, fieldState }) => (
                                                        <TextField
                                                            {...f}
                                                            size="small"
                                                            fullWidth
                                                            placeholder="Full Name"
                                                            error={!!fieldState.error}
                                                            helperText={fieldState.error?.message}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: 1,
                                                                    '&:hover fieldset': {
                                                                        borderColor: '#3366ff',
                                                                    },
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </TableCell>

                                            {/* Job Title */}
                                            <TableCell sx={{ minWidth: 130 }}>
                                                <Controller
                                                    name={`contacts.${index}.jobTitle`}
                                                    control={control}
                                                    render={({ field: f }) => (
                                                        <TextField
                                                            {...f}
                                                            size="small"
                                                            fullWidth
                                                            placeholder="Job Title"
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: 1,
                                                                    '&:hover fieldset': {
                                                                        borderColor: '#3366ff',
                                                                    },
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </TableCell>

                                            {/* Mobile Number */}
                                            <TableCell sx={{ minWidth: 160 }}>
                                                <Controller
                                                    name={`contacts.${index}.mobileNumber`}
                                                    control={control}
                                                    render={({ field: f, fieldState }) => (
                                                        <TextField
                                                            {...f}
                                                            size="small"
                                                            fullWidth
                                                            placeholder="852 2369-4734"
                                                            error={!!fieldState.error}
                                                            helperText={fieldState.error?.message}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: 1,
                                                                    '&:hover fieldset': {
                                                                        borderColor: '#3366ff',
                                                                    },
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </TableCell>

                                            {/* Email */}
                                            <TableCell sx={{ minWidth: 180 }}>
                                                <Controller
                                                    name={`contacts.${index}.email`}
                                                    control={control}
                                                    render={({ field: f, fieldState }) => (
                                                        <TextField
                                                            {...f}
                                                            size="small"
                                                            fullWidth
                                                            placeholder="email@example.com"
                                                            error={!!fieldState.error}
                                                            helperText={fieldState.error?.message}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: 1,
                                                                    '&:hover fieldset': {
                                                                        borderColor: '#3366ff',
                                                                    },
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </TableCell>

                                            {/* Delete */}
                                            <TableCell>
                                                <IconButton
                                                    color="error"
                                                    size="small"
                                                    onClick={() => removeContact(index)}
                                                    disabled={contactFields.length === 1}
                                                >
                                                    <Iconify icon="mdi:delete" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                startIcon={<Iconify icon="mdi:plus" />}
                                onClick={() =>
                                    appendContact({
                                        contactType: null,
                                        name: '',
                                        jobTitle: '',
                                        mobileNumber: '',
                                        email: '',
                                    })
                                }
                                sx={{
                                    bgcolor: '#3366ff',
                                    '&:hover': { bgcolor: '#2952d6' },
                                    borderRadius: 2,
                                }}
                            >
                                Add More
                            </Button>
                        </Box>
                    </Card>

                    {/* ══════════════════════════════════════════════
                        SECTION 5 — Certificates and Patents
                    ══════════════════════════════════════════════ */}
                    <Card
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            border: '1px solid #e8ecf4',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#1a1a2e',
                                fontWeight: 700,
                                mb: 1,
                            }}
                        >
                            Certificates and Patents
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Please upload all the certificates and patents the company has obtained:
                        </Typography>

                        <Divider sx={{ mb: 3 }} />

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Grid container spacing={3} alignItems="stretch">
                                {/* Left — 4 fields in 2×2 grid */}
                                <Grid xs={12} md={8}>
                                    <Grid container spacing={2}>





                                        {/* Validity From — MUI DatePicker */}
                                        <Grid xs={12} md={6}>
                                            <DatePicker
                                                label="Validity From *"
                                                value={certEntry.validityFrom}
                                                onChange={(val) =>
                                                    setCertEntry((p) => ({
                                                        ...p,
                                                        validityFrom: val,
                                                    }))
                                                }
                                                format="DD/MM/YYYY"
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        size: 'small',
                                                        sx: {
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 2,
                                                                '&:hover fieldset': {
                                                                    borderColor: '#3366ff',
                                                                },
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        </Grid>

                                        {/* Validity To — MUI DatePicker */}
                                        <Grid xs={12} md={6}>
                                            <DatePicker
                                                label="Validity To *"
                                                value={certEntry.validityTo}
                                                onChange={(val) =>
                                                    setCertEntry((p) => ({
                                                        ...p,
                                                        validityTo: val,
                                                    }))
                                                }
                                                format="DD/MM/YYYY"
                                                minDate={certEntry.validityFrom || undefined}
                                                slotProps={{
                                                    textField: {
                                                        fullWidth: true,
                                                        size: 'small',
                                                        sx: {
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 2,
                                                                '&:hover fieldset': {
                                                                    borderColor: '#3366ff',
                                                                },
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>

                                {/* Right — file drop zone, same height as left */}
                                <Grid xs={12} md={4} sx={{ display: 'flex' }}>
                                    <Box
                                        component="label"
                                        sx={{
                                            border: '2px dashed #d0d7e2',
                                            borderRadius: 2,
                                            p: 3,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '100%',
                                            bgcolor: '#fafbfc',
                                            transition: 'background 0.2s',
                                            '&:hover': { bgcolor: '#f0f4ff' },
                                        }}
                                    >
                                        <Iconify
                                            icon="mdi:cloud-upload-outline"
                                            sx={{ fontSize: 48, color: '#3366ff', mb: 1 }}
                                        />
                                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                            Drop or Select file
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ mt: 0.5, textAlign: 'center' }}
                                        >
                                            Drop files here or click{' '}
                                            <Box
                                                component="span"
                                                sx={{ color: '#3366ff', textDecoration: 'underline' }}
                                            >
                                                browse
                                            </Box>{' '}
                                            through your machine
                                        </Typography>
                                        <input
                                            type="file"
                                            hidden
                                            onChange={(e) =>
                                                setCertEntry((p) => ({
                                                    ...p,
                                                    file: e.target.files[0] || null,
                                                }))
                                            }
                                        />
                                        {certEntry.file && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    mt: 1,
                                                    color: '#3366ff',
                                                    wordBreak: 'break-all',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {certEntry.file.name}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>

                            </Grid>
                        </LocalizationProvider>


                    </Card>

                    {/* ══════════════════════════════════════════════
                        SECTION 6 — Logo
                    ══════════════════════════════════════════════ */}
                    <Card
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            border: '1px solid #e8ecf4',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#1a1a2e',
                                fontWeight: 700,
                                mb: 3,
                            }}
                        >
                            Logo
                        </Typography>

                        <Divider sx={{ mb: 3 }} />

                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2">Supplier&apos;s Logo</Typography>
                            <IconButton
                                component="label"
                                sx={{
                                    bgcolor: '#3366ff',
                                    color: '#fff',
                                    borderRadius: 1,
                                    '&:hover': { bgcolor: '#2952d6' },
                                }}
                            >
                                <Iconify icon="mdi:upload" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(e) => setLogoFile(e.target.files[0] || null)}
                                />
                            </IconButton>
                            {logoFile && (
                                <Typography variant="caption" sx={{ color: '#3366ff' }}>
                                    {logoFile.name}
                                </Typography>
                            )}
                        </Stack>
                    </Card>

                    {/* ══════════════════════════════════════════════
                        Form Actions
                    ══════════════════════════════════════════════ */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        justifyContent="flex-end"
                        alignItems="center"
                    >
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={handleCancel}
                            startIcon={<Iconify icon="mdi:close" />}
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                py: 1.2,
                                borderColor: '#d0d5dd',
                                color: '#475467',
                                fontWeight: 600,
                                '&:hover': {
                                    borderColor: '#667085',
                                    bgcolor: '#f0f1f3',
                                },
                            }}
                        >
                            Cancel
                        </Button>
                        <LoadingButton
                            type="submit"
                            variant="contained"
                            color="primary"
                            loading={isSubmitting || isLoading}
                            startIcon={<Iconify icon="mdi:check" />}
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                py: 1.2,
                                fontWeight: 600,
                                bgcolor: '#3366ff',
                                '&:hover': {
                                    bgcolor: '#2952d6',
                                },
                            }}
                        >
                            Save Changes
                        </LoadingButton>
                    </Stack>
                </Stack>
            </FormProvider>
        </Container>
    );
}