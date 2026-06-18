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
import CardReportPDF from '../CardReport-PDF';

// ----------------------------------------------------------------------

export default function CardReportPDFView() {
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

      const response = await Get(
        `GetProductionCardingById?ReportID=${ReportID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
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
            name: 'Daily Production Report Carding',
            href: paths.dashboard.Production.CardReport.root,
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
        <CardReportPDF currentData={currentData} />
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
