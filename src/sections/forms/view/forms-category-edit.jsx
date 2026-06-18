import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';


import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Get } from 'src/api/apibasemethods';
import { LoadingScreen } from 'src/components/loading-screen';

import DynamicFormRenderer from '../GetForm';

// ----------------------------------------------------------------------

export default function AccountView({ urlData }) {
  console.log(urlData, "url")
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [isLoading, setLoading] = useState(true);
  const [currentData, setCurrentData] = useState();

  useEffect(() => {
    const fetch = async () => {
      const res = await Get(`GetByFormDetailsID/${urlData?.FormID}?branchID=${userData?.userDetails?.branchID}&orgID=${userData?.userDetails?.orgId}`);
      if (res.status === 200) {

        setCurrentData(res?.data.Data);
      }
      setLoading(false);
    };
    fetch();
  }, [urlData?.FormID, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <>
        {isLoading ? (
          <LoadingScreen
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '70vh',
            }}
          />
        ) : (
          <>
            <CustomBreadcrumbs
              heading={`Create ${currentData?.FormName}`}
              links={[
                { name: 'Home', href: paths.dashboard.root },
                { name: 'Form', href: paths.dashboard.admin.forms.root },
                { name: 'Create' },
              ]}
              sx={{
                mb: { xs: 3, md: 5 },
              }}
            />


            <DynamicFormRenderer currentData={currentData} />
          </>
        )}
      </>
    </Container>
  );
}

AccountView.propTypes = {
  urlData: PropTypes.any,
};
