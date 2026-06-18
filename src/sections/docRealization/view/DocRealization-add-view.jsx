import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import DocRealizationAdd from '../DocRealization-add'

// ------------------------------------------------------

export default function DocRealizationAddView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Document Realization"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Document Realization', href: paths.dashboard.Commercial.export.DocumentRealization.root },
          { name: 'Add' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <DocRealizationAdd />
    </Container>
  );
}
