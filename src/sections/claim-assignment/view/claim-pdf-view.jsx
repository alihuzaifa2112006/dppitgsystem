import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import axios from 'axios';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Typography, Box, CircularProgress } from '@mui/material';
import { RouterLink } from 'src/routes/components';
import Iconify from 'src/components/iconify';
import { enqueueSnackbar } from 'notistack';
import ClaimPDF from '../claimReport';
import { Get } from 'src/api/apibasemethods';

// ----------------------------------------------------------------------

export default function ClaimPDFView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [currentData, setCurrentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true for initial loading
  const [error, setError] = useState(null);

  const GetPDFData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(
        `https://cyclohub.scmcloud.online/api/ComplaintAuditReport/View/${urlData?.piID}`
      );
      setCurrentData(response.data);
    } catch (err) {
      console.log(err);
      setError('Failed to load report data');
      enqueueSnackbar('Failed to load report', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [urlData]);

  // --------------------- Is All Data Fetched -------------------------
  useEffect(() => {
    if (urlData?.piID) {
      GetPDFData();
    } else {
      setIsLoading(false);
      setError('No PI ID provided');
    }
  }, [GetPDFData, urlData]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="View PDF"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Claim Audit', href: paths.dashboard.customerClaim.claimAudits.root },
          { name: 'Audit PDF' },
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
        <ClaimPDF currentData={currentData} />
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

ClaimPDFView.propTypes = {
  urlData: PropTypes.object,
};
