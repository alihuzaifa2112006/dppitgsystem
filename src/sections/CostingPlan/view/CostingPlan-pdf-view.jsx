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
import ItemVoucherPDFOrg from '../CostingPlan-PDF';
import { useParams } from 'react-router-dom';

// ----------------------------------------------------------------------

export default function ItemVoucherPdf() {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const { Voucher_ID } = useParams();
  // console.log('Voucher_ID from params:', Voucher_ID);
  console.log('User Data:', userData);

  const [currentData, setCurrentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const GetPDFData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await Get(
        `GetWasteProductionVoucherById?voucherId=${Voucher_ID}&Org_ID=${userData?.userDetails?.orgId}&Branch_ID=${userData?.userDetails?.branchID}`
      );
      setCurrentData(response.data);
      console.log('Fetched PDF Data:', response.data);
      console.log('Using Voucher ID:', Voucher_ID);
    } catch (err) {
      console.log(err);
      setError('Failed to load report data');
      enqueueSnackbar('Failed to load report', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [Voucher_ID, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    if (Voucher_ID) {
      GetPDFData();
    } else {
      setIsLoading(false);
      setError('No GRN ID FOUND');
    }
  }, [GetPDFData, Voucher_ID]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="View PDF"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Item Voucher', href: paths.dashboard.AIPlans.CostingPlan.root },
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
        <ItemVoucherPDFOrg currentData={currentData} />
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
