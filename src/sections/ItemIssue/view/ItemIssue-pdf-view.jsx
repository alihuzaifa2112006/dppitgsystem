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
import ItemIssuePDF from '../ItemIssue-PDF';

// ----------------------------------------------------------------------

export default function ItemIssuePDFView() {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const { IssueID = 0 } = useParams(); // âœ… GRNID aur ItemOpenID dono route se milenge

  const [currentData, setCurrentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const GetPDFData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const orgId = userData?.userDetails?.orgId;
      const branchId = userData?.userDetails?.branchID;

      const response = await Get(
        `GetIssueDetails?Org_Id=${orgId}&Branch_Id=${branchId}&IssueID=${IssueID}`
      );


      // Response ek array aa raha hai -> handle accordingly
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
  }, [IssueID, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    if (IssueID) {
      GetPDFData();
    } else {
      setIsLoading(false);
      setError('No IssueID provided');
    }
  }, [GetPDFData, IssueID]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="View PDF"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Item Issue', href: paths.dashboard.InventoryManagement.ItemIssue.root },
          { name: 'Pdf' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Loading issue details...
          </Typography>
        </Box>
      ) : error ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Box>
      ) : currentData && currentData.length > 0 ? (
        <ItemIssuePDF currentData={currentData} />
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h6" color="text.secondary">
            No Issue Details Found
          </Typography>
        </Box>
      )}
    </Container>
  );
}
