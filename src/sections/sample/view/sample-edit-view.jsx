import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import SampleEditForm from '../sample-edit';
import { useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';

// ----------------------------------------------------------------------

export default function SampleEditView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [currentData, setCurrentData] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const response = await Get(
        `getSampleRequestsanddtl?Sample_Request_ID=${urlData?.sampleID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );
      // const formatedData = {
      //   ...response.data,
      //   SampleMst: {
      //     ...response.data.SampleMst,
      //     SampleDate: new Date(response.data.SampleMst?.SampleDate),
      //     ValidFrom: new Date(response.data.SampleMst?.ValidFrom),
      //     ValidUntil: new Date(response.data.SampleMst?.ValidUntil),
      //   },

      //   Clauses: response.data.Clauses.map((clause) => ({
      //     ...clause,
      //     Clause_ID: clause.ClauseID,
      //   })),
      //   SampleDtl: response.data.SampleDtl.map((item) => ({
      //     ...item,
      //     Unit_Price: item.UnitPrice,
      //     PriceListID: {
      //       PriceListID: item.PriceList_ID,
      //       PriceListName: item.PriceListName,
      //     },
      //     Product: {
      //       Product_ID: item.Product_ID,
      //       Product_Name: item?.Product_Name,
      //       UOMNAME: item?.UOMName,
      //       CurrencyID: response?.SampleMst?.Currency_ID || 1,
      //     },
      //   })),
      // };
      setCurrentData(response.data.Data[0]);
    };

    if (urlData) {
      fetch();
    }
  }, [urlData, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Sample Request"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Sample Request',
            href: paths.dashboard.transaction.sample.root,
          },
          { name: 'edit' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {currentData && <SampleEditForm currentData={currentData} />}
    </Container>
  );
}

SampleEditView.propTypes = {
  urlData: PropTypes.any,
};
