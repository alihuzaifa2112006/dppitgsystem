import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { TextField } from '@mui/material';
import { useNavigate } from 'react-router';
import { useSnackbar } from 'src/components/snackbar';

export default function ComplaintPageLinkDialog({ openLink, onCloseLink, Link }) {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [bookingLink, setBookingLink] = useState(Link);

    useEffect(() => {
        setBookingLink(Link);
    }, [Link]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(bookingLink);
        enqueueSnackbar('Link copied', { variant: 'success' });
    };

    return (
        <Dialog open={openLink} onClose={onCloseLink} fullWidth maxWidth='md'>
            <DialogTitle sx={{textAlign: 'center'}}>Complaint Registration Form Link</DialogTitle>
            <DialogContent>
                <Grid container>
                    <Grid item xs={12}>
                        <Box
                            display="grid"
                            gridTemplateColumns="1fr"
                            rowGap={3}
                        >
                            <TextField disabled value={bookingLink}/>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCloseLink} variant="outlined" color="inherit">
                    Cancel
                </Button>
                <LoadingButton color='primary' onClick={copyToClipboard} variant="contained">
                    Copy
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}

ComplaintPageLinkDialog.propTypes = {
    openLink: PropTypes.bool,
    onCloseLink: PropTypes.func,
    Link: PropTypes.string,
};
