import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { Get } from 'src/api/apibasemethods';
import { LoadingScreen } from 'src/components/loading-screen';
import { useSnackbar } from 'src/components/snackbar';
import CardReportEditForm from '../CardReport-edit-form';



// ----------------------------------------------------------------------

export default function CardReportEditView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const { enqueueSnackbar } = useSnackbar();

  const [currentData, setCurrentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  const GetReportData = useCallback(async () => {
    try {
      setIsLoading(true);
      const reportId = urlData?.ReportID || urlData?.reportID || urlData?.reportId;

      if (!reportId) {
        console.error('ReportID is missing from urlData:', urlData);
        setIsLoading(false);
        enqueueSnackbar('Report ID is missing', { variant: 'error' });
        return;
      }

      const response = await Get(
        `GetProductionCardingById?ReportID=${reportId}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      // Handle response - API returns data directly or nested
      const data = response?.data || response;
      console.log('Fetched Card Production Report Data:', data);

      if (data) {
        setCurrentData(data);
      } else {
        console.error('No data returned from API:', response);
        enqueueSnackbar('No data found for this report', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching Card Production Report:', error);
      enqueueSnackbar('Failed to load card production report data', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [urlData, userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]);

  useEffect(() => {
    const reportId = urlData?.ReportID || urlData?.reportID || urlData?.reportId;

    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID && reportId) {
      GetReportData();
    } else {
      setIsLoading(false);
    }
  }, [GetReportData, userData?.userDetails?.orgId, userData?.userDetails?.branchID, urlData?.ReportID, urlData?.reportID, urlData?.reportId]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Card Production Report"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Card Production Report',
            href: paths.dashboard.Production.CardReport.root,
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
        currentData && <CardReportEditForm currentData={currentData} />
      )}
    </Container>
  );
}

CardReportEditView.propTypes = {
  urlData: PropTypes.any,
};
