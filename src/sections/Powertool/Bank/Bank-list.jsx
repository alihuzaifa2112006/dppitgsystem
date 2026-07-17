import React from 'react';
import { Container, Button } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import BankSheetGrid from './Bank-sheet-grid';

export default function BankList() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Banks"
        links={[{ name: 'Home', href: paths.dashboard.root }, { name: 'Banks' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
        action={
          <Button component={RouterLink} href={paths.dashboard.Powertool.Bank.new} variant="contained" startIcon={<Iconify icon="mingcute:add-line" />} color="primary">
            Add Bank
          </Button>
        }
      />
      <BankSheetGrid />
    </Container>
  );
}
