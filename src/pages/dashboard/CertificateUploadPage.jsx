import { Helmet } from 'react-helmet-async';
import { useParams } from 'src/routes/hooks';
import { Container } from '@mui/system';
import { useEffect, useState } from 'react';
import { decryptLink } from 'src/utils/LinkEncryption';
import { settings } from 'nprogress';
import { Get } from 'src/api/apibasemethods';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import CertificateUploadForm from 'src/components/CertificateUploadForm';
import { LoadingScreen } from 'src/components/loading-screen';
// ----------------------------------------------------------------------

export default function CustomerOnboardingPage() {
  const params = useParams();
  const [isLoading, setLoading] = useState(true);
  const [currentData, setCurrentData] = useState();
  // Decrypt the values

  useEffect(() => {
    if (params?.id) {
      try {
        const decryptedVID = decryptLink(params.id); // Make sure to access `params.id`
        const fetchData = async () => {
          const res = await Get(`getcustomerbyID/${decryptedVID}`);
          if (res.status === 200) {
            const data = {
              ...res.data?.Data,
              BusinessDetails:
                res.data?.Data.BusinessDetails !== null ? res.data?.Data.BusinessDetails : [],
              BusinessNo: res.data?.Data.BusinessNo !== null ? res.data?.Data.BusinessNo : [],
            };
            setCurrentData(data);
          }
          setLoading(false);
        };
        fetchData();
      } catch (error) {
        console.error('Decryption Error', error);
      }
    } else {
      console.error('Missing or Invalid ID in URL Params:', params);
    }
  }, [params]);

  return (
    <>
      <Helmet>
        <title>Customer Onboarding</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Customer Certificate Updation Form"
          links={[
            {
              name: 'Home',
              href: paths.dashboard.root,
            },
            {
              name: 'Customer Form',
            },
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
          <CertificateUploadForm currentData={currentData} />
        )}
      </Container>
    </>
  );
}
