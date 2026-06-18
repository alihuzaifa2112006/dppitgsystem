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
import TransferVoucherPDFOrg from '../Transfer-PDF';
import { useParams } from 'react-router-dom';

// ----------------------------------------------------------------------

export default function TransferVoucherPDF() {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const { TransferMstID } = useParams();
  console.log('TransferMstID from params:', TransferMstID);

  const [currentData, setCurrentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  const GetTransferPDFData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await Get(
        `ItemTransfer/GetByID?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&TransferID=${TransferMstID}`
      );

      if (response.data && response.data.Success) {
        setCurrentData(response.data.Data);
        console.log('Fetched PDF Data:', response.data.Data);
      } else {
        throw new Error('API request failed or returned an error status.');
      }
    } catch (err) {
      console.log(err);
      setError('Failed to load report data');
      enqueueSnackbar('Failed to load report', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [TransferMstID, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    if (TransferMstID) {
      GetTransferPDFData();
    } else {
      setIsLoading(false);
      setError('Data Not Found');
    }
  }, [GetTransferPDFData, TransferMstID]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="View PDF"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          {
            name: 'Item Transfer Voucher',
            href: paths.dashboard.Production.TransferVoucher.root,
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
        <TransferVoucherPDFOrg currentData={currentData} />
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
