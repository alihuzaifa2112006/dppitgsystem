import { useState, useRef, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
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

const OTP_LENGTH = 6;

// ----------------------------------------------------------------------

export default function JWTVerifyView() {
  const router = useRouter();
  const { login } = useAuthContext();

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = useCallback(
    (index, value) => {
      // Only allow digits
      if (value && !/^\d$/.test(value)) return;

      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setErrorMsg('');

      // Auto-focus next input
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
          // Move to previous input on backspace if current is empty
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

    // Focus the next empty input or the last one
    const focusIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  }, []);

  const handleVerify = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== OTP_LENGTH) {
      setErrorMsg('Please enter the complete OTP code');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      // Get token from login response stored in localStorage
      // Login response structure: { Success, Data: { token, company, ... } }
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
        // Verify response: { Success, Data: { token, tokenType, expiresInMinutes } }
        const verifyData = response?.data;
        const newToken = verifyData?.Data?.token || token;

        // Save the new verified token/data to localStorage
        localStorage.setItem('UserData', JSON.stringify(verifyData));

        // Call auth context login with the token to authenticate the user
        if (login) {
          await login({ token: newToken, accessToken: newToken, ...verifyData?.Data });
        }

        router.push(PATH_AFTER_LOGIN);
      } else {
        setErrorMsg('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);

      if (error?.response?.data?.Message) {
        setErrorMsg(error.response.data.Message);
      } else if (error?.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else if (error?.response?.status === 400 || error?.response?.status === 401) {
        setErrorMsg('Invalid or expired OTP. Please try again.');
      } else {
        setErrorMsg(error?.message || 'Verification failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* Error Alert */}
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
        disabled={otp.join('').length !== OTP_LENGTH}
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
    </Stack>
  );
}
