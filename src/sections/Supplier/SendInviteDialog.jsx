import { useState } from 'react';
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

    const subject = "Invitation to onboard with DPP";
    const body = `Hello ${supplier?.SupplierName || ''},\n\nPlease complete your registration by clicking the button below.\n\nBest regards,\nDPP Team`;

    const handleSend = async () => {
        if (!supplier?.InvitationId) return;

        try {
            setLoading(true);
            const payload = {
                invitationId: supplier.InvitationId,
                subject,
                body,
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

    return (
        <Dialog
            open={open}
            onClose={onClose}
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
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                                backgroundColor: '#e8edf5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Iconify icon="mdi:email-send-outline" width={20} sx={{ color: '#3366ff' }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a2035', fontSize: '1rem' }}>
                            Send Invitation
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={onClose}
                        size="small"
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

                    {/* To */}
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

                    {/* Subject */}
                    <Box>
                        <Typography variant="caption" sx={{ color: '#667085', fontWeight: 500, mb: 0.5, display: 'block' }}>
                            Subject
                        </Typography>
                        <TextField
                            fullWidth
                            value={subject}
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
                                },
                            }}
                        />
                    </Box>

                    {/* Body */}
                    <Box>
                        <Typography variant="caption" sx={{ color: '#667085', fontWeight: 500, mb: 0.5, display: 'block' }}>
                            Message
                        </Typography>
                        <TextField
                            fullWidth
                            value={body}
                            disabled
                            multiline
                            rows={5}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                    backgroundColor: '#fafbfc',
                                    '& fieldset': { borderColor: '#e5e7eb' },
                                },
                                '& .MuiInputBase-input.Mui-disabled': {
                                    color: '#555',
                                    WebkitTextFillColor: '#555',
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

            {/* Actions */}
            <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
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