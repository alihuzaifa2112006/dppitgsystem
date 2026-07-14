import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { alpha } from '@mui/material/styles';

import { useSettingsContext } from 'src/components/settings';
import { useRouter } from 'src/routes/hooks';
import { useAuthContext } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
import { Post } from 'src/api/apibasemethods';

// ----------------------------------------------------------------------

export default function SettingsPage() {
  const settings = useSettingsContext();
  const router = useRouter();
  const { logout } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const [currentTab, setCurrentTab] = useState('username');
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const [username, setUsername] = useState('');

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('UserData');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        // Try getting Username from company object, fallback to generic Username
        const currentUsername = parsed?.Data?.company?.Username || parsed?.Data?.Username || '';
        setUsername(currentUsername);
      }
    } catch (error) {
      console.error('Error parsing UserData for username:', error);
    }
  }, []);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleUpdateUsername = async () => {
    if (!username.trim()) {
      enqueueSnackbar('Username cannot be empty', { variant: 'warning' });
      return;
    }

    try {
      const response = await Post('Account/ChangeUsername', {
        NewUsername: username.trim(),
      });

      if (response?.status === 200 || response?.status === 201) {
        enqueueSnackbar('Username updated successfully! Please login again with your new username.', { variant: 'success' });
        
        // Auto Logout to get a fresh token with the new username
        await logout();
        localStorage.removeItem('UserData');
        localStorage.removeItem('loginTime');
        router.replace('/auth/jwt/login');
      } else {
        enqueueSnackbar(response?.data?.Message || 'Failed to update username', { variant: 'error' });
      }
    } catch (error) {
      console.error('Update username error:', error);
      enqueueSnackbar(error?.response?.data?.Message || 'Failed to update username', { variant: 'error' });
    }
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword.trim() || !newPassword.trim()) {
      enqueueSnackbar('Both old and new passwords are required', { variant: 'warning' });
      return;
    }

    try {
      const response = await Post('Account/ChangePassword', {
        OldPassword: oldPassword,
        NewPassword: newPassword,
      });

      if (response?.status === 200 || response?.status === 201) {
        enqueueSnackbar('Password updated successfully!', { variant: 'success' });
        // Clear input fields
        setOldPassword('');
        setNewPassword('');
      } else {
        enqueueSnackbar(response?.data?.Message || 'Failed to update password', { variant: 'error' });
      }
    } catch (error) {
      console.error('Update password error:', error);
      enqueueSnackbar(error?.response?.data?.Message || 'Failed to update password', { variant: 'error' });
    }
  };

  const handleThemeChange = (event) => {
    const newThemeMode = event.target.checked ? 'dark' : 'light';
    settings.onUpdate('themeMode', newThemeMode);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      localStorage.removeItem('UserData');
      localStorage.removeItem('loginTime');
      setLogoutDialogOpen(false);
      router.replace('/auth/jwt/login');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };

  return (
    <>
      <Helmet>
        <title> Dashboard: Settings</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Settings
        </Typography>

        <Card sx={{ borderRadius: 2 }}>
          <Tabs
            value={currentTab}
            onChange={handleChangeTab}
            sx={{
              px: 3,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${theme.palette.divider}`,
            }}
          >
            <Tab icon={<Iconify icon="solar:user-bold-duotone" />} iconPosition="start" label="Username" value="username" />
            <Tab icon={<Iconify icon="solar:lock-password-bold-duotone" />} iconPosition="start" label="Password" value="password" />
            <Tab icon={<Iconify icon="solar:sun-2-bold-duotone" />} iconPosition="start" label="Theme" value="theme" />
            <Tab icon={<Iconify icon="solar:logout-3-bold-duotone" />} iconPosition="start" label="Logoff" value="logoff" />
          </Tabs>

          <Box sx={{ p: 4 }}>
            {currentTab === 'username' && (
              <Stack spacing={3} sx={{ maxWidth: 480 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    Update Username
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Iconify icon="solar:info-circle-bold" width={16} />
                    Note: You will be logged out automatically after updating your username.
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  label="New Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Button
                  variant="soft"
                  color="inherit"
                  onClick={handleUpdateUsername}
                  startIcon={<Iconify icon="solar:diskette-bold-duotone" />}
                  sx={{ alignSelf: 'flex-start', px: 3, borderRadius: 1.5, fontWeight: 600 }}
                >
                  Save Changes
                </Button>
              </Stack>
            )}

            {currentTab === 'password' && (
              <Stack spacing={3} sx={{ maxWidth: 480 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Update Password
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  label="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <TextField
                  fullWidth
                  type={showNewPassword ? 'text' : 'password'}
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                          <Iconify icon={showNewPassword ? 'solar:eye-bold-duotone' : 'solar:eye-closed-bold-duotone'} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="soft"
                  color="inherit"
                  onClick={handleUpdatePassword}
                  startIcon={<Iconify icon="solar:lock-keyhole-minimalistic-bold-duotone" />}
                  sx={{ alignSelf: 'flex-start', px: 3, borderRadius: 1.5, fontWeight: 600 }}
                >
                  Update Password
                </Button>
              </Stack>
            )}

            {currentTab === 'theme' && (
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  p: 3,
                  bgcolor: 'background.neutral',
                  borderRadius: 2,
                  maxWidth: 600,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Dark Mode
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Switch between light and dark themes for your dashboard.
                  </Typography>
                </Box>

                <Switch
                  checked={settings.themeMode === 'dark'}
                  onChange={handleThemeChange}
                  color="primary"
                  sx={{ transform: 'scale(1.3)' }}
                />
              </Stack>
            )}

            {currentTab === 'logoff' && (
              <Stack spacing={3} sx={{ maxWidth: 480 }}>
                <Typography variant="subtitle1">
                  Log out of your account
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  You will need to login again to access your dashboard.
                </Typography>
                <Button
                  variant="soft"
                  color="inherit"
                  startIcon={<Iconify icon="solar:logout-3-bold-duotone" />}
                  onClick={() => setLogoutDialogOpen(true)}
                  sx={{ alignSelf: 'flex-start', px: 4, borderRadius: 1.5, fontWeight: 600 }}
                >
                  Logout
                </Button>
              </Stack>
            )}
          </Box>
        </Card>
      </Container>

      {/* ── Logout Confirmation Dialog ── */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 0.5,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon="mdi:power" width={22} sx={{ color: 'primary.main' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Confirm Logout
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pb: 1.5 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Are you sure you want to logout? You will need to login again to access your account.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setLogoutDialogOpen(false)}
            sx={{ borderRadius: 2, flex: 1, fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogoutConfirm}
            startIcon={<Iconify icon="mdi:power" width={18} />}
            sx={{ borderRadius: 2, flex: 1, fontWeight: 600 }}
          >
            Yes, Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
