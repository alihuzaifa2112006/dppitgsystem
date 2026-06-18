import Container from '@mui/material/Container';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ComplaintRegistrationForm from '../complaint-registration-form';
import { Typography } from '@mui/material';

// ----------------------------------------------------------------------

export default function ComplaintRegistrationFormView(url) {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>

      <Typography
        variant="h3"
        sx={{ textAlign: 'center', mb: 3 }}
      >
        Complaint Registration Form
      </Typography>


      <ComplaintRegistrationForm urlData={url} />
    </Container>
  );
}
