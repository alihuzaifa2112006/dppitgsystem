import { useState, useEffect } from 'react';
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
    const [subjectError, setSubjectError] = useState('');
    const [bodyError, setBodyError] = useState('');

    // Initialize subject and body when dialog opens or supplier changes
    useEffect(() => {
        if (open && supplier) {
            setSubject(`Invitation to onboard with DPP`);
            setBody(`Hello ${supplier?.SupplierName || ''},\n\nPlease complete your registration by clicking the button below.\n\nBest regards,\nDPP Team`);
            setSubjectError('');
            setBodyError('');
        }
    }, [open, supplier]);

    const validateForm = () => {
        let isValid = true;

        if (!subject.trim()) {
            setSubjectError('Subject is required');
            isValid = false;
        } else {
            setSubjectError('');
        }

        if (!body.trim()) {
            setBodyError('Message is required');
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
            const payload = {
                invitationId: supplier.InvitationId,
                subject: subject.trim(),
                body: body.trim(),
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
                            Message <span style={{ color: '#ff4d4f' }}>*</span>
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
                            rows={5}
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
                            An invitation link will be included in the email, allowing the supplier to complete their onboarding registration.
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
        InvitationId: PropTypes.string,
        Email: PropTypes.string,
    }).isRequired,
};

export default SendInviteDialog;