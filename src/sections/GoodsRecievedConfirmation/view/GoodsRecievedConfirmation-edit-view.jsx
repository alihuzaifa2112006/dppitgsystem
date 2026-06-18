import PropTypes from 'prop-types';
import { useEffect, useState, useMemo } from 'react';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';
import { Get } from 'src/api/apibasemethods';

import GoodsRecievedConfirmationEditForm from '../GoodsRecievedConfirmation-edit';

// ----------------------------------------------------------------------

export default function GoodsRecievedConfirmationEditView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {

      try {
        setLoading(true);
        const id = urlData?.GRNID;

        if (!id) {
          console.error('No ID provided in URL');
          return;
        }
        const response = await Get(
          `InvReceiveConfirmationandReturn/GetById?id=${id}&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
        );
        if (response.data?.Success && response.data?.Data) {
          setCurrentData(response.data.Data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (urlData?.GRNID && userData?.userDetails?.orgId && userData?.userDetails?.branchID) {
      fetchData();
    }
  }, [urlData?.GRNID, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Goods Received Confirmation"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Goods Received Confirmation',
            href: paths.dashboard.Production.GoodsRecievedConfirmation.root,
          },
          { name: 'Edit' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {loading ? (
        <LoadingScreen
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh',
          }}
        />
      ) : (
        <GoodsRecievedConfirmationEditForm currentData={currentData} />
      )}
    </Container>
  );
}

GoodsRecievedConfirmationEditView.propTypes = {
  urlData: PropTypes.object,
};
