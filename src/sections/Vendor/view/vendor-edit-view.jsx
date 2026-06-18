import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import ProductEditForm from '../vendor-edit';
import { useEffect, useState } from 'react';
import { Get } from 'src/api/apibasemethods';

// ----------------------------------------------------------------------

export default function VendorEditView({ urlData }) {
  const [currentProduct, setCurrentProduct] = useState(null);
  const settings = useSettingsContext();
console.log('urlData', urlData);
  useEffect(() => {
    const fetch = async () => {
      const res = await Get(`getvendorbyid/${urlData?.vendorID}`);
      if (res.status === 200) {
        setCurrentProduct(res?.data?.Data);
      }
    };
    fetch();
  }, [urlData.vendorID]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading=" Vendor "
        links={[
          { name: 'Home', href: paths.dashboard.root },
           { name: 'Vendor ', href: paths.dashboard.admin.vendor.root },
          { name: 'Edit' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {currentProduct && <ProductEditForm currentProduct={currentProduct} />}
    </Container>
  );
}

VendorEditView.propTypes = {
  urlData: PropTypes.any,
};
