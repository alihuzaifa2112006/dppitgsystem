import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { usePathname, useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';
import { useMockedUser } from 'src/hooks/use-mocked-user';

import { useAuthContext } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';
import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { NavSectionVertical } from 'src/components/nav-section';

import { NAV } from '../config-layout';
import NavUpgrade from '../common/nav-upgrade';
import { useNavData } from './config-navigation';
import NavToggleButton from '../common/nav-toggle-button';

// ----------------------------------------------------------------------

export default function NavVertical({ openNav, onCloseNav }) {
  const { user } = useMockedUser();
  const { logout } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const pathname = usePathname();
  const lgUp = useResponsive('up', 'lg');
  const navData = useNavData();

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box
        component="img"
        src="/logo/Logo.png"
        alt="logo"
        sx={{ mt: 3, ml: 4, mb: 3, width: '140px' }}
      />

      <NavSectionVertical
        data={navData}
        slotProps={{
          currentRole: user?.role,
        }}
      />

      <Box sx={{ flexGrow: 1 }} />

      {/* ── Logout Button at bottom of sidebar ── */}
      <Box
        onClick={() => setLogoutDialogOpen(true)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 1.5,
          cursor: 'pointer',
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
            '& .logout-icon': { transform: 'rotate(20deg)' },
            '& .logout-text': { color: 'primary.main' },
          },
        }}
      >
        <Typography
          className="logout-text"
          variant="body2"
          sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.88rem', transition: 'color 0.2s ease' }}
        >
          Logout
        </Typography>
        <Iconify
          className="logout-icon"
          icon="mdi:power"
          width={18}
          sx={{
            color: 'primary.main',
            transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </Box>
    </Scrollbar>
  );

  return (
    <>
      <Box
        sx={{
          flexShrink: { lg: 0 },
          width: { lg: NAV.W_VERTICAL },
        }}
      >
        <NavToggleButton />

        {lgUp ? (
          <Stack
            sx={{
              height: 1,
              position: 'fixed',
              width: NAV.W_VERTICAL,
              borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
            }}
          >
            {renderContent}
          </Stack>
        ) : (
          <Drawer
            open={openNav}
            onClose={onCloseNav}
            PaperProps={{
              sx: {
                width: NAV.W_VERTICAL,
              },
            }}
          >
            {renderContent}
          </Drawer>
        )}
      </Box>

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

NavVertical.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};
