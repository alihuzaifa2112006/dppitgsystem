import { Helmet } from 'react-helmet-async';
import { ProductVoucherListView } from 'src/sections/ProductVouchers/view';
import ProductVoucherGridView from 'src/sections/ProductVouchers/view/ProductVouchers-sheet-grid-view';
// ----------------------------------------------------------------------

export default function ProductVoucherListPage() {
  return (
    <>
      <Helmet>
        <title>Production Voucher : List View</title>
      </Helmet>

      {/* <ProductRequestListView /> */}
      <ProductVoucherGridView />
    </>
  );
}
