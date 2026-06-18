import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import PriceListEditForm from '../priceList-edit';
import { useEffect, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export default function PriceListEditView({ urlData }) {
  const [currentPriceList, setCurrentPriceList] = useState(null);
  const [isLoading, setLoading] = useState(true);

  const settings = useSettingsContext();

  useEffect(() => {
    const fetch = async () => {
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
    };
    fetch();
  }, [urlData]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Pricelist"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Pricelist',
            href: paths.dashboard.transaction.priceList.root,
          },
          { name: 'Edit Pricelist' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {isLoading ? <LoadingScreen /> : <PriceListEditForm currentPriceList={currentPriceList} />}
    </Container>
  );
}

PriceListEditView.propTypes = {
  urlData: PropTypes.any,
};
