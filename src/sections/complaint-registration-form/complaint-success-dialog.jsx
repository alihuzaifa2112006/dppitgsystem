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
import { useSnackbar } from 'notistack';
import { Typography } from '@mui/material';

export default function ComplaintSuccessDialog({ openSuccess, closeSuccess, TrackingID }) {
    const { enqueueSnackbar } = useSnackbar();
    const [trackingID, setTrackingID] = useState(TrackingID);

    useEffect(() => {
        setTrackingID(TrackingID);
    }, [TrackingID]);

    // Function to copy the booking TrackingID to the clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(trackingID);
        enqueueSnackbar('Complaint Number Copied', { variant: 'success' });
    };

    const handleClickOutside = (event) => {
        event.stopPropagation(); 
    };

    return (
        <Dialog open={openSuccess} onClose={closeSuccess} fullWidth maxWidth='sm' onBackdropClick={() => handleClickOutside()}>
            <DialogTitle sx={{textAlign: 'center', fontSize: '22px !important'}}>Complaint Registered!</DialogTitle>
            <DialogContent>
                <Grid container>
                    <Grid item xs={12}>
                        <Box
                            display="grid"
                            gridTemplateColumns="1fr"
                            rowGap={3}
                            padding={3}
                            justifyContent='center'
                            alignItems='center'
                        >
                            <img src='/assets/images/Correct-icon.png' alt='correct' style={{ display: 'block', margin: 'auto', width: '30%' }}/>
                            <Typography sx={{textAlign: 'center', mt: 2, fontSize:'18px'}}><b>Complaint Number:</b> {TrackingID}</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeSuccess} variant="outlined" color="inherit">
                    Close
                </Button>
                <LoadingButton onClick={copyToClipboard} variant="contained">
                    Copy
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}

ComplaintSuccessDialog.propTypes = {
    openSuccess: PropTypes.bool.isRequired,
    closeSuccess: PropTypes.func.isRequired,
    TrackingID: PropTypes.string.isRequired,
};
