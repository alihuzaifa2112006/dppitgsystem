import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    Divider,
    CircularProgress,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { Post } from 'src/api/apibasemethods';
import { useSnackbar } from 'src/components/snackbar';

const SendInviteDialog = ({ open, onClose, supplier }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [generatedUrl, setGeneratedUrl] = useState('');
    const [currentOtp, setCurrentOtp] = useState('');
    const [subjectError, setSubjectError] = useState('');
    const [bodyError, setBodyError] = useState('');

    // Fetch, Parse, aur Company ID safely
    const companyID = useMemo(() => {
        try {
            const localStorageData = JSON.parse(localStorage.getItem('UserData') || '{}');
            const data = localStorageData?.Data || {};
            return data?.company?.CompanyId ?? data?.company?.CompanyID ?? 0;
        } catch (e) {
            console.error('Error parsing UserData from localStorage:', e);
            return 0;
        }
    }, []);

    // Single Unified Setup Effect
    useEffect(() => {
        if (open && supplier) {
            const vendorID = supplier?.InvitationId || supplier?.VendorID || 0;

            // Generate Secure Cryptographic 6-Digit Numeric OTP
            const generateSecureOTP = () => {
                const array = new Uint32Array(1);
                window.crypto.getRandomValues(array);
                // Math.floor(100000 + (randomFraction * 900000)) strictly guarantees a 6-digit number
                const secure6DigitOtp = Math.floor(100000 + (array[0] / (0xffffffff + 1)) * 900000).toString();
                return secure6DigitOtp;
            };

            const secureOtp = generateSecureOTP();
            setCurrentOtp(secureOtp);

            // Generate Strict 7-Day Expiry Timestamp
            const sevenDaysInMilliseconds = 7 * 24 * 60 * 60 * 1000;
            const expiryTimestamp = Date.now() + sevenDaysInMilliseconds;

            // Build Link Environment Paths
            const domain = window.location.origin;
            const onboardingUrl = `${domain}/supplier-onboarding?vendorID=${vendorID}&otp=${secureOtp}&expiry=${expiryTimestamp}&companyID=${companyID}`;

            setGeneratedUrl(onboardingUrl);
            setSubject(`Invitation to Onboard with DPP`);

            // OTP explicitly mapped into the initial editable template state
            setBody(
                `Hello ${supplier?.SupplierName || 'Supplier'},\n\nYou have been invited to complete your registration with DPP.\n\nYour Secure Access Passcode (OTP): ${secureOtp}\n\nPlease click the button below to access our secure onboarding portal. You will be prompted to enter the Passcode provided above before accessing the form.\n\nBest regards,\nDPP Team`
            );

            setSubjectError('');
            setBodyError('');
        }
    }, [open, supplier, companyID]);

    const validateForm = () => {
        let isValid = true;

        if (!subject.trim()) {
            setSubjectError('Subject is required');
            isValid = false;
        } else {
            setSubjectError('');
        }

        if (!body.trim()) {
            setBodyError('Message body context is required');
            isValid = false;
        } else {
            setBodyError('');
        }

        return isValid;
    };

    const handleSend = async () => {
        if (!supplier?.InvitationId) {
            enqueueSnackbar('Supplier invitation ID is missing', { variant: 'error' });
            return;
        }

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            const userParagraphs = body.trim().split('\n').map(p => p ? `<p style="margin: 0 0 16px 0;">${p}</p>` : '').join('');

            const premiumHtmlTemplate = `
                <div style="background-color: #f8f9fa; padding: 40px 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; line-height: 1.6;">
                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                       <tr>
                        <td style="background: linear-gradient(135deg, #3366ff 0%, #1e40af 100%); padding: 30px 40px; text-align: left;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">
                                Digital Product Passport
                            </h1>
                            <p style="margin: 4px 0 0 0; color: #93c5fd; font-size: 13px; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase;">
                                Powered By ITG
                            </p>
                        </td>
                    </tr>
                        <tr>
                            <td style="padding: 40px; font-size: 15px; color: #334155;">
                                ${userParagraphs}
                                
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 35px 0 25px 0; text-align: center;">
                                    <tr>
                                        <td>
                                            <a href="${generatedUrl}" target="_blank" style="background-color: #3366ff; color: #ffffff; padding: 14px 32px; font-weight: 600; font-size: 14px; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 10px rgba(51,102,255,0.25); border: 1px solid #2563eb;">
                                                Complete Onboarding Setup
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <p style="font-size: 12px; color: #94a3b8; margin: 30px 0 0 0; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                                    If the action button above does not work, please copy and paste the alternative secure web address link below directly into your internet browser utility tab bar:<br/>
                                    <a href="${generatedUrl}" target="_blank" style="color: #3366ff; word-break: break-all; text-decoration: underline;">${generatedUrl}</a>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="background-color: #f8fafc; padding: 20px 40px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9;">
                                <p style="margin: 0 0 4px 0; font-weight: 500;">Digital Procurement Platform (DPP)</p>
                                <p style="margin: 0;">This email contains an automated secure token string link key. Please do not forward or share this message sequence thread.</p>
                            </td>
                        </tr>
                    </table>
                </div>
            `;

            const payload = {
                invitationId: Number(supplier.InvitationId),
                subject: subject.trim(),
                body: premiumHtmlTemplate,
            };

            const response = await Post('Supplier/SendInvite', payload);

            if (response.status === 200 && response.data?.Success) {
                enqueueSnackbar('Invitation sent successfully!', { variant: 'success' });
                onClose();
            } else {
                enqueueSnackbar(response.data?.Message || 'Failed to send invitation', { variant: 'error' });
            }
        } catch (error) {
            console.error('Error sending invite:', error);
            enqueueSnackbar(error?.response?.data?.Message || 'Failed to send invitation', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                },
            }}
        >
            {/* Header */}
            <DialogTitle sx={{ p: 0 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 3,
                        py: 2,
                        borderBottom: '1px solid #f0f0f0',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2035', fontSize: '1rem' }}>
                            Send Invitation
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={handleClose}
                        size="small"
                        disabled={loading}
                        sx={{
                            color: '#667085',
                            '&:hover': { backgroundColor: '#f5f5f5', color: '#344054' },
                        }}
                    >
                        <Iconify icon="eva:close-fill" width={20} />
                    </IconButton>
                </Box>
            </DialogTitle>

            {/* Content */}
            <DialogContent sx={{ px: 3, py: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                    {/* To - Read Only */}
                    <Box>
                        <Typography variant="caption" sx={{ color: '#667085', fontWeight: 500, mb: 0.5, display: 'block' }}>
                            To
                        </Typography>
                        <TextField
                            fullWidth
                            value={supplier?.Email || ''}
                            disabled
                            size="small"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    backgroundColor: '#fafbfc',
                                    '& fieldset': { borderColor: '#e5e7eb' },
                                },
                                '& .MuiInputBase-input.Mui-disabled': {
                                    color: '#344054',
                                    WebkitTextFillColor: '#344054',
                                    fontWeight: 500,
                                },
                            }}
                            InputProps={{
                                startAdornment: (
                                    <Iconify icon="mdi:email-outline" width={18} sx={{ color: '#9aa5b4', mr: 1 }} />
                                ),
                            }}
                        />
                    </Box>

                    {/* Subject - Editable */}
                    <Box>
                        <Typography variant="caption" sx={{ color: '#667085', fontWeight: 500, mb: 0.5, display: 'block' }}>
                            Subject <span style={{ color: '#ff4d4f' }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            value={subject}
                            onChange={(e) => {
                                setSubject(e.target.value);
                                if (subjectError) setSubjectError('');
                            }}
                            placeholder="Enter email subject"
                            size="small"
                            error={!!subjectError}
                            helperText={subjectError}
                            disabled={loading}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    backgroundColor: '#fafbfc',
                                    '& fieldset': { borderColor: '#e5e7eb' },
                                    '&:hover fieldset': { borderColor: '#3366ff' },
                                },
                                '& .MuiInputBase-input': {
                                    color: '#344054',
                                    fontSize: '0.875rem',
                                },
                            }}
                        />
                    </Box>

                    {/* Body - Editable */}
                    <Box>
                        <Typography variant="caption" sx={{ color: '#667085', fontWeight: 500, mb: 0.5, display: 'block' }}>
                            Message Preview Editor <span style={{ color: '#ff4d4f' }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            value={body}
                            onChange={(e) => {
                                setBody(e.target.value);
                                if (bodyError) setBodyError('');
                            }}
                            placeholder="Enter your message here..."
                            multiline
                            rows={6}
                            error={!!bodyError}
                            helperText={bodyError}
                            disabled={loading}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    backgroundColor: '#fafbfc',
                                    '& fieldset': { borderColor: '#e5e7eb' },
                                    '&:hover fieldset': { borderColor: '#3366ff' },
                                },
                                '& .MuiInputBase-input': {
                                    color: '#555',
                                    fontSize: '0.875rem',
                                    lineHeight: 1.6,
                                },
                            }}
                        />
                    </Box>

                    {/* Info note */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1,
                            p: 1.5,
                            backgroundColor: '#f0f4ff',
                            borderRadius: 2,
                            border: '1px solid #dce4ff',
                        }}
                    >
                        <Iconify icon="mdi:information-outline" width={16} sx={{ color: '#3366ff', mt: 0.2, flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ color: '#3366ff', lineHeight: 1.5 }}>
                            Your message content will be automatically formatted inside a premium structured DPP corporate card containing a direct secure action verification login button.
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    disabled={loading}
                    sx={{
                        borderRadius: '10px',
                        borderColor: '#d0d5dd',
                        color: '#344054',
                        fontWeight: 500,
                        px: 3,
                        '&:hover': { borderColor: '#667085', backgroundColor: '#f9fafb' },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSend}
                    variant="contained"
                    disabled={loading}
                    startIcon={
                        loading
                            ? <CircularProgress size={16} sx={{ color: 'white' }} />
                            : <Iconify icon="mdi:send" width={18} />
                    }
                    sx={{
                        borderRadius: '10px',
                        backgroundColor: '#3366ff',
                        fontWeight: 500,
                        px: 3,
                        boxShadow: '0 2px 8px rgba(51,102,255,0.3)',
                        '&:hover': { backgroundColor: '#2255ee' },
                    }}
                >
                    {loading ? 'Sending...' : 'Send Invite'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

SendInviteDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    supplier: PropTypes.shape({
        SupplierName: PropTypes.string,
        InvitationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        VendorID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        Email: PropTypes.string,
    }).isRequired,
};

export default SendInviteDialog;