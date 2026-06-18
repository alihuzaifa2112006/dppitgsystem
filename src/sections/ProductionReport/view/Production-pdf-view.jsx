import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Typography, Box, CircularProgress } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { Get } from 'src/api/apibasemethods';
import { useParams } from 'react-router-dom';
import ProductionPDF from '../Production-PDF';

// ----------------------------------------------------------------------

export default function ProductionPDFView() {
  const settings = useSettingsContext();
  // Get user data from local storage
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const { ReportID } = useParams();

  const [currentData, setCurrentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const GetPDFData = useCallback(async () => {
    // Extract orgId and branchID from userData for the new API parameters
    const orgId = userData?.userDetails?.orgId;
    const branchID = userData?.userDetails?.branchID;

    // Check for essential IDs before fetching
    if (!ReportID || !orgId || !branchID) {
      setError('Missing Report ID, Organization ID, or Branch ID.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await Get(
        `GetSortingReportByID?ReportID=${ReportID}&Org_ID=${orgId}&Branch_ID=${branchID}`
      );

      // Handle both raw object and wrapped data (assuming successful response is in response.data or response itself)
      setCurrentData(response?.data || response);
    } catch (err) {
      console.error(err);
      setError('Failed to load report data');
      enqueueSnackbar('Failed to load report', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [ReportID, userData?.userDetails?.orgId, userData?.userDetails?.branchID]); // Dependencies updated

  useEffect(() => {
    if (ReportID) {
      GetPDFData();
    } else {
      setIsLoading(false);
      setError('No ReportID found in URL parameters.');
    }
  }, [GetPDFData, ReportID]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="View PDF"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          {
            name: 'Sorting Production Reports',
            href: paths.dashboard.Production.ProductionReport.root,
          },
          { name: 'Pdf' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Loading report...
          </Typography>
        </Box>
      ) : error ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Box>
      ) : currentData ? (
        // Pass the fetched data to the ProductionPDF component
        <ProductionPDF currentData={currentData} />
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h6" color="text.secondary">
            No Report Found
          </Typography>
        </Box>
      )}
    </Container>
  );
}
