import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { _userList } from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import UserNewEditForm from '../user-new-edit-form';
import { Get } from 'src/api/apibasemethods';
import { useEffect, useMemo, useState } from 'react';

// ----------------------------------------------------------------------

export default function UserEditView({ id }) {
  const settings = useSettingsContext();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await Get(
        `GetHrUserByID?UserId=${id}&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );
      const updatedData = res.data.Data?.map((item) => ({
        ...item,
        IsActive: item.IsActive === true ? 'active' : 'banned',
        Roles: item.Roles === null ? [] : item?.Roles,
      }));
      setCurrentUser(updatedData[0] || null);
    };
    fetchUser();
  }, [id, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Register an Employee"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Employee',
            href: paths.dashboard.user.root,
          },
          { name: currentUser?.EmployeeName },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentUser && <UserNewEditForm currentUser={currentUser} />}
    </Container>
  );
}

UserEditView.propTypes = {
  id: PropTypes.string,
};
