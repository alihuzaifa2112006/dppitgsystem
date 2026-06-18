import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import { useNavigate } from 'react-router';
import Stack from '@mui/material/Stack';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';

import { paths } from 'src/routes/paths';
import { fDate } from 'src/utils/format-time';
import { Typography } from '@mui/material';


// ----------------------------------------------------------------------

export default function NotificationItem({ notification, onClick }) {

  const renderAvatar = (
    <ListItemAvatar>
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: 'background.neutral',
        }}
      >
        <Box
          component="img"
          src='/assets/icons/notification/ic_pending.svg'
          sx={{ width: 24, height: 24 }}
        />
      </Stack>
    </ListItemAvatar>
  );

  const renderText = (
    <ListItemText
      disableTypography
      primary={
        <Typography variant="subtitle1" sx={{ fontWeight: '400' }}>
          PI# {notification?.PINo}
        </Typography>
      }
      secondary={
        <Stack
          direction="row"
          alignItems="center"
          sx={{ typography: 'caption', color: 'text.disabled' }}
          divider={
            <Box
              sx={{
                width: 2,
                height: 2,
                bgcolor: 'currentColor',
                mx: 0.5,
                borderRadius: '50%',
              }}
            />
          }
        >
          PI Date: {fDate(notification?.PIDate || '2025-07-11T00:00:00')}
          Awaiting Approval
        </Stack>
      }
    />
  );

  return (
    <ListItemButton
      disableRipple
      sx={{
        p: 2.5,
        alignItems: 'flex-start',
        borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
      }}
      onClick={onClick}
    >

      {renderAvatar}

      <Stack sx={{ flexGrow: 1 }}>
        {renderText}
      </Stack>
    </ListItemButton>
  );
}

NotificationItem.propTypes = {
  notification: PropTypes.object,
  onClick: PropTypes.func,
};

// ----------------------------------------------------------------------

function reader(data) {
  return (
    <Box
      dangerouslySetInnerHTML={{ __html: data }}
      sx={{
        mb: 0.5,
        '& p': { typography: 'body2', m: 0 },
        '& a': { color: 'inherit', textDecoration: 'none' },
        '& strong': { typography: 'subtitle2' },
      }}
    />
  );
}
