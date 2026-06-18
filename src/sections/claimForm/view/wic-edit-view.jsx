import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import WICEditForm from '../wic-edit';
import { useEffect, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export default function WICEditView({ urlData }) {
  const settings = useSettingsContext();

  const [currentData, setCurrentData] = useState();
  console.log(urlData)

  useEffect(() => {
    const fetch = async () => {
      const res = await Get(`getWICByID/${urlData?.wicID}`);
      setCurrentData(res?.data);
    };
    fetch();
  }, [urlData?.wicID]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Walk-In Customer"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Walk-In Customer', href: paths.dashboard.customer.wic.root },
          { name: 'Edit' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {!currentData ? (
        <LoadingScreen
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh',
          }}
        />
      ) : (
        <WICEditForm currentData={currentData} />
      )}
    </Container>
  );
}

WICEditView.propTypes = {
  urlData: PropTypes.any,
};
