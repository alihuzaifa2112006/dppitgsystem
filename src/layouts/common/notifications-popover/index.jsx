import { m } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { _notifications } from 'src/_mock';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { varHover } from 'src/components/animate';
import { Get } from 'src/api/apibasemethods';

import NotificationItem from './notification-item';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function NotificationsPopover() {
  const drawer = useBoolean();

  const location = useLocation();
  const navigate = useNavigate();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const smUp = useResponsive('up', 'sm');

  const [notifications, setNotifications] = useState([]);

  const handleClick = (e) => {
    navigate(paths.dashboard.transaction.pi.approver(encodeURIComponent(e)));
  };

  const totalTodos = notifications?.length;

  // useEffect(() => {
  //   const fetchNotifications = async () => {
  //     try {
  //       const response = await Get(`getPendingPIsByUser?USERID=${userData?.userDetails?.userId}`);

  //       const updatedData = response.data.Data?.map((item) => ({
  //         ...item,
  //         PINo: item?.ApplyForReapproval
  //           ? `${item?.PINo}-R`
  //           : item?.PINo,
  //       }));

  //       setNotifications(updatedData);
  //     } catch (error) {
  //       console.error('Failed to fetch to-dos:', error);
  //     }
  //   };

  //   fetchNotifications();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [location.pathname]);

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Things-To-Do
      </Typography>

      {!smUp && (
        <IconButton onClick={drawer.onFalse}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      )}
    </Stack>
  );

  const renderList = (
    <Scrollbar>
      {notifications?.length > 0 ? (
        <List disablePadding>
          {notifications.map((notification) => (
            <NotificationItem
              onClick={() => handleClick(notification?.PIID)}
              key={notification?.PIID}
              notification={notification}
            />
          ))}
        </List>
      ) : (
        <Box
          sx={{
            height: '100%',
            minHeight: 400,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            textAlign: 'center',
          }}
        >
          <Box
            component="img"
            src="/assets/icons/notification/all-done.svg"
            alt="No To-Dos"
            sx={{ width: 280, mb: 2 }}
          />
          <Typography variant="h6">You&apos;re all caught up!</Typography>
          <Typography variant="body2" color="text.secondary">
            Nothing left to do for now.
          </Typography>
        </Box>
      )}
    </Scrollbar>
  );

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        color={drawer.value ? 'primary' : 'default'}
        onClick={drawer.onTrue}
      >
        <Badge badgeContent={totalTodos} color="error">
          <Iconify icon="solar:bell-bing-bold-duotone" width={24} />
        </Badge>
      </IconButton>

      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: 1, maxWidth: 420 },
        }}
      >
        {renderHead}

        <Divider />

        {renderList}
      </Drawer>
    </>
  );
}
