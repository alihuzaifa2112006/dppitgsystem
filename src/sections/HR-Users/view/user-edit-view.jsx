import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { _userList } from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import UserEditForm from '../User-Edit';
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
        `HRModule/GetEmployeeProfileByID?HRID=${id}`
      );
      const data = res.data.Data;
      if (data) {
        const updatedUser = {
          ...data,
          IsActive: data.IsActive === true ? 'active' : 'banned',
          Roles: data.Roles || [],
        };
        setCurrentUser(updatedUser);
      }
    };
    fetchUser();
  }, [id]);

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
            href: paths.dashboard.HR_Module.HR_Users.root,
          },
          { name: currentUser?.EmployeeName },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {currentUser && <UserEditForm currentUser={currentUser} />}
    </Container>
  );
}

UserEditView.propTypes = {
  id: PropTypes.string,
};
