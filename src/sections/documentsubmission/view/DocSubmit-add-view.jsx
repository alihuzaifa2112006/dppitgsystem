import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import DocSubmitAdd from '../DocSubmit-add'

// ------------------------------------------------------

export default function DocSubmitAddView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Document Submission"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Document Submission', href: paths.dashboard.Commercial.export.DocumentSubmission.root },
          { name: 'Add' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <DocSubmitAdd />
    </Container>
  );
}
