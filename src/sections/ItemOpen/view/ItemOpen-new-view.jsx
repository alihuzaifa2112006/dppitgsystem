import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ItemOpenCreateForm from '../ItemOpen-new';

// ----------------------------------------------------------------------

export default function ItemOpenNewView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Item Transaction"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Item Transaction',
            href: paths.dashboard.InventoryManagement.ItemOpen.root,
          },
          { name: 'New' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ItemOpenCreateForm />
    </Container>
  );
}
