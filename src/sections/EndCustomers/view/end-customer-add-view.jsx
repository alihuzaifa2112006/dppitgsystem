import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import EndCustomerAdd from '../end-customer-add';

// ----------------------------------------------------------------------

export default function EndCustomersAdd() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Main Buyer"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Main Buyer', href: paths.dashboard.customer.endCustomer.root },
          { name: 'Add' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <EndCustomerAdd />
    </Container>
  );
}
