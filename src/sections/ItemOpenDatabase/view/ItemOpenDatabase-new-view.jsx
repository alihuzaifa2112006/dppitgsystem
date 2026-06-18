import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ItemOpenDatabaseCreateForm from '../ItemOpenDatabase-new';

// ----------------------------------------------------------------------

export default function ItemOpenDatabaseNewView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Item Open"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Item Open',
            href: paths.dashboard.InventoryManagement.ItemOpenDatabase.root,
          },
          { name: 'Open Item' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ItemOpenDatabaseCreateForm />
    </Container>
  );
}
