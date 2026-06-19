// layout/auth

import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useResponsive } from 'src/hooks/use-responsive';

// ----------------------------------------------------------------------

export default function AuthClassicLayout({ children, image, title }) {
  const mdUp = useResponsive('up', 'md');

  const renderContent = (
    <Stack
      sx={{
        width: { xs: 1, md: '50%' },
        height: '100%',
        overflowY: 'auto',
        px: { xs: 2, md: 8 },
        py: { xs: 5, md: 5 },
      }}
    >
      <Stack
        sx={{
          minHeight: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box sx={{ width: 1, maxWidth: 480 }}>
          {children}
        </Box>
      </Stack>
    </Stack>
  );

  const renderSection = (
    <Stack
      sx={{
        flexGrow: 1,
        width: '50%',
        height: '100%',
        position: 'relative',
        justifyContent: 'flex-end',
        p: { xs: 6, md: 8 },
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.75)), url(${image || '/assets/images/back.png'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Typography
        variant="h3"
        sx={{
          color: 'common.white',
          maxWidth: 600,
          fontWeight: 'bold',
          lineHeight: 1.3,
          zIndex: 1,
          textShadow: '0px 2px 10px rgba(0, 0, 0, 0.5)',
        }}
      >
        {title || 'Digital Passport System'}
      </Typography>
    </Stack>
  );

  return (
    <Stack
      component="main"
      direction="row"
      sx={{
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      {mdUp && renderSection}

      {renderContent}
    </Stack>
  );
}

AuthClassicLayout.propTypes = {
  children: PropTypes.node,
  image: PropTypes.string,
  title: PropTypes.string,
};
