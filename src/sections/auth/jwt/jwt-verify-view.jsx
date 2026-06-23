import { useState, useRef, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Snackbar from '@mui/material/Snackbar';
import Chip from '@mui/material/Chip';
import { alpha, keyframes } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useAuthContext } from 'src/auth/hooks';
import { PATH_AFTER_LOGIN, APP_API } from 'src/config-global';

import axios from 'axios';

// ----------------------------------------------------------------------

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(99, 115, 255, 0); }
  50% { box-shadow: 0 0 0 6px rgba(99, 115, 255, 0.15); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shakeX = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
`;

const OTP_LENGTH = 6;

// ----------------------------------------------------------------------

export default function JWTVerifyView() {
  const router = useRouter();
  const { login } = useAuthContext();

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', attemptsLeft: null });

  // Wrong OTP status
  const [wrongOtpStatus, setWrongOtpStatus] = useState(null); // { attemptsLeft: number }

  const inputRefs = useRef([]);

  const handleChange = useCallback(
    (index, value) => {
      if (value && !/^\d$/.test(value)) return;

      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setErrorMsg('');

      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  const handleKeyDown = useCallback(
    (index, e) => {
      if (e.key === 'Backspace') {
        if (!otp[index] && index > 0) {
          const newOtp = [...otp];
          newOtp[index - 1] = '';
          setOtp(newOtp);
          inputRefs.current[index - 1]?.focus();
        } else {
          const newOtp = [...otp];
          newOtp[index] = '';
          setOtp(newOtp);
        }
      }
      if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pastedData) return;

    const newOtp = Array(OTP_LENGTH).fill('');
    pastedData.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    setErrorMsg('');

    const focusIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== OTP_LENGTH) {
      setErrorMsg('Please enter the complete OTP code');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const storedData = JSON.parse(localStorage.getItem('UserData') || '{}');
      const token = storedData?.Data?.token || storedData?.token || '';

      const response = await axios.post(`${APP_API}Auth/VerifyOtp`, {
        otp: otpCode,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.status === 200 || response?.status === 201) {
        const verifyData = response?.data;
        const newToken = verifyData?.Data?.token || token;

        localStorage.setItem('UserData', JSON.stringify(verifyData));

        if (login) {
          await login({ token: newToken, accessToken: newToken, ...verifyData?.Data });
        }

        router.push(PATH_AFTER_LOGIN);
      } else {
        setErrorMsg('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);

      const responseData = error?.response?.data;
      const attemptsLeft = responseData?.AttemptsLeft ?? null;
      const serverMessage = responseData?.Message || responseData?.message || null;

      // Check if it's a wrong OTP scenario (has AttemptsLeft in response)
      if (attemptsLeft !== null && attemptsLeft !== undefined) {
        // Update persistent status badge
        setWrongOtpStatus({ attemptsLeft });

        // Show snackbar with attempts info
        const snackMsg = attemptsLeft === 0
          ? 'Too many failed attempts. Please request a new OTP.'
          : `Wrong OTP — ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining`;

        setSnackbar({ open: true, message: snackMsg, attemptsLeft });

        // Shake the OTP boxes
        triggerShake();

        // Clear OTP fields and refocus first input
        setOtp(Array(OTP_LENGTH).fill(''));
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else if (error?.response?.status === 400 || error?.response?.status === 401) {
        setErrorMsg(serverMessage || 'Invalid or expired OTP. Please try again.');
        triggerShake();
      } else {
        setErrorMsg(serverMessage || error?.message || 'Verification failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Snackbar severity based on attempts left
  const snackbarSeverity =
    snackbar.attemptsLeft === 0
      ? 'error'
      : snackbar.attemptsLeft === 1
        ? 'warning'
        : 'error';

  return (
    <Stack
      spacing={3}
      sx={{
        animation: `${fadeInUp} 0.5s ease-out`,
      }}
    >
      {/* Logo */}
      <img src="/logo/Logo.png" alt="logo" style={{ width: 120, display: 'block' }} />

      {/* Header */}
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Verify OTP
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          We&apos;ve sent a verification code to your email. Please enter it below.
        </Typography>
      </Stack>

      {/* Wrong OTP status badge — only shown after at least one wrong attempt */}
      {wrongOtpStatus !== null && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Chip
            label={
              wrongOtpStatus.attemptsLeft === 0
                ? 'No attempts remaining'
                : `${wrongOtpStatus.attemptsLeft} attempt${wrongOtpStatus.attemptsLeft === 1 ? '' : 's'} left`
            }
            size="small"
            color={
              wrongOtpStatus.attemptsLeft === 0
                ? 'error'
                : wrongOtpStatus.attemptsLeft === 1
                  ? 'warning'
                  : 'default'
            }
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Wrong OTP entered
          </Typography>
        </Stack>
      )}

      {/* Error Alert (non-attempts errors) */}
      {!!errorMsg && (
        <Alert severity="error" sx={{ borderRadius: 1.5 }}>
          {errorMsg}
        </Alert>
      )}

      {/* OTP Input Boxes */}
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 1, sm: 1.5 },
          justifyContent: 'center',
          my: 2,
          animation: shake ? `${shakeX} 0.5s ease-in-out` : 'none',
        }}
      >
        {otp.map((digit, index) => (
          <Box
            key={index}
            component="input"
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            autoFocus={index === 0}
            sx={{
              width: { xs: 44, sm: 52 },
              height: { xs: 52, sm: 60 },
              borderRadius: 1.5,
              border: (theme) =>
                `2px solid ${digit ? theme.palette.primary.main : alpha(theme.palette.grey[500], 0.24)}`,
              backgroundColor: (theme) =>
                digit ? alpha(theme.palette.primary.main, 0.06) : alpha(theme.palette.grey[500], 0.04),
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              fontWeight: 700,
              textAlign: 'center',
              outline: 'none',
              color: (theme) => theme.palette.text.primary,
              caretColor: (theme) => theme.palette.primary.main,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              fontFamily: 'inherit',
              '&:focus': {
                borderColor: (theme) => theme.palette.primary.main,
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                animation: `${pulseGlow} 2s ease-in-out infinite`,
                transform: 'scale(1.05)',
              },
              '&:hover:not(:focus)': {
                borderColor: (theme) => alpha(theme.palette.grey[500], 0.5),
              },
            }}
          />
        ))}
      </Box>

      {/* Verify Button */}
      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        variant="contained"
        loading={isSubmitting}
        onClick={handleVerify}
        disabled={otp.join('').length !== OTP_LENGTH || wrongOtpStatus?.attemptsLeft === 0}
        sx={{
          mt: 1,
          fontWeight: 600,
          '&.Mui-disabled': {
            opacity: 0.6,
          },
        }}
      >
        Verify OTP
      </LoadingButton>

      {/* Hint + Try again */}
      <Stack spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          Didn&apos;t receive the code? Check your spam folder.
        </Typography>

        <Link
          component={RouterLink}
          href={paths.auth.jwt.login}
          variant="subtitle2"
          sx={{
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          ← Try login again
        </Link>
      </Stack>

      {/* Snackbar for wrong OTP with attempts left */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%', fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}