import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import OpportunityApprovalForm from '../opportunity-approval';
import { useEffect, useState } from 'react';
import { Get } from 'src/api/apibasemethods';

// ----------------------------------------------------------------------

export default function OpportunityApprovalView({ urlData }) {
  const settings = useSettingsContext();

  const [currentData, setCurrentData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const response = await Get(`GetOpportunityById/${urlData?.opportunityID}`);
      const formatedData = {
        ...response.data,
        OpportunityDate: new Date(response.data.OpportunityDate),
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
          EstimatedDeliveryDate: new Date(item?.EstimatedDeliveryDate) || null,
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
        heading="Approval of Opportunity"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Opportunity',
            href: paths.dashboard.transaction.opportunity.root,
          },
          { name: 'Approval' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {currentData && <OpportunityApprovalForm currentData={currentData} />}
    </Container>
  );
}

OpportunityApprovalView.propTypes = {
  urlData: PropTypes.any,
};
