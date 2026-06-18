import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import ProductionMiddlewareApprovalForm from '../ProductionMiddleware-approval';
import { useEffect, useState } from 'react';
import { Get } from 'src/api/apibasemethods';

// ----------------------------------------------------------------------

export default function ProductionMiddlewareApprovalView({ urlData }) {
  const settings = useSettingsContext();

  const [currentData, setCurrentData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const response = await Get(`GetProductionMiddlewareById/${urlData?.ProductionMiddlewareID}`);
      const formatedData = {
        ...response.data,
        ProductionMiddlewareDate: new Date(response.data.ProductionMiddlewareDate),
        EndDate: new Date(response.data.EndDate),

        OppProduct: response.data.OppProduct.map((item) => ({
          ...item,
          Product: {
            ProductID: item.ProductID,
            Product_Name: item?.Product_Name,
          },
          Yarn_Type_ID: {
            Yarn_Type_ID: item?.Yarn_Type_ID,
            Yarn_Type_Name: item?.Yarn_Type_Name,
          },
          Yarn_Count_ID: {
            Yarn_Count_ID: item?.Yarn_Count_ID,
            Yarn_Count_Name: item?.Yarn_Count_Name,
          },
          Color: {
            ColorID: item?.ColorID,
            ColorName: item?.ColorName,
          },
          Composition_ID: {
            Composition_ID: item?.Composition_ID,
            Composition_Name: item?.Composition_Name,
          },
          UOM: {
            UOMID: item?.UOMID,
            UOMName: item?.UOMName,
          },
        })),
      };
      setCurrentData(formatedData);
    };

    if (urlData) {
      fetch();
    }
  }, [urlData]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Approval of Production Middleware"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Item Setup',
            href: paths.dashboard.Production.Planning.ProductionMiddleware.root,
          },
          { name: 'Approval' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {currentData && <ProductionMiddlewareApprovalForm currentData={currentData} />}
    </Container>
  );
}

ProductionMiddlewareApprovalView.propTypes = {
  urlData: PropTypes.any,
};
