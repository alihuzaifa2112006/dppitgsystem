import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

// import ProductionRequestEditForm from '../Supplier-edit';
import { useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import { LoadingScreen } from 'src/components/loading-screen';
import { useSnackbar } from 'src/components/snackbar';
import SupplierEditForm from '../Supplier-edit';



// ----------------------------------------------------------------------

export default function SupplierEditView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const { enqueueSnackbar } = useSnackbar();

  const [currentData, setCurrentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const reportId = urlData?.ReportID || urlData?.reportID || urlData?.reportId;

        if (!reportId) {
          console.error('ReportID is missing from urlData:', urlData);
          setIsLoading(false);
          return;
        }

        const response = await Get(
          `GetBlowRoomReportById?ReportID=${reportId}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
        );

        // Handle response - API returns data directly or in data property
        const data = response.data?.Data?.[0] ?? response.data?.Data ?? response.data;

        if (data) {
          setCurrentData(data);
        } else {
          console.error('No data returned from API:', response);
        }
      } catch (error) {
        console.error('Error fetching Blow Room Report:', error);
        enqueueSnackbar('Failed to load blow room report data', { variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    const reportId = urlData?.ReportID || urlData?.reportID || urlData?.reportId;

    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID && reportId) {
      fetch();
    } else {
      setIsLoading(false);
    }
  }, [urlData?.ReportID, urlData?.reportID, urlData?.reportId, urlData, userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Blow Report"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Blow Report',
            href: paths.dashboard.Onboarding.Supplier.root,
          },
          { name: 'Edit' },
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
        currentData && <SupplierEditForm currentData={currentData} />
      )}
    </Container>
  );
}

SupplierEditView.propTypes = {
  urlData: PropTypes.any,
};
