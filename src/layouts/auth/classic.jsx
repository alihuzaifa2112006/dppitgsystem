// layout/auth

import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function AuthClassicLayout({ children, image, title }) {
  return (
    <Stack
      component="main"
      sx={{
        height: '100vh',
        minHeight: '100vh',
        width: '100vw',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: (theme) => `linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.65)), url(${image || '/assets/images/back.png'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        px: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 2.5,
          border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: (theme) => theme.customShadows.z24,
          p: { xs: 3, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          zIndex: 2,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
        }}
      >
        {children}
      </Box>
    </Stack>
  );
}

AuthClassicLayout.propTypes = {
  children: PropTypes.node,
  image: PropTypes.string,
  title: PropTypes.string,
};
