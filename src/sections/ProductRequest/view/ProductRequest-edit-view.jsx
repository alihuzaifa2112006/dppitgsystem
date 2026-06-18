import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

// import ProductionRequestEditForm from '../ProductRequest-edit';
import { useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import { LoadingScreen } from 'src/components/loading-screen';
import { useSnackbar } from 'src/components/snackbar';
import ProductRequestEditForm from '../ProductRequest-edit';

// ----------------------------------------------------------------------

export default function ProductRequestEditView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const { enqueueSnackbar } = useSnackbar();

  const [currentData, setCurrentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const reqId = urlData?.piID || urlData?.ReqID || urlData?.reqId;
        
        if (!reqId) {
          console.error('ReqID/piID is missing from urlData:', urlData);
          setIsLoading(false);
          return;
        }

        const response = await Get(
          `GetReqByID?reqId=${reqId}&orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
        );
        
        // Handle response - new API returns data directly
        const data = response.data?.Data?.[0] || response.data?.Data || response.data;
        
        if (data) {
          setCurrentData(data);
        } else {
          console.error('No data returned from API:', response);
        }
      } catch (error) {
        console.error('Error fetching Product Request:', error);
        enqueueSnackbar('Failed to load product request data', { variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    const reqId = urlData?.piID || urlData?.ReqID || urlData?.reqId;
    
    if (userData?.userDetails?.orgId && userData?.userDetails?.branchID && reqId) {
      fetch();
    } else {
      setIsLoading(false);
    }
  }, [urlData?.piID, urlData?.ReqID, urlData?.reqId, urlData, userData?.userDetails?.orgId, userData?.userDetails?.branchID, enqueueSnackbar]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit Departmental Request"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Departmental Request',
            href: paths.dashboard.Production.ProductRequest.root,
          },
          { name: 'edit' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {isLoading ? (
        <LoadingScreen
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh',
          }}
        />
      ) : (
        currentData && <ProductRequestEditForm currentData={currentData} />
      )}
    </Container>
  );
}

ProductRequestEditView.propTypes = {
  urlData: PropTypes.any,
};
