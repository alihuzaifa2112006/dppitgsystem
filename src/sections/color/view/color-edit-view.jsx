import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import ColorEditForm from '../color-edit';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export default function ColorEditView({ urlData }) {
  const settings = useSettingsContext();
  const [currentData, setCurrentData] = useState(null);
  const [currentDetails, setCurrentDetails] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const FetchData = useCallback(async () => {
    const response = await Get(`color/${urlData.colorID}`);
    setCurrentData(response.data?.Data);
    setCurrentDetails(response.data?.Details || []);
  }, [urlData.colorID]);

  useEffect(() => {
    const fetch = async () => {
      await FetchData();
      setLoading(false);
    };
    fetch();
  }, [FetchData]);

  const renderLoading = (
    <LoadingScreen
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
      }}
    />
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Color"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'CYCLO Color & Code',
            href: paths.dashboard.productManagement.colorDatabase.root,
          },
          { name: 'Edit' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {!currentData ? (
        renderLoading
      ) : (
        <ColorEditForm currentData={currentData} currentDetails={currentDetails} />
      )}
    </Container>
  );
}

ColorEditView.propTypes = {
  urlData: PropTypes.any,
};
