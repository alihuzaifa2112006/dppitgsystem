import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import AccountGeneralAdd from '../agency-add'

// ----------------------------------------------------------------------

export default function AgencyAddView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Agency"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Agency', href: paths.dashboard.customer.agency.root },
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
