import Container from '@mui/material/Container';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import CustomerForm from '../Customer-form';

export default function CustomerNewView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Add Customer"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Customer List',
            href: paths.dashboard.Powertool.Customer.root,
          },
          { name: 'Add Customer' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <CustomerForm />
    </Container>
  );
}
