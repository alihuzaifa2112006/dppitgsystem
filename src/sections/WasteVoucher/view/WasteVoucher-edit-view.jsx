import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// import WasteVoucherEditForm from '../WasteVoucher-edit';
import WasteVoucherEditForm from '../WasteVoucher-edit';
import { useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export default function WasteVoucherEditView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [currentData, setCurrentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const response = await Get(
          `ItemVoucher/GetByID?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&VID=${urlData?.VID}`
        );
        // Handle response - check if data is wrapped in Data array or direct object
        const data = response.data?.Data?.[0] || response.data?.Data || response.data;
        setCurrentData(data);
      } catch (error) {
        console.error('Error fetching Item Voucher:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (urlData?.VID) {
      fetch();
    } else {
      setIsLoading(false);
    }
  }, [urlData?.VID, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Item Voucher"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Item Voucher',
            href: paths.dashboard.Production.WasteVoucher.root,
          },
          { name: 'edit' },
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
        currentData && <WasteVoucherEditForm currentData={currentData} />
      )}
    </Container>
  );
}

WasteVoucherEditView.propTypes = {
  urlData: PropTypes.any,
};
