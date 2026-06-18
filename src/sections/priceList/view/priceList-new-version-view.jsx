import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useCallback, useEffect, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import { LoadingScreen } from 'src/components/loading-screen';
import PriceListEditVersionForm from '../priceList-new-version';

// ----------------------------------------------------------------------

export default function PriceListVersionView({ urlData }) {
  const [currentPriceList, setCurrentPriceList] = useState(null);
  const [isLoading, setLoading] = useState(true);

  const settings = useSettingsContext();

  const fetch = useCallback(async () => {
    const res = await Get(`GetPriceListById/${urlData?.pricelistID}`);
    const resData = {
      ...res.data,
      Master: {
        ...res.data.Master,
        PriceListDescription: res.data.Master.Description,
        Valid_From: new Date(res.data.Master.Valid_From),
        Valid_Until: new Date(res.data.Master.Valid_Until),
      },
    };
    setCurrentPriceList(resData);
    setLoading(false);
  }, [urlData]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create New Version of Pricelist"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Pricelist',
            href: paths.dashboard.transaction.priceList.root,
          },
          { name: 'New Version' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <PriceListEditVersionForm currentPriceList={currentPriceList} fetch={fetch} />
      )}
    </Container>
  );
}

PriceListVersionView.propTypes = {
  urlData: PropTypes.any,
};
