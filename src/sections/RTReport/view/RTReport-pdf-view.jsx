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
import RTReportPDF from '../RTReportPDF-PDF';

// ----------------------------------------------------------------------

export default function RTReportPDFView() {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const { ReportID } = useParams();

  const [currentData, setCurrentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const GetPDFData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // const response = await Get(
      //   `GetRagTearingReportById?reportId=${ReportID}&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      // );
      // GetRagTearingReportById/1 
      const response = await Get(
        `GetRagTearingReportById/${ReportID}?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
      );

      setCurrentData(response?.data || response);
    } catch (err) {
      console.error(err);
      setError('Failed to load report data');
      enqueueSnackbar('Failed to load report', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [ReportID, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    if (ReportID) {
      GetPDFData();
    } else {
      setIsLoading(false);
      setError('No Report  ID FOUND');
    }
  }, [GetPDFData, ReportID]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="View PDF"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          {
            name: 'Rags Tearing Production Report',
            href: paths.dashboard.Production.RTReport.root,
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
        <RTReportPDF currentData={currentData} />
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
