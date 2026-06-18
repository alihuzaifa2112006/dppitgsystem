import { Helmet } from 'react-helmet-async';
import { useParams } from 'src/routes/hooks';
import CustomerOnboardForm from 'src/components/CustomerOnboardForm';
import { Container } from '@mui/system';
import { useEffect, useState } from 'react';
import { decryptLink } from 'src/utils/LinkEncryption';
import { settings } from 'nprogress';
import { Get } from 'src/api/apibasemethods';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
// ----------------------------------------------------------------------

export default function CustomerOnboardingPage() {
  const params = useParams();
  const [currentData, setCurrentData] = useState();
  // Decrypt the values

  useEffect(() => {
    if (params?.id) {
      try {
        const decryptedVID = decryptLink(params.id); // Make sure to access `params.id`
        const fetchData = async () => {
          const res = await Get(`getWICByID/${decryptedVID}`);
          setCurrentData(res?.data || undefined);
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
          heading="Customer Registeration Form"
          links={[
            {
              name: 'Home',
              href: paths.dashboard.root,
            },
            {
              name: 'Customer Registeration',
            },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        {currentData && <CustomerOnboardForm currentData={currentData} />}
      </Container>
    </>
  );
}
