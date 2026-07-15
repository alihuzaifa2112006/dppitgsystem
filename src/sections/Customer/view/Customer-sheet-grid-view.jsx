import Container from '@mui/material/Container';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { Button, Stack } from '@mui/material';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { Box } from '@mui/system';
import CustomerGrid from '../Customer-sheet-grid';

export default function CustomerGridView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Customer List"
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          { name: 'Customer List' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
        action={
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Button
              component={RouterLink}
              href={paths.dashboard.Powertool.Customer.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              color="primary"
            >
              Add Customer
            </Button>
          </Box>
        }
      />

      <CustomerGrid />
    </Container>
  );
}
