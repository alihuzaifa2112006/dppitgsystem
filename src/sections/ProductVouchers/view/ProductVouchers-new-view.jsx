import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import ProductVoucherCreateForm from '../ProductVouchers-new';


// ----------------------------------------------------------------------

export default function ProductVoucherNewView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
          heading="Production Voucher"
          links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Production Voucher',
            href: paths.dashboard.Production.ProductVoucher.root,
          },
          { name: 'Add' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ProductVoucherCreateForm />
    </Container>
  );
}
