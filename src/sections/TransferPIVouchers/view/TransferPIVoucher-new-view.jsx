import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import TransferPIVoucherCreateForm from '../TransferPIVoucher-new';


// ----------------------------------------------------------------------

export default function TransferPIVoucherNewView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
          heading="Transfer Voucher"
          links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Transfer Voucher',
            href: paths.dashboard.Production.TransferPIVoucher.root,
          },
          { name: 'Add' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <TransferPIVoucherCreateForm />
    </Container>
  );
}
