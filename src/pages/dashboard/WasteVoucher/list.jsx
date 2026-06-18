import { Helmet } from 'react-helmet-async';
import { WasteVoucherListView } from 'src/sections/WasteVoucher/view';
import WasteVoucherGridView from 'src/sections/WasteVoucher/view/WasteVoucher-sheet-grid-view';

// ----------------------------------------------------------------------

export default function WasteVoucherListPage() {
  return (
    <>
      <Helmet>
        <title>Item Voucher: List View</title>
      </Helmet>

      {/* <WasteVoucherListView /> */}
      <WasteVoucherGridView />
    </>
  );
}
