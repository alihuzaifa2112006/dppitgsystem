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
import MCheckListPDF from '../MCheckList-PDF';

// ----------------------------------------------------------------------

export default function MCheckListPDFView() {
  const settings = useSettingsContext();
  
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  // Correctly captures the URL parameter and treats it as the Checklist ID
  const { ReportID: checklistIdFromParams } = useParams(); 

  const [currentData, setCurrentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const GetPDFData = useCallback(async () => {
    
    const orgId = userData?.userDetails?.orgId;
    const branchID = userData?.userDetails?.branchID;
    
    
    if (!checklistIdFromParams || !orgId || !branchID) {
    
      setError('Missing Checklist ID, Organization ID, or Branch ID.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // This is the correct API call with the IDs passed as query parameters
      const response = await Get(
        `GetMachinePartsChecklistByID?checklistID=${checklistIdFromParams}&orgID=${orgId}&branchID=${branchID}`
      );

      console.log('📌 API Response:', response);

      // This correctly handles the response structure: { "Data": {...} }
      setCurrentData(response?.data?.Data || response);
    } catch (err) {
      console.error(err);
    
      setError('Failed to load checklist data');
      enqueueSnackbar('Failed to load checklist', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [checklistIdFromParams, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  useEffect(() => {
    if (checklistIdFromParams) {
      GetPDFData();
    } else {
      setIsLoading(false);
      
      setError('No Checklist ID found in URL parameters.');
    }
  }, [GetPDFData, checklistIdFromParams]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="View PDF"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Maintenance Checklist', href: paths.dashboard.Production.maintenance.MCheckList.root },
          { name: 'Pdf' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Loading checklist...
          </Typography>
        </Box>
      ) : error ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Box>
      ) : currentData ? (
        
        <MCheckListPDF currentData={currentData} />
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h6" color="text.secondary">
            No Checklist Found
          </Typography>
        </Box>
      )}
    </Container>
  );
}