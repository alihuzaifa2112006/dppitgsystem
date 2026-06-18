import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ProductionMiddlewareCreateForm from '../ProductionMiddleware-new';

// ----------------------------------------------------------------------

export default function ProductionMiddlewareNewView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Production Middleware"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Production Middleware',
            href: paths.dashboard.Production.Planning.ProductionMiddleware.root,
          },
          { name: 'Open Item' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ProductionMiddlewareCreateForm />
    </Container>
  );
}
