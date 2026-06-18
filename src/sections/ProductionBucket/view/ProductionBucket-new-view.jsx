import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ProductionBucketCreateForm from '../ProductionBucket-new';

// ----------------------------------------------------------------------

export default function ProductionBucketNewView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="AI Bucket"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'AI Bucket',
            href: paths.dashboard.Production.Planning.ProductionBucket.root,
          },
          { name: 'Open Item' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ProductionBucketCreateForm />
    </Container>
  );
}
