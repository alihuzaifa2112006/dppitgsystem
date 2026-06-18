import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import AddForm from '../AddForm';

// ----------------------------------------------------------------------

export default function FormAdd() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Form"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Form', href: paths.dashboard.admin.forms.root },
          { name: 'Add' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <AddForm />
    </Container>
  );
}
