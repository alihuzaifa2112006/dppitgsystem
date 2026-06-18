import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// import TransferVoucherEditForm from '../TransferVoucher-edit';
import TransferVoucherEditForm from '../TransferVoucher-edit';
import { useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import { LoadingScreen } from 'src/components/loading-screen';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export default function TransferVoucherEditView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const { enqueueSnackbar } = useSnackbar();

  const [currentData, setCurrentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const transferId = urlData?.TransferMstID || urlData?.TransferID;

        if (!transferId) {
          setIsLoading(false);
          return;
        }

        const response = await Get(
          `ItemTransfer/GetByID?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&TransferID=${transferId}`
        );

        // Handle response - check if data is wrapped in Data array or direct object
        const data = response.data?.Data?.[0] || response.data?.Data || response.data;

        if (data) {
          setCurrentData(data);
        } else {
          console.error('No data returned from API:', response);
        }
      } catch (error) {
        console.error('Error fetching Transfer Voucher:', error);
        enqueueSnackbar('Failed to load transfer voucher data', { variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID) {
      fetch();
    } else {
      setIsLoading(false);
    }
  }, [urlData?.TransferMstID, urlData?.TransferID, userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit   Transfer Voucher"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Transfer Voucher',
            href: paths.dashboard.Production.TransferVoucher.root,
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
        currentData && <TransferVoucherEditForm currentData={currentData} />
      )}
    </Container>
  );
}

TransferVoucherEditView.propTypes = {
  urlData: PropTypes.any,
};
