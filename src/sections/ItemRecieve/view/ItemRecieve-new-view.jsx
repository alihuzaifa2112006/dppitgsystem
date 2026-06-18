import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ItemOpenCreateForm from '../ItemRecieve-new';

// ----------------------------------------------------------------------

export default function ItemOpenNewView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Item Receive"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Item Receive',
            href: paths.dashboard.InventoryManagement.ItemRecieve.root,
          },
          { name: 'Receive Item' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ItemOpenCreateForm />
    </Container>
  );
}
