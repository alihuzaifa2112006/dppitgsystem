import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import { Typography, Box, CircularProgress } from '@mui/material'; // Added for loading/error
import { enqueueSnackbar } from 'notistack';
// import ProductRpdf from '../GoodsRecievedConfirmation';
import DepartmentalRequestPDF from '../GoodsRecievedConfirmation';

// ----------------------------------------------------------------------

export default function ProductRpdfView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [currentData, setCurrentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const ReqID = urlData?.piID;

  const GetPDFData = useCallback(async () => {
    if (!ReqID || !userData?.userDetails?.orgId || !userData?.userDetails?.branchID) {
      setError('Missing Request ID or User Details');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const orgId = userData.userDetails.orgId;
      const branchId = userData.userDetails.branchID;
      const response = await Get(`InvReceiveConfirmationandReturn/GetById?id=${ReqID}&orgId=${orgId}&branchId=${branchId}`);

      const fetchedData = response.data?.Data || response.data;

      setCurrentData(fetchedData);
    } catch (err) {
      console.error(err);
      setError('Failed to load Goods Received Confirmation data');
      enqueueSnackbar('Failed to load Goods Received Confirmation', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [ReqID, userData]);

  useEffect(() => {
    GetPDFData();
  }, [GetPDFData]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="View PDF"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Goods Received Confirmation', href: paths.dashboard.Production.GoodsRecievedConfirmation.root },
          { name: 'PDF' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading ? (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
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
        <DepartmentalRequestPDF currentData={currentData} PRRequestID={ReqID} />
      ) : (
        // <ProductRpdf currentData={currentData} PRRequestID={ReqID} />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h6" color="text.secondary">
            No Goods Received Confirmation Report Found
          </Typography>
        </Box>
      )}
    </Container>
  );
}

ProductRpdfView.propTypes = {
  urlData: PropTypes.any,
};
