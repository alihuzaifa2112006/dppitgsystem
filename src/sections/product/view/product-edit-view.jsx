import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import ProductEditForm from '../product-edit';
import { useEffect, useState } from 'react';
import { Get } from 'src/api/apibasemethods';

// ----------------------------------------------------------------------

export default function ProductEditView({ urlData }) {
  const [currentProduct, setCurrentProduct] = useState(null);
  const settings = useSettingsContext();

  useEffect(() => {
    const fetch = async () => {
      const res = await Get(`APIViewYarnComposePrdtByID?ProductID=${urlData?.productID}`);
      if (res.status === 200) {
        setCurrentProduct(res?.data?.Data[0]);
      }
    };
    fetch();
  }, [urlData]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Product Description"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Product Description', href: paths.dashboard.productManagement.product.root },
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

ProductEditView.propTypes = {
  urlData: PropTypes.any,
};
