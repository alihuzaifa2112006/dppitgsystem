import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { Controller, useForm, useWatch, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSearchParams, useLocation } from 'react-router-dom';
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
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Fade,
    Backdrop,
    Collapse,
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

const EMPLOYEE_OPTIONS = ['1-10', '11-50', '51-200', '201-500', 'Over 500'].map(opt => ({ label: opt, value: opt }));
const EXPORT_BUSINESS_OPTIONS = ['0%', '25%', '50%', '75%', '100%'].map(opt => ({ label: opt, value: opt }));
const EUROPE_BUSINESS_OPTIONS = ['0%', 'Over 25%', 'Over 50%', 'Over 75%', '100%'].map(opt => ({ label: opt, value: opt }));
const SHIPPING_TERMS_OPTIONS = ['FOB', 'CIF', 'EXW', 'DDP', 'CFR'].map(opt => ({ label: opt, value: opt }));
const YEARS_OPTIONS = ['1-2', '3-5', '6-10', 'Over 10'].map(opt => ({ label: opt, value: opt }));
const BUSINESS_TYPE_OPTIONS = ['Manufacturer', 'Trader', 'Agent', 'Distributor'].map(opt => ({ label: opt, value: opt }));
const EXPERIENCE_OPTIONS = ['Whole Sale', 'Retail', 'Export', 'Import', 'E-Commerce'].map(opt => ({ label: opt, value: opt }));
const EXPORT_MARKET_OPTIONS = ['Europe', 'USA', 'Asia', 'Middle East', 'Africa'].map(opt => ({ label: opt, value: opt }));
const CONTACT_TYPE_OPTIONS = ['BUSINESS', 'TECHNICAL', 'FINANCE', 'LOGISTICS', 'OTHER'].map(opt => ({ label: opt, value: opt }));
const UNIT_OPTIONS = ['KG', 'TON', 'PCS', 'MTR'].map(opt => ({ label: opt, value: opt }));
const CURRENCY_OPTIONS = ['EURO', 'USD', 'GBP', 'PKR'].map(opt => ({ label: opt, value: opt }));
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
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    },
};

/**
 * Decrypt OTP - Replace this with your actual decryption logic
 * For demo purposes, we're just returning the OTP as-is
 */
const decryptOTP = (encryptedOTP) => {
    if (!encryptedOTP) return null;
    return encryptedOTP;
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

SectionHeader.defaultProps = {
    subtitle: '',
    badge: '',
};

function FieldLabel({ children }) {
    return (
        <Typography
            component="span"
            variant="caption"
            sx={{ color: '#475569', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
            {children}
        </Typography>
    );
}

FieldLabel.propTypes = {
    children: PropTypes.node.isRequired,
};

// ─── Validation Schema ────────────────────────────────────────────────────────

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
    mainExportMarket: Yup.object().nullable().shape({ label: Yup.string().required(), value: Yup.string().required() }),
    onboardingEmail: Yup.string().required('Email is required').email('Invalid email format'),
    capacityPerMonth: Yup.string().required('Capacity is required'),
    capacityUnit: Yup.object().nullable().required('Unit is required').shape({ label: Yup.string().required(), value: Yup.string().required() }),
    turnoverPerYear: Yup.string().required('Turnover is required'),
    turnoverUnit: Yup.object().nullable().required('Currency is required').shape({ label: Yup.string().required(), value: Yup.string().required() }),
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
            contactType: Yup.object().nullable().required('Contact Type is required').shape({ label: Yup.string().required(), value: Yup.string().required() }),
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
            validityFrom: Yup.date().nullable().required('Valid from date is required'),
            validityTo: Yup.date().nullable().required('Valid to date is required'),
            file: Yup.mixed().nullable(),
        })
    ),
});

// ─── OTP Dialog Component ────────────────────────────────────────────────────

function OTPDialog({ open, onVerify, isLoading, error }) {
    const [otp, setOtp] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (open) {
            setOtp('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (otp.trim()) {
            onVerify(otp.trim().toUpperCase());
        }
    };

    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
            disableEscapeKeyDown
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 500,
                    sx: { backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)' },
                },
            }}
        >
            <Fade in={open} timeout={400}>
                <Box>
                    <DialogTitle
                        sx={{
                            textAlign: 'center',
                            pt: 4,
                            pb: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1.5,
                        }}
                    >
                        <Box
                            sx={{
                                width: 72,
                                height: 72,
                                borderRadius: '50%',
                                bgcolor: '#eef2ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Iconify icon="mdi:shield-lock-outline" width={40} sx={{ color: '#3b5bdb' }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            Enter OTP to Unlock
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                            Please enter the one-time password to access the supplier onboarding form.
                        </Typography>
                    </DialogTitle>

                    <DialogContent sx={{ pt: 3, pb: 2 }}>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                inputRef={inputRef}
                                fullWidth
                                autoFocus
                                type="text"
                                placeholder="Enter OTP here..."
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                error={!!error}
                                helperText={error || 'Enter the OTP from your invitation link'}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                        fontSize: '1.1rem',
                                        backgroundColor: '#f8fafc',
                                        '& fieldset': { borderColor: '#e2e8f0' },
                                        '&:hover fieldset': { borderColor: '#94a3b8' },
                                        '&.Mui-focused fieldset': { borderColor: '#3b5bdb', borderWidth: '1.5px' },
                                    },
                                    '& .MuiInputLabel-root': { fontSize: '0.875rem' },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Iconify icon="mdi:key-outline" width={22} sx={{ color: '#94a3b8' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: otp && (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => setOtp('')}>
                                                <Iconify icon="mdi:close-circle" width={18} sx={{ color: '#94a3b8' }} />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <DialogActions sx={{ mt: 1, px: 0, pb: 0 }}>
                                <LoadingButton
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    loading={isLoading}
                                    disabled={!otp.trim()}
                                    sx={{
                                        borderRadius: '10px',
                                        py: 1.5,
                                        fontWeight: 700,
                                        fontSize: '0.95rem',
                                        textTransform: 'none',
                                        bgcolor: '#3b5bdb',
                                        boxShadow: 'none',
                                        '&:hover': { bgcolor: '#2f4ac0', boxShadow: 'none' },
                                        '&.Mui-disabled': { bgcolor: '#c7d2fe' },
                                    }}
                                >
                                    <Iconify icon="mdi:login" width={20} sx={{ mr: 1 }} />
                                    Verify & Unlock
                                </LoadingButton>
                            </DialogActions>
                        </form>
                    </DialogContent>
                </Box>
            </Fade>
        </Dialog>
    );
}

OTPDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onVerify: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    error: PropTypes.string,
};

OTPDialog.defaultProps = {
    isLoading: false,
    error: '',
};

// ─── Certificate Entry Component ─────────────────────────────────────────────

function CertificateEntry({ entry, onUpdate, onRemove, index, total }) {
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
                    <DatePicker
                        label="Valid From *"
                        value={entry.validityFrom}
                        onChange={(val) => onUpdate(index, 'validityFrom', val)}
                        format="DD/MM/YYYY"
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                size: 'small',
                                sx: INPUT_SX,
                            },
                        }}
                    />
                </Grid>

                <Grid xs={12} md={6}>
                    <DatePicker
                        label="Valid To *"
                        value={entry.validityTo}
                        onChange={(val) => onUpdate(index, 'validityTo', val)}
                        format="DD/MM/YYYY"
                        minDate={entry.validityFrom || undefined}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                size: 'small',
                                sx: INPUT_SX,
                            },
                        }}
                    />
                </Grid>

                <Grid xs={12}>
                    <Box
                        component="label"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 1.5,
                            borderRadius: '8px',
                            border: '1.5px dashed #c7d2fe',
                            cursor: 'pointer',
                            bgcolor: '#fff',
                            transition: 'all 0.15s ease',
                            '&:hover': { bgcolor: '#eef2ff', borderColor: '#818cf8' },
                        }}
                    >
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '8px',
                                bgcolor: entry.file ? '#eef2ff' : '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                border: '1px solid #e2e8f0',
                            }}
                        >
                            <Iconify
                                icon={entry.file ? 'mdi:file-document-outline' : 'mdi:cloud-upload-outline'}
                                width={20}
                                sx={{ color: entry.file ? '#3b5bdb' : '#94a3b8' }}
                            />
                        </Box>
                        <Box flex={1}>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b', fontSize: '0.8rem' }}>
                                {entry.file ? entry.file.name : 'Upload supporting document (optional)'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                {entry.file
                                    ? `${(entry.file.size / 1024).toFixed(1)} KB`
                                    : 'PDF, JPG, PNG up to 5MB'}
                            </Typography>
                        </Box>
                        {entry.file && (
                            <Chip
                                label="Remove"
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdate(index, 'file', null);
                                }}
                                sx={{
                                    bgcolor: '#fee2e2',
                                    color: '#ef4444',
                                    fontSize: '0.7rem',
                                    '&:hover': { bgcolor: '#fecaca' },
                                }}
                            />
                        )}
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            hidden
                            onChange={(e) => onUpdate(index, 'file', e.target.files[0] || null)}
                        />
                    </Box>
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
    total: PropTypes.number.isRequired,
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PublicSupplierOnboardingForm() {
    const location = useLocation();
    const { enqueueSnackbar } = useSnackbar();
    const [searchParams] = useSearchParams();

    const vendorID = searchParams.get('vendorID');
    const companyID = searchParams.get('companyID');
    const encryptedOTP = searchParams.get('otp');
    const expiry = searchParams.get('expiry');

    // ── OTP States ──────────────────────────────────────────────────────────
    const [isOTPVerified, setIsOTPVerified] = useState(false);
    const [isOTPLoading, setIsOTPLoading] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [decryptedOTP, setDecryptedOTP] = useState(null);

    // ── Form States ─────────────────────────────────────────────────────────
    const [isLoading, setLoading] = useState(false);
    const [countries, setCountries] = useState([]);
    const [isLinkValid] = useState(true);
    const [errorMessage] = useState('');
    const [logoFile, setLogoFile] = useState(null);

    // ── Decrypt OTP on mount ──────────────────────────────────────────────
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const directOtp = urlParams.get('otp');

        let targetEncryptedOTP = null;

        if (token) {
            try {
                const decodedString = atob(token);
                const decodedParams = new URLSearchParams(decodedString);
                targetEncryptedOTP = decodedParams.get('otp');
                console.log('✅ Token decoded successfully. Found OTP hash:', targetEncryptedOTP);
            } catch (e) {
                console.error('❌ Failed to decode token string:', e);
                setOtpError('Invalid or corrupted token link');
                return;
            }
        } else if (directOtp) {
            targetEncryptedOTP = directOtp;
        }

        if (targetEncryptedOTP) {
            try {
                const decrypted = decryptOTP(targetEncryptedOTP);
                setDecryptedOTP(decrypted);
                console.log('🔑 OTP Decrypted successfully! Actual Code:', decrypted);
            } catch (error) {
                console.error('❌ Failed to decrypt OTP:', error);
                setOtpError('Invalid OTP format in URL');
            }
        } else {
            setOtpError('No OTP configuration found or link expired.');
        }
    }, [location]);

    // ── React Hook Form ──────────────────────────────────────────────────────
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
            contacts: [{ contactType: null, name: '', jobTitle: '', mobileNumber: '', email: '' }],
            certificates: [],
        },
    });

    const {
        reset,
        watch,
        control,
        setValue,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = methods;
    const values = watch();

    const {
        fields: contactFields,
        append: appendContact,
        remove: removeContact,
    } = useFieldArray({ control, name: 'contacts' });

    const {
        fields: certificateFields,
        append: appendCertificate,
        remove: removeCertificate,
    } = useFieldArray({ control, name: 'certificates' });

    // ── Fetch Countries ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!isOTPVerified) return;
        Get('Country/GetAll')
            .then((res) => {
                if (res.status === 200) setCountries(res?.data?.Data || []);
            })
            .catch((err) => console.error('Error fetching countries:', err));
    }, [isOTPVerified]);

    // ── OTP Verification Handler ────────────────────────────────────────────
    const handleVerifyOTP = useCallback(
        (userEnteredOTP) => {
            setIsOTPLoading(true);
            setOtpError('');

            setTimeout(() => {
                console.log("--- OTP Verification Debug ---");
                console.log("User entered:", userEnteredOTP);
                console.log("Decrypted OTP:", decryptedOTP);

                if (!decryptedOTP) {
                    setOtpError('❌ OTP configuration missing or link expired.');
                    setIsOTPLoading(false);
                    return;
                }

                const isMatch = userEnteredOTP.trim().toUpperCase() === decryptedOTP.trim().toUpperCase();

                if (isMatch) {
                    setIsOTPVerified(true);
                    setIsOTPLoading(false);
                    enqueueSnackbar('✅ OTP verified successfully!', { variant: 'success' });
                } else {
                    setOtpError('Invalid OTP. Please check and try again.');
                    setIsOTPLoading(false);
                }
            }, 800);
        },
        [decryptedOTP, enqueueSnackbar]
    );

    // ── Submit ───────────────────────────────────────────────────────────────
    const onSubmit = handleSubmit(async (data) => {
        const payload = {
            vendorID,
            companyID,
            otp: encryptedOTP,
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
            contacts: data.contacts.map((c) => ({ ...c, contactType: c.contactType?.value || '' })),
            certificates: data.certificates.map((c) => ({
                document: c.document,
                description: c.description || '',
                validityFrom: c.validityFrom,
                validityTo: c.validityTo,
                file: c.file,
            })),
        };

        try {
            setLoading(true);
            const response = await Post('Supplier/CompletePublicOnboarding', payload);
            if (response.status === 200 || response.status === 201) {
                enqueueSnackbar('Profile submitted successfully!', { variant: 'success' });
                reset();
                setLogoFile(null);
            } else {
                enqueueSnackbar(response?.data?.message || 'Failed to submit', { variant: 'error' });
            }
        } catch (error) {
            console.error(error);
            enqueueSnackbar(error?.response?.data?.message || 'Something went wrong', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    });

    const handleCancel = () => {
        reset();
        setLogoFile(null);
    };

    // ── Guards ───────────────────────────────────────────────────────────────
    if (!isLinkValid) {
        return (
            <Container maxWidth="sm" sx={{ mt: 10 }}>
                <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                    {errorMessage}
                </Alert>
            </Container>
        );
    }

    if (!isOTPVerified) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f8fafc',
                    p: 2,
                }}
            >
                <OTPDialog
                    open
                    onVerify={handleVerifyOTP}
                    isLoading={isOTPLoading}
                    error={otpError}
                />
            </Box>
        );
    }

    // ── Render Full Form (OTP Verified) ─────────────────────────────────────
    return (
        <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                {/* ── Page Header ── */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Box>
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px', mb: 0.25 }}
                        >
                            Supplier Onboarding
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>Onboard</Typography>
                            <Iconify icon="mdi:chevron-right" width={14} sx={{ color: '#cbd5e1' }} />
                            <Typography variant="caption" sx={{ color: '#3b5bdb', fontWeight: 600 }}>
                                Supplier Details
                            </Typography>
                        </Stack>
                    </Box>
                    <Box
                        component="img"
                        src="/logo/Logo-mini.png"
                        alt="logo"
                        sx={{ width: 40, height: 40 }}
                    />
                </Stack>

                <FormProvider methods={methods} onSubmit={onSubmit}>
                    <Stack spacing={3}>
                        {/* ══════════════════ SECTION 1 — Company Information ══════════════════ */}
                        <Card sx={SECTION_CARD_SX}>
                            <SectionHeader
                                icon="mdi:domain"
                                title="Company Information"
                                subtitle="Enter your company's primary details and contact address"
                                badge="Required"
                            />
                            <Grid container spacing={2.5}>
                                <Grid xs={12}>
                                    <RHFTextField
                                        name="supName"
                                        label="Supplier Name *"
                                        placeholder="e.g. IVT International Ltd"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Iconify icon="mdi:domain" width={18} sx={{ color: '#94a3b8' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={INPUT_SX}
                                    />
                                </Grid>

                                <Grid xs={12}>
                                    <RHFTextField
                                        name="addressLine1"
                                        label="Address Line 1 *"
                                        placeholder="Flat A, 10/F, Lockhart Centre"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Iconify icon="mdi:map-marker-outline" width={18} sx={{ color: '#94a3b8' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={INPUT_SX}
                                    />
                                </Grid>

                                <Grid xs={12}>
                                    <RHFTextField
                                        name="addressLine2"
                                        label="Address Line 2"
                                        placeholder="Building, Street, Suite etc."
                                        sx={INPUT_SX}
                                    />
                                </Grid>

                                <Grid xs={12} md={4}>
                                    <RHFAutocomplete
                                        name="country"
                                        label="Country *"
                                        placeholder="Select Country"
                                        options={countries}
                                        getOptionLabel={(option) => option?.Country_Name || ''}
                                        isOptionEqualToValue={(option, value) => option?.Country_ID === value?.Country_ID}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, px: 1.5 }}>
                                                {option?.Country_Code && (
                                                    <Iconify
                                                        icon={`circle-flags:${option.Country_Code.toLowerCase()}`}
                                                        sx={{ width: 26, height: 26, flexShrink: 0 }}
                                                    />
                                                )}
                                                <Typography variant="body2">{option?.Country_Name}</Typography>
                                            </Box>
                                        )}
                                        TextFieldProps={{
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        {values?.country?.Country_Code ? (
                                                            <Iconify
                                                                icon={`circle-flags:${values.country.Country_Code.toLowerCase()}`}
                                                                sx={{ width: 26, height: 26, mr: -0.5, ml: 0.5 }}
                                                            />
                                                        ) : (
                                                            <Iconify icon="mdi:flag-outline" width={18} sx={{ color: '#94a3b8' }} />
                                                        )}
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        sx={INPUT_SX}
                                    />
                                </Grid>

                                <Grid xs={12} md={4}>
                                    <RHFTextField name="province" label="Province / State" placeholder="Province" sx={INPUT_SX} />
                                </Grid>

                                <Grid xs={12} md={4}>
                                    <RHFTextField
                                        name="city"
                                        label="City *"
                                        placeholder="Hong Kong"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Iconify icon="mdi:city-variant-outline" width={18} sx={{ color: '#94a3b8' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={INPUT_SX}
                                    />
                                </Grid>

                                <Grid xs={12} md={4}>
                                    <RHFTextField
                                        name="phone"
                                        label="Phone *"
                                        placeholder="+852 2369-4734"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Iconify icon="mdi:phone-outline" width={18} sx={{ color: '#94a3b8' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={INPUT_SX}
                                    />
                                </Grid>

                                <Grid xs={12} md={4}>
                                    <RHFTextField
                                        name="fax"
                                        label="Fax"
                                        placeholder="Fax number"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Iconify icon="mdi:fax" width={18} sx={{ color: '#94a3b8' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={INPUT_SX}
                                    />
                                </Grid>

                                <Grid xs={12} md={4}>
                                    <RHFTextField name="zipCode" label="Zip / Postal Code" placeholder="78121" sx={INPUT_SX} />
                                </Grid>

                                <Grid xs={12} md={4}>
                                    <RHFTextField
                                        name="webAddress"
                                        label="Website"
                                        placeholder="https://www.example.com"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Iconify icon="mdi:web" width={18} sx={{ color: '#94a3b8' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={INPUT_SX}
                                    />
                                </Grid>

                                <Grid xs={12} md={4}>
                                    <RHFAutocomplete
                                        name="mainExportMarket"
                                        label="Main Export Market"
                                        placeholder="Select market"
                                        options={EXPORT_MARKET_OPTIONS}
                                        getOptionLabel={(option) => option?.label || ''}
                                        isOptionEqualToValue={(option, value) => option?.value === value?.value}
                                        TextFieldProps={{
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Iconify icon="mdi:earth" width={18} sx={{ color: '#94a3b8' }} />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        sx={INPUT_SX}
                                    />
                                </Grid>

                                <Grid xs={12} md={4}>
                                    <RHFTextField
                                        name="onboardingEmail"
                                        label="Onboarding Email *"
                                        placeholder="contact@company.com"
                                        type="email"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Iconify icon="mdi:email-outline" width={18} sx={{ color: '#94a3b8' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={INPUT_SX}
                                    />
                                </Grid>
                            </Grid>
                        </Card>

                        {/* ══════════════════ SECTION 2 — Setup Details ══════════════════ */}
                        <Card sx={SECTION_CARD_SX}>
                            <SectionHeader
                                icon="mdi:cog-outline"
                                title="Setup Details"
                                subtitle="Capacity, financials, and licensing information"
                                badge="Required"
                            />
                            <Grid container spacing={2.5}>
                                <Grid xs={12} md={6}>
                                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                        <RHFTextField
                                            name="capacityPerMonth"
                                            label="Capacity per Month *"
                                            placeholder="100"
                                            sx={{ ...INPUT_SX, flex: 1 }}
                                            helperText="Monthly production capacity"
                                        />
                                        <RHFAutocomplete
                                            name="capacityUnit"
                                            label="Unit"
                                            options={UNIT_OPTIONS}
                                            getOptionLabel={(option) => option?.label || ''}
                                            isOptionEqualToValue={(option, value) => option?.value === value?.value}
                                            sx={{ ...INPUT_SX, width: 110 }}
                                            disableClearable
                                        />
                                    </Stack>
                                </Grid>

                                <Grid xs={12} md={6}>
                                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                        <RHFTextField
                                            name="turnoverPerYear"
                                            label="Annual Turnover *"
                                            placeholder="500,000"
                                            sx={{ ...INPUT_SX, flex: 1 }}
                                        />
                                        <RHFAutocomplete
                                            name="turnoverUnit"
                                            label="Currency"
                                            options={CURRENCY_OPTIONS}
                                            getOptionLabel={(option) => option?.label || ''}
                                            isOptionEqualToValue={(option, value) => option?.value === value?.value}
                                            sx={{ ...INPUT_SX, width: 115 }}
                                            disableClearable
                                        />
                                    </Stack>
                                </Grid>

                                <Grid xs={12} md={6}>
                                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                        <RHFTextField
                                            name="businessLicenseNo"
                                            label="Business License No. *"
                                            placeholder="e.g. BL-2001-HK"
                                            sx={{ ...INPUT_SX, flex: 1 }}
                                        />
                                        <Tooltip title="Upload license document">
                                            <IconButton
                                                component="label"
                                                sx={{
                                                    mt: 0.5,
                                                    width: 42,
                                                    height: 42,
                                                    bgcolor: '#eef2ff',
                                                    color: '#3b5bdb',
                                                    borderRadius: '8px',
                                                    border: '1px solid #c7d2fe',
                                                    '&:hover': { bgcolor: '#dde5ff' },
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Iconify icon="mdi:upload" width={18} />
                                                <input type="file" hidden />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </Grid>

                                <Grid xs={12}>
                                    <RHFTextField
                                        name="additionalInfo"
                                        label="Additional Information"
                                        placeholder="Any other relevant details about your company..."
                                        multiline
                                        rows={3}
                                        sx={INPUT_SX}
                                    />
                                </Grid>
                            </Grid>
                        </Card>

                        {/* ══════════════════ SECTION 3 — Business Profile ══════════════════ */}
                        <Card sx={SECTION_CARD_SX}>
                            <SectionHeader
                                icon="mdi:chart-bar"
                                title="Business Profile"
                                subtitle="Business metrics, experience, and operational details"
                                badge="Required"
                            />
                            <Grid container spacing={2.5}>
                                <Grid xs={12} md={6}>
                                    <RHFAutocomplete
                                        name="noOfEmployee"
                                        label="Number of Employees *"
                                        placeholder="Select range"
                                        options={EMPLOYEE_OPTIONS}
                                        getOptionLabel={(option) => option?.label || ''}
                                        isOptionEqualToValue={(option, value) => option?.value === value?.value}
                                        TextFieldProps={{
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Iconify icon="mdi:account-group-outline" width={18} sx={{ color: '#94a3b8' }} />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        sx={INPUT_SX}
                                    />
                                </Grid>

                                <Grid xs={12} md={6}>
                                    <RHFAutocomplete
                                        name="exportBusinessPct"
                                        label="Export Business % *"
                                        placeholder="Select percentage"
                                        options={EXPORT_BUSINESS_OPTIONS}
                                        getOptionLabel={(option) => option?.label || ''}
                                        isOptionEqualToValue={(option, value) => option?.value === value?.value}
                                        TextFieldProps={{
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Iconify icon="mdi:percent" width={18} sx={{ color: '#94a3b8' }} />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        sx={INPUT_SX}
                                    />
                                </Grid>

                                <Grid xs={12} md={6}>
                                    <Controller
                                        name="experienceInBusiness"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <FormControl fullWidth error={!!fieldState.error} sx={INPUT_SX}>
                                                <InputLabel sx={{ fontSize: '0.875rem' }}>
                                                    Experience in Business *
                                                </InputLabel>
                                                <Select
                                                    {...field}
                                                    multiple
                                                    input={<OutlinedInput label="Experience in Business *" />}
                                                    renderValue={(selected) => (
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                            {selected.map((val) => (
                                                                <Chip
                                                                    key={val}
                                                                    label={val}
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: '#eef2ff',
                                                                        color: '#3b5bdb',
                                                                        fontWeight: 600,
                                                                        fontSize: '0.72rem',
                                                                        border: '1px solid #c7d2fe',
                                                                        height: 22,
                                                                    }}
                                                                />
                                                            ))}
                                                        </Box>
                                                    )}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            sx: {
                                                                borderRadius: '10px',
                                                                mt: 0.5,
                                                                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                                                            },
                                                        },
                                                    }}
                                                >
                                                    {EXPERIENCE_OPTIONS.map((opt) => (
                                                        <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.875rem' }}>
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

                                <Grid xs={12} md={6}>
                                    <RHFAutocomplete
                                        name="businessInEuropePct"
                                        label="Business in Europe % *"
                                        placeholder="Select percentage"
                                        options={EUROPE_BUSINESS_OPTIONS}
                                        getOptionLabel={(option) => option?.label || ''}
                                        isOptionEqualToValue={(option, value) => option?.value === value?.value}
                                        TextFieldProps={{
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Iconify icon="mdi:map-marker-outline" width={18} sx={{ color: '#94a3b8' }} />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        sx={INPUT_SX}
                                    />
                                </Grid>

                                <Grid xs={12} md={6}>
                                    <RHFAutocomplete
                                        name="shippingTerms"
                                        label="Shipping Terms *"
                                        placeholder="Select terms"
                                        options={SHIPPING_TERMS_OPTIONS}
                                        getOptionLabel={(option) => option?.label || ''}
                                        isOptionEqualToValue={(option, value) => option?.value === value?.value}
                                        TextFieldProps={{
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Iconify icon="mdi:ship-wheel" width={18} sx={{ color: '#94a3b8' }} />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        sx={INPUT_SX}
                                    />
                                </Grid>

                                <Grid xs={12} md={6}>
                                    <RHFAutocomplete
                                        name="businessType"
                                        label="Business Type *"
                                        placeholder="Select type"
                                        options={BUSINESS_TYPE_OPTIONS}
                                        getOptionLabel={(option) => option?.label || ''}
                                        isOptionEqualToValue={(option, value) => option?.value === value?.value}
                                        TextFieldProps={{
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Iconify icon="mdi:store-outline" width={18} sx={{ color: '#94a3b8' }} />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        sx={INPUT_SX}
                                    />
                                </Grid>

                                <Grid xs={12} md={6}>
                                    <RHFAutocomplete
                                        name="yearsInBusiness"
                                        label="Years in Business *"
                                        placeholder="Select range"
                                        options={YEARS_OPTIONS}
                                        getOptionLabel={(option) => option?.label || ''}
                                        isOptionEqualToValue={(option, value) => option?.value === value?.value}
                                        TextFieldProps={{
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Iconify icon="mdi:calendar-range-outline" width={18} sx={{ color: '#94a3b8' }} />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        sx={INPUT_SX}
                                    />
                                </Grid>

                                <Grid xs={12} md={6}>
                                    <RHFAutocomplete
                                        name="yearsEuropeanBusiness"
                                        label="Years in European Business *"
                                        placeholder="Select range"
                                        options={YEARS_OPTIONS}
                                        getOptionLabel={(option) => option?.label || ''}
                                        isOptionEqualToValue={(option, value) => option?.value === value?.value}
                                        TextFieldProps={{
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Iconify icon="mdi:calendar-clock-outline" width={18} sx={{ color: '#94a3b8' }} />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        sx={INPUT_SX}
                                    />
                                </Grid>
                            </Grid>
                        </Card>

                        {/* ══════════════════ SECTION 4 — Contacts ══════════════════ */}
                        <Card sx={SECTION_CARD_SX}>
                            <SectionHeader
                                icon="mdi:contacts-outline"
                                title="Contact Information"
                                subtitle="Add key contacts for different departments"
                                badge={contactFields.length > 0 ? `${contactFields.length} contacts` : 'Required'}
                            />

                            <TableContainer
                                component={Paper}
                                variant="outlined"
                                sx={{ borderRadius: '10px', border: '1px solid #eef0f6', boxShadow: 'none' }}
                            >
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                            {['Contact Type', 'Full Name', 'Job Title', 'Mobile Number', 'Email', ''].map((h) => (
                                                <TableCell
                                                    key={h}
                                                    sx={{
                                                        fontWeight: 700,
                                                        fontSize: '0.72rem',
                                                        color: '#64748b',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.04em',
                                                        borderBottom: '1px solid #eef0f6',
                                                        py: 1.5,
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {h}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {contactFields.map((field, index) => (
                                            <TableRow
                                                key={field.id}
                                                sx={{
                                                    '&:last-child td': { border: 0 },
                                                    '&:hover': { bgcolor: '#fafbff' },
                                                }}
                                            >
                                                <TableCell sx={{ minWidth: 175, py: 1.5 }}>
                                                    <RHFAutocomplete
                                                        name={`contacts.${index}.contactType`}
                                                        label="Type"
                                                        placeholder="Select"
                                                        options={CONTACT_TYPE_OPTIONS}
                                                        getOptionLabel={(option) => option?.label || ''}
                                                        isOptionEqualToValue={(option, value) => option?.value === value?.value}
                                                        size="small"
                                                        sx={INPUT_SX}
                                                    />
                                                </TableCell>

                                                <TableCell sx={{ minWidth: 150, py: 1.5 }}>
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
                                                                sx={INPUT_SX}
                                                            />
                                                        )}
                                                    />
                                                </TableCell>

                                                <TableCell sx={{ minWidth: 130, py: 1.5 }}>
                                                    <Controller
                                                        name={`contacts.${index}.jobTitle`}
                                                        control={control}
                                                        render={({ field: f }) => (
                                                            <TextField
                                                                {...f}
                                                                size="small"
                                                                fullWidth
                                                                placeholder="Job Title"
                                                                sx={INPUT_SX}
                                                            />
                                                        )}
                                                    />
                                                </TableCell>

                                                <TableCell sx={{ minWidth: 155, py: 1.5 }}>
                                                    <Controller
                                                        name={`contacts.${index}.mobileNumber`}
                                                        control={control}
                                                        render={({ field: f, fieldState }) => (
                                                            <TextField
                                                                {...f}
                                                                size="small"
                                                                fullWidth
                                                                placeholder="+1 000 000 0000"
                                                                error={!!fieldState.error}
                                                                helperText={fieldState.error?.message}
                                                                sx={INPUT_SX}
                                                            />
                                                        )}
                                                    />
                                                </TableCell>

                                                <TableCell sx={{ minWidth: 190, py: 1.5 }}>
                                                    <Controller
                                                        name={`contacts.${index}.email`}
                                                        control={control}
                                                        render={({ field: f, fieldState }) => (
                                                            <TextField
                                                                {...f}
                                                                size="small"
                                                                fullWidth
                                                                placeholder="email@company.com"
                                                                error={!!fieldState.error}
                                                                helperText={fieldState.error?.message}
                                                                sx={INPUT_SX}
                                                            />
                                                        )}
                                                    />
                                                </TableCell>

                                                <TableCell sx={{ py: 1.5, pr: 2 }}>
                                                    <Tooltip title="Remove contact">
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => removeContact(index)}
                                                                disabled={contactFields.length === 1}
                                                                sx={{
                                                                    color: '#ef4444',
                                                                    bgcolor: '#fff1f1',
                                                                    borderRadius: '6px',
                                                                    '&:hover': { bgcolor: '#fee2e2' },
                                                                    '&.Mui-disabled': { color: '#cbd5e1', bgcolor: '#f8fafc' },
                                                                }}
                                                            >
                                                                <Iconify icon="mdi:trash-can-outline" width={16} />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Iconify icon="mdi:plus" width={16} />}
                                    onClick={() => appendContact({ contactType: null, name: '', jobTitle: '', mobileNumber: '', email: '' })}
                                    sx={{
                                        borderRadius: '8px',
                                        borderColor: '#c7d2fe',
                                        color: '#3b5bdb',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        px: 2.5,
                                        '&:hover': { bgcolor: '#eef2ff', borderColor: '#a5b4fc' },
                                    }}
                                >
                                    Add Contact
                                </Button>
                            </Box>
                        </Card>

                        {/* ══════════════════ SECTION 5 — Certificates (Multiple) ══════════════════ */}
                        <Card sx={SECTION_CARD_SX}>
                            <SectionHeader
                                icon="mdi:certificate-outline"
                                title="Certificates & Patents"
                                subtitle="Upload all certifications and patents your company holds"
                                badge={certificateFields.length > 0 ? `${certificateFields.length} added` : 'Optional'}
                            />

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Stack spacing={2}>
                                    {certificateFields.map((field, index) => (
                                        <CertificateEntry
                                            key={field.id}
                                            entry={field}
                                            index={index}
                                            total={certificateFields.length}
                                            onUpdate={(idx, key, value) => {
                                                const updated = [...certificateFields];
                                                updated[idx] = { ...updated[idx], [key]: value };
                                                setValue('certificates', updated);
                                            }}
                                            onRemove={removeCertificate}
                                        />
                                    ))}

                                    {certificateFields.length === 0 && (
                                        <Box
                                            sx={{
                                                p: 3,
                                                textAlign: 'center',
                                                border: '1.5px dashed #e2e8f0',
                                                borderRadius: '10px',
                                                bgcolor: '#fafbff',
                                            }}
                                        >
                                            <Iconify
                                                icon="mdi:certificate-outline"
                                                width={40}
                                                sx={{ color: '#c7d2fe', mb: 1 }}
                                            />
                                            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                                                No certificates added yet. Click the button below to add one.
                                            </Typography>
                                        </Box>
                                    )}

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() =>
                                                appendCertificate({
                                                    document: '',
                                                    description: '',
                                                    validityFrom: null,
                                                    validityTo: null,
                                                    file: null,
                                                })
                                            }
                                            startIcon={<Iconify icon="mdi:plus" width={16} />}
                                            sx={{
                                                bgcolor: '#3b5bdb',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                px: 2.5,
                                                textTransform: 'none',
                                                boxShadow: 'none',
                                                '&:hover': { bgcolor: '#2f4ac0', boxShadow: 'none' },
                                            }}
                                        >
                                            Add Certificate
                                        </Button>
                                    </Box>
                                </Stack>
                            </LocalizationProvider>
                        </Card>

                        {/* ══════════════════ SECTION 6 — Logo ══════════════════ */}
                        <Card sx={SECTION_CARD_SX}>
                            <SectionHeader
                                icon="mdi:image-outline"
                                title="Company Logo"
                                subtitle="Upload your company's logo (PNG or JPG recommended)"
                            />

                            <Box
                                component="label"
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 2,
                                    borderRadius: '10px',
                                    border: '1.5px dashed #c7d2fe',
                                    cursor: 'pointer',
                                    bgcolor: '#f8fafc',
                                    transition: 'all 0.15s ease',
                                    '&:hover': { bgcolor: '#eef2ff', borderColor: '#818cf8' },
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: '10px',
                                        bgcolor: logoFile ? '#eef2ff' : '#f1f5f9',
                                        border: '1px solid #e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                    }}
                                >
                                    {logoFile ? (
                                        <img
                                            src={URL.createObjectURL(logoFile)}
                                            alt="logo preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Iconify icon="mdi:image-plus-outline" width={24} sx={{ color: '#94a3b8' }} />
                                    )}
                                </Box>
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>
                                        {logoFile ? logoFile.name : 'Upload company logo'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                        {logoFile ? `${(logoFile.size / 1024).toFixed(1)} KB` : 'PNG, JPG up to 5MB'}
                                    </Typography>
                                </Box>
                                {logoFile && (
                                    <Chip
                                        label="Change"
                                        size="small"
                                        sx={{
                                            bgcolor: '#eef2ff',
                                            color: '#3b5bdb',
                                            fontSize: '0.72rem',
                                            border: '1px solid #c7d2fe',
                                        }}
                                    />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(e) => setLogoFile(e.target.files[0] || null)}
                                />
                            </Box>
                        </Card>

                        {/* ══════════════════ Form Actions ══════════════════ */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 1.5,
                                pt: 0.5,
                            }}
                        >
                            <Button
                                variant="outlined"
                                onClick={handleCancel}
                                startIcon={<Iconify icon="mdi:close" width={16} />}
                                sx={{
                                    borderRadius: '8px',
                                    px: 3,
                                    py: 1,
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    borderColor: '#e2e8f0',
                                    color: '#64748b',
                                    textTransform: 'none',
                                    '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                                }}
                            >
                                Cancel
                            </Button>
                            <LoadingButton
                                type="submit"
                                variant="contained"
                                loading={isSubmitting || isLoading}
                                startIcon={<Iconify icon="mdi:check" width={16} />}
                                sx={{
                                    borderRadius: '8px',
                                    px: 3.5,
                                    py: 1,
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    textTransform: 'none',
                                    bgcolor: '#3b5bdb',
                                    boxShadow: 'none',
                                    '&:hover': { bgcolor: '#2f4ac0', boxShadow: 'none' },
                                }}
                            >
                                Submit Onboarding
                            </LoadingButton>
                        </Box>
                    </Stack>
                </FormProvider>
            </Container>
        </Box>
    );
}