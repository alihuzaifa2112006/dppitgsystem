import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useAuthContext } from 'src/auth/hooks';
import { PasswordIcon } from 'src/assets/icons';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { Post } from 'src/api/apibasemethods';
import { useMemo } from 'react';
import { APP_URL } from 'src/config-global';
import { encryptLink } from 'src/utils/LinkEncryption';
import { enqueueSnackbar } from 'notistack';

// ----------------------------------------------------------------------

export default function JWTForgotPasswordView() {
  const { forgotPassword } = useAuthContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
  });

  const defaultValues = {
    email: '',
  };

  const methods = useForm({
    resolver: yupResolver(ForgotPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const OTP = Math.floor(100000 + Math.random() * 900000);

    const expiryDate = new Date();
    // Set the expiry date to 1 month from now
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    const expiryDateISO = expiryDate.toISOString();
    const encryptedExpiryDate = encryptLink(expiryDateISO);

    const encryptedOTP = encryptLink(OTP.toString());
    // const linkToCopy = `${APP_URL}UPct1f&O12P=${encryptedOTP}&Xkp=${encryptedExpiryDate}`; // Your specific link
    const resetPasswordLink = `${APP_URL}${paths.auth.jwt.newpassword}?O12P=${encryptedOTP}&Xkp=${encryptedExpiryDate}&email=${data.email}`;
    try {
      const emailData = {
        EmailTo: data.email,
        Subject: 'Password Reset Request',
        Body: `<!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }
              .otp-code {
                  font-size: 24px;
                  font-weight: bold;
                  letter-spacing: 2px;
                  color: #5e8a36;
                  margin: 20px 0;
              }
              .details { background: #f9f9f9; padding: 15px; border-left: 4px solid #5e8a36; margin: 20px 0; }
              .footer { margin-top: 20px; font-size: 12px; color: #7f8c8d; }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #5e8a36;
                  color: white;
                  text-decoration: none;
                  border-radius: 4px;
                  margin: 10px 0;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2 class="header">Password Reset Request</h2>

              <p>Dear User,</p>

              <p>We received a request to reset your password. Please use the following OTP code to verify your identity:</p>

              <div class="otp-code">
                  ${OTP}
              </div>

              <p>This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.</p>

              <p>Alternatively, you can click the button below to reset your password directly:</p>

              <table cellspacing="0" cellpadding="0" style="margin-bottom: 10px;">
                  <tr>
                      <td align="center" width="200" height="40" bgcolor="#5e8a36" style="-webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px; color: #ffffff; display: block;">
                          <a href="${resetPasswordLink}" style="font-size: 16px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; line-height: 40px; width: 100%; display: inline-block;">Reset Password</a>
                      </td>
                  </tr>
              </table>

              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all;">${resetPasswordLink}</p>

              <div class="footer">
                  <p>For security reasons, please don't share this OTP with anyone.</p>
                  <p>Best regards,<br>DPP Team</p>
              </div>
          </div>
      </body>
      </html>`,
        EmailBy: userData?.userDetails?.userId || 99999,
        BranchID: userData?.userDetails?.branchID || 6,
        OrgID: userData?.userDetails?.orgId || 1,
      };

      // Send the email
      await Post('UserIDPwdemail/send', emailData);

      const href = `${paths.auth.jwt.verify}?${searchParams}`;
      // router.push(
      //   `${paths.auth.jwt.newpassword}?O12P=${encryptedOTP}&Xkp=${encryptedExpiryDate}&email=${data.email}`
      // );
      router.push(href);
    } catch (error) {
      if (error?.response.status === 400) {
        enqueueSnackbar('Email not found', {
          variant: 'error',
        });
      } else {
        enqueueSnackbar('Something went wrong', {
          variant: 'error',
        });
      }
    }
  });

  const renderForm = (
    <Stack spacing={3} alignItems="center">
      <RHFTextField name="email" label="Email address" />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        // component={RouterLink}
        loading={isSubmitting}
      >
        Send Request
      </LoadingButton>

      <Link
        component={RouterLink}
        href={paths.auth.jwt.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          alignItems: 'center',
          display: 'inline-flex',
        }}
      >
        <Iconify icon="eva:arrow-ios-back-fill" width={16} />
        Return to sign in
      </Link>
    </Stack>
  );

  const renderHead = (
    <>
      <PasswordIcon sx={{ height: 96 }} />

      <Stack spacing={1} sx={{ mt: 3, mb: 5 }}>
        <Typography variant="h3">Forgot your password?</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Please enter the email address associated with your account and We will email you a link
          to reset your password.
        </Typography>
      </Stack>
    </>
  );

  return (
    <>
      {renderHead}

      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>
    </>
  );
}
