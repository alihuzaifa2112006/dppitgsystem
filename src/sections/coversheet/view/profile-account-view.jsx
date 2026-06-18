import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import AccountGeneralCoversheet from '../account-general-coversheet';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Get } from 'src/api/apibasemethods';
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export default function AccountCoversheetView({ urlData }) {
  const settings = useSettingsContext();

  const [isLoading, setLoading] = useState(true);
  const [currentData, setCurrentData] = useState();
  const [currentScores, setCurrentScores] = useState({});

  useEffect(() => {
    const fetch = async () => {
      const res = await Get(`getcustomerbyID/${urlData?.coversheetID}`);
      if (res.status === 200) {
        const data = {
          ...res.data?.Data,
          BusinessDetails:
            res.data?.Data.BusinessDetails !== null ? res.data?.Data.BusinessDetails : [],
          BusinessNo: res.data?.Data.BusinessNo !== null ? res.data?.Data.BusinessNo : [],
          ContactDetails: res.data?.Data.ContactDetails !== null ? res.data?.Data.ContactDetails : [],
          Agent_Dtl: res.data?.Data.Agent_Dtl !== null ? res.data?.Data.Agent_Dtl : [],
          Account_Info: res.data?.Data.Account_Info !== null ? res.data?.Data.Account_Info : [],
          End_Customer_Dtl: res.data?.Data.End_Customer_Dtl !== null ? res.data?.Data.End_Customer_Dtl.map(x=>({
            ...x,
            End_Cust_ID : x.Cust_EndCust_ID
          })) : [],
        };
        setCurrentData(data);
      }
      const result = await Get(`getCoverSheetResultByCustomerId/${urlData?.coversheetID}`);
      if (result.status === 200) {
        setCurrentScores(result.data[result.data.length - 1]);
      }
      setLoading(false);
    };
    fetch();
  }, [urlData?.coversheetID]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Coversheet"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Coversheet', href: paths.dashboard.customer.coversheet.root },
          { name: 'View' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {isLoading ? (
        <LoadingScreen
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh',
          }}
        />
      ) : (
        <AccountGeneralCoversheet currentData={currentData} currentScores={currentScores} />
      )}
    </Container>
  );
}

AccountCoversheetView.propTypes = {
  urlData: PropTypes.any,
};
