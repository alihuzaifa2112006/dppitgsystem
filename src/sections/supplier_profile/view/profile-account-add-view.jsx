import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import AccountGeneralAdd from '../account-general-add';

// ----------------------------------------------------------------------

export default function AccountAddView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Supplier"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Supplier', href: paths.dashboard.admin.SupplierProfile.root },
          { name: 'Add' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <AccountGeneralAdd />
    </Container>
  );
}
