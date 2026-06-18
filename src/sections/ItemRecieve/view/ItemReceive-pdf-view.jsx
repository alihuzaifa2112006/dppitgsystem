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
import { Get } from 'src/api/apibasemethods';
import ReceivePdf from '../ItemReceive-Report';
import { useParams } from 'react-router-dom'; // Import useParams

// ----------------------------------------------------------------------

export default function ItemReceivePdf() {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Use the useParams hook to get the GRNID from the URL
  const { GRNID } = useParams();

  const [currentData, setCurrentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const GetPDFData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Use the GRNID from the URL params directly
      const response = await Get(`GetItemReceivingByGRNID?GRNID=${GRNID}`);
      setCurrentData(response.data);
      console.log('Fetched PDF Data:', response.data);
      console.log('Using GRNID:', GRNID);
    } catch (err) {
      console.log(err);
      setError('Failed to load report data');
      enqueueSnackbar('Failed to load report', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [GRNID]);


  useEffect(() => {
    if (GRNID) {
      GetPDFData();
    } else {
      setIsLoading(false);
      setError('No GRN ID FOUND');
    }
  }, [GetPDFData, GRNID]); 

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="View PDF"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Item Receive', href: paths.dashboard.InventoryManagement.ItemRecieve.root },
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
        <ReceivePdf currentData={currentData} />
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