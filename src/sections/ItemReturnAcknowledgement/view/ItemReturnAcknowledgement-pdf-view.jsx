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
import ItemReturnAcknowledgementPDF from '../ItemReturnAcknowledgement-PDF';

// ----------------------------------------------------------------------

export default function ItemReturnAcknowledgementPDFView({ rowData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const { GRNID = 0, ItemOpenID = 0 } = useParams();

  const [currentData, setCurrentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // When rowData is passed from grid - pass as array for PDF
  const pdfDataFromProps = useMemo(() => (rowData ? [rowData] : null), [rowData]);

  const GetPDFData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const orgId = userData?.userDetails?.orgId;
      const branchId = userData?.userDetails?.branchID;

      const response = await Get(
        `GetIssueDetails?Org_Id=${orgId}&Branch_Id=${branchId}&GRNID=${GRNID}&ItemOpenID=${ItemOpenID}`
      );

      if (Array.isArray(response)) {
        setCurrentData(response);
      } else if (response?.data && Array.isArray(response.data)) {
        setCurrentData(response.data);
      } else {
        setCurrentData([]);
      }
    } catch (err) {
      console.log(err);
      setError('Failed to load issue details');
      enqueueSnackbar('Failed to load issue details', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [GRNID, ItemOpenID, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    if (rowData) {
      // Data from props - no need to fetch
      setIsLoading(false);
      setError(null);
    } else if (GRNID) {
      GetPDFData();
    } else {
      setIsLoading(false);
      setError('No GRNID provided');
    }
  }, [GetPDFData, GRNID, rowData]);

  // When using props (from grid dialog), render without breadcrumbs
  const content = (() => {
    if (rowData) {
      return (
        <ItemReturnAcknowledgementPDF currentData={pdfDataFromProps} />
      );
    }

    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Loading issue details...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Box>
      );
    }

    if (currentData && currentData.length > 0) {
      return <ItemReturnAcknowledgementPDF currentData={currentData} />;
    }

    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6" color="text.secondary">
          No Issue Details Found
        </Typography>
      </Box>
    );
  })();

  // In dialog mode (rowData provided) - no Container/breadcrumbs
  if (rowData) {
    return <Box sx={{ minHeight: '60vh' }}>{content}</Box>;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Stock Acknowledgement"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          {
            name: 'Stock Acknowledgement',
            href: paths.dashboard.InventoryManagement.ItemReturnAcknowledgement.root,
          },
          { name: 'Pdf' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      {content}
    </Container>
  );
}

ItemReturnAcknowledgementPDFView.propTypes = {
  rowData: PropTypes.object,
};
