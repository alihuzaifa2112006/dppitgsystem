import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import ExportAmendmentForm from '../elc-amendment';

// ----------------------------------------------------------------------

export default function ExportAmendmentView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [currentData, setCurrentData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const response = await Get(
        `CommercialModule/GetLCDetailsByLCID?ExportLCID=${urlData?.ExID}`
      );
     
      setCurrentData(response.data.Data);
    };

    if (urlData) {
      fetch();
    }
  }, [urlData]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Amendment"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: ' L/C Tagging',
            href: paths.dashboard.Commercial.export.ExportLC.root,
          },
          { name: 'Edit' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ExportAmendmentForm currentData={currentData} />
    </Container>
  );
}

ExportAmendmentView.propTypes = {
  urlData: PropTypes.any,
 
};
