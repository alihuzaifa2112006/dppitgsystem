import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { bgGradient } from 'src/theme/css';

// ----------------------------------------------------------------------

export default function AppWelcome({ title, description, action, img, ...other }) {
  const theme = useTheme();

  return (
    <Stack
      flexDirection={{ xs: 'column', md: 'row' }}
      sx={{
        // ...bgGradient({
        //   direction: '135deg',
        //   startColor: alpha(theme.palette.primary.light, 0.2),
        //   endColor: alpha(theme.palette.primary.main, 0.2),
        // }),
        height: { md: 1 },
        borderRadius: 2,
        position: 'relative',
        color: '#fff',
        // backgroundColor: 'common.white',
        backgroundImage: {
          xs: "url('/assets/images/dashboard-1024x683.jpg')",
          sm: "url('/assets/images/dashboard-1024x683.jpg')",
          md: "url('/assets/images/dashboard-1024x683.jpg')",
          lg: "url('/assets/images/dashboard.jpg')",
        },
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      {...other}
    >
      <Stack
        flexGrow={1}
        justifyContent="center"
        alignItems={{ xs: 'center', md: 'flex-start' }}
        sx={{
          p: {
            xs: theme.spacing(5, 3, 0, 3),
            md: theme.spacing(5),
          },
          textAlign: { xs: 'center', md: 'left' },
          background: {
            xs: 'rgba(0, 0, 0, 0.4)',
            md: `linear-gradient(to right, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.1))`,
          },
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, whiteSpace: 'pre-line', pt: { md: 3 } }}>
          {title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            opacity: 0.9,
            maxWidth: 360,
            mb: { xs: 3, xl: 5 },
          }}
        >
          {description}
        </Typography>

        {action && action}
      </Stack>

      {img && (
        <Stack
          component="span"
          justifyContent="center"
          sx={{
            p: { xs: 5, md: 3 },
            maxWidth: 360,
            mx: 'auto',
          }}
        >
          {img}
        </Stack>
      )}
    </Stack>
  );
}

AppWelcome.propTypes = {
  img: PropTypes.node,
  action: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
};
