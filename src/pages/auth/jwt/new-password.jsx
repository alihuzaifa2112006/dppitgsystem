import { Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router';
import { useParams } from 'src/routes/hooks';

import JWTNewPasswordView from 'src/sections/auth/jwt/jwt-new-password-view';
import { decryptLink } from 'src/utils/LinkEncryption';

// ----------------------------------------------------------------------

export default function LoginPage() {
  const params = useParams();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const location = useLocation();

  const urlParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const URLOTP = urlParams.get('O12P');
  const EXPDate = urlParams.get('Xkp');

  // Initialize state for decrypted values
  const [decOTP, setDecOTP] = useState(null);
  const [decEXPDate, setDecEXPDate] = useState(null);
  const [otp, setOtp] = useState('');
  const [isOtpValid, setIsOtpValid] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(true); // Initially open the dialog

  useEffect(() => {
    if (URLOTP && EXPDate) {
      try {
        const decryptedOTP = decryptLink(URLOTP);
        const decryptedEXPDate = decryptLink(EXPDate);
        console.log('decryptedExpDate', decryptedEXPDate);

        setDecOTP(decryptedOTP);
        setDecEXPDate(decryptedEXPDate);
      } catch (error) {
        console.error('Decryption Error');
      }
    } else {
      console.error('Something went wrong');
    }
  }, [URLOTP, EXPDate]);

  const handleOtpChange = (value) => {
    setOtp(value);
  };
  const handleVerifyOtp = () => {
    if (otp === decOTP) {
      const currentDate = new Date();
      const expirationDate = new Date(decEXPDate);

      if (currentDate <= expirationDate) {
        setIsOtpValid(true);
        setDialogOpen(false);
      } else {
        enqueueSnackbar('The OTP has expired.', { variant: 'error' });
      }
    } else {
      enqueueSnackbar('Invalid OTP. Please try again.', { variant: 'error' });
    }
  };

  return (
    <>
      <Helmet>
        <title> Jwt: New Password</title>
      </Helmet>
      <Dialog open={dialogOpen} disableBackdropClick disableEscapeKeyDown>
        <DialogContent>
          <Stack spacing={2} mt={3}>
            <Typography variant="h6">Enter OTP</Typography>

            <MuiOtpInput
              value={otp}
              length={6}
              onChange={handleOtpChange}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleVerifyOtp();
                }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVerifyOtp} variant="contained" color="primary">
            Verify
          </Button>
        </DialogActions>
      </Dialog>
      {isOtpValid && <JWTNewPasswordView urlData={params} />}
    </>
  );
}
