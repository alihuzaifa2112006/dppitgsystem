import { Helmet } from 'react-helmet-async';
import { ProductVoucherNewView } from 'src/sections/ProductVouchers/view';

// ----------------------------------------------------------------------

export default function ProductVoucherNewPage() {
  return (
    <>
      <Helmet>
        <title>Production Voucher : Create View</title>
      </Helmet>

      <ProductVoucherNewView />
    </>
  );
}
