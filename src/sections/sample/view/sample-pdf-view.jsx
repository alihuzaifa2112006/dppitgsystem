import PropTypes from 'prop-types';

import Container from '@mui/material/Container';
import { Typography, Box, CircularProgress } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { enqueueSnackbar } from 'notistack';

import { Get } from 'src/api/apibasemethods';
import useGetAllClausesByDocTypeID from 'src/utils/getClauses';

import SampleReport from '../SampleReport';
import { APP_API } from 'src/config-global';

// ----------------------------------------------------------------------

export default function SamplePDFView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [currentData, setCurrentData] = useState(null);
  const [clauses, setClauses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAllClauses = useGetAllClausesByDocTypeID();

  // ------------------- Fetch PDF Data -------------------
  const GetPDFData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1️⃣ Fetch Sample Request Data
      const response = await Get(
        `getSampleRequestsanddtl?Sample_Request_ID=${urlData?.sampleID}&OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}`
      );

      if (!response?.data?.Data) {
        throw new Error('No data returned from server');
      }

      // 2️⃣ Fetch Clauses
      const clauseData = await getAllClauses(3);
      setClauses(clauseData);

      // 3️⃣ Fetch Supplier Signature Image
      const imgRes = await fetch(
        `${APP_API}GetSignatureImageByApprover?approverId=446`
      );

      if (!imgRes.ok) throw new Error('Signature image not found');

      const arrayBuffer = await imgRes.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const imageUrl = `data:image/png;base64,${base64}`;

      // 4️⃣ Combine All Data
      const merged = {
        ...response.data.Data[0],
        SupplierSignature: imageUrl || null,
      };

      setCurrentData(merged);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load PDF data');
      enqueueSnackbar('Failed to load PDF data', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [
    urlData?.sampleID,
    userData?.userDetails?.orgId,
    userData?.userDetails?.branchID,
    getAllClauses,
  ]);

  // ------------------- UseEffect -------------------
  useEffect(() => {
    if (urlData?.sampleID) {
      GetPDFData();
    } else {
      setError('No Sample ID Found');
      setIsLoading(false);
    }
  }, [GetPDFData, urlData]);

  // ------------------- UI -------------------
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="View PDF"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Sample Request', href: paths.dashboard.transaction.sample.root },
          { name: 'PDF' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Loading */}
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading PDF...</Typography>
        </Box>
      )}

      {/* Error */}
      {!isLoading && error && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography color="error" variant="h6">
            {error}
          </Typography>
        </Box>
      )}

      {/* Data Loaded */}
      {!isLoading && !error && currentData && (
        <SampleReport currentData={currentData} clauses={clauses} />
      )}

      {/* No Data */}
      {!isLoading && !error && !currentData && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="h6" color="text.secondary">
            No PDF Data Found
          </Typography>
        </Box>
      )}
    </Container>
  );
}

SamplePDFView.propTypes = {
  urlData: PropTypes.any,
};
