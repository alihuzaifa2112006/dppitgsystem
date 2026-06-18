import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import GoodsRecievedConfirmationCreateForm from '../GoodsRecievedConfirmation-new';

// ----------------------------------------------------------------------

export default function GoodsRecievedConfirmationNewView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Goods Received Confirmation"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Goods Received Confirmation',
            href: paths.dashboard.Production.GoodsRecievedConfirmation.root,
          },
          { name: 'Add' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <GoodsRecievedConfirmationCreateForm />
    </Container>
  );
}
