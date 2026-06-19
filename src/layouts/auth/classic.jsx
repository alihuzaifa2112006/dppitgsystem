// layout/auth

import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, keyframes } from '@mui/material/styles';

import { useResponsive } from 'src/hooks/use-responsive';

// ----------------------------------------------------------------------

const floatGlow = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1) translate(0, 0); }
  50% { opacity: 0.7; transform: scale(1.12) translate(10px, -15px); }
`;

const floatGlow2 = keyframes`
  0%, 100% { opacity: 0.35; transform: scale(1) translate(0, 0); }
  50% { opacity: 0.6; transform: scale(1.08) translate(-12px, 10px); }
`;

const shimmerText = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

// ----------------------------------------------------------------------

export default function AuthClassicLayout({ children, image, title }) {
  const mdUp = useResponsive('up', 'md');

  const renderContent = (
    <Stack
      sx={{
        width: { xs: 1, md: '40%' },
        height: '100%',
        overflowY: 'auto',
        px: { xs: 2, md: 3 },
        py: { xs: 3, md: 3 },
        backgroundColor: (theme) => theme.palette.background.paper,
        '&::-webkit-scrollbar': {
          width: '5px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
      }}
    >
      <Stack
        sx={{
          minHeight: '100%',
          justifyContent: 'flex-start',
          alignItems: 'center',
          pt: { xs: 2, md: 3 },
        }}
      >
        <Box sx={{ width: 1, maxWidth: 600 }}>
          {children}
        </Box>
      </Stack>
    </Stack>
  );

  const renderSection = (
    <Stack
      sx={{
        flexGrow: 1,
        width: '60%',
        height: '100%',
        position: 'relative',
        justifyContent: 'flex-end',
        p: { xs: 6, md: 8 },
        backgroundImage: `url(${image || '/assets/images/back.png'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
      }}
    >
      {/* Light gradient overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 50%, ${alpha(theme.palette.info.main, 0.12)} 100%)`,
          zIndex: 1,
        }}
      />

      {/* Bottom dark fade for text readability */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 40%, transparent 70%)',
          zIndex: 1,
        }}
      />

      {/* Floating glow orb 1 */}
      <Box
        sx={{
          position: 'absolute',
          width: 350,
          height: 350,
          borderRadius: '50%',
          filter: 'blur(80px)',
          background: (theme) =>
            `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.25)} 0%, transparent 70%)`,
          top: '10%',
          left: '15%',
          zIndex: 2,
          animation: `${floatGlow} 8s ease-in-out infinite`,
          pointerEvents: 'none',
        }}
      />

      {/* Floating glow orb 2 */}
      <Box
        sx={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: '50%',
          filter: 'blur(70px)',
          background: (theme) =>
            `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.2)} 0%, transparent 70%)`,
          bottom: '20%',
          right: '10%',
          zIndex: 2,
          animation: `${floatGlow2} 10s ease-in-out infinite`,
          pointerEvents: 'none',
        }}
      />

      {/* Floating glow orb 3 (subtle accent) */}
      <Box
        sx={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          filter: 'blur(60px)',
          background: (theme) =>
            `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.15)} 0%, transparent 70%)`,
          top: '40%',
          right: '30%',
          zIndex: 2,
          animation: `${floatGlow} 12s ease-in-out infinite`,
          pointerEvents: 'none',
        }}
      />

      {/* Text at bottom */}
      <Typography
        variant="h3"
        sx={{
          color: 'common.white',
          maxWidth: 600,
          fontWeight: 800,
          lineHeight: 1.2,
          zIndex: 3,
          position: 'relative',
          textShadow: '0px 2px 12px rgba(0, 0, 0, 0.4)',
        }}
      >
        {title || (
          <>
            Digital Product{' '}
            <Box
              component="span"
              sx={{
                background: (theme) =>
                  `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.info.light}, ${theme.palette.primary.light})`,
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${shimmerText} 5s linear infinite`,
              }}
            >
              Passport System
            </Box>
          </>
        )}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: 'rgba(255,255,255,0.7)',
          maxWidth: 480,
          mt: 1.5,
          zIndex: 3,
          position: 'relative',
          lineHeight: 1.6,
        }}
      >
        Traceability, sustainability and compliance — all in one configurable platform.
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
