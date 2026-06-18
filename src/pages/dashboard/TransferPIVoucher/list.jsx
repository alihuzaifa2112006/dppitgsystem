import { Helmet } from 'react-helmet-async';
import { TransferPIVoucherListView } from 'src/sections/TransferPIVouchers/view';

import TransferPIVoucherGridView from 'src/sections/TransferPIVouchers/view/TransferPIVoucher-sheet-grid-view';
// ----------------------------------------------------------------------

export default function TransferPIVoucherListPage() {
  return (
    <>
      <Helmet>
        <title>Transfer PI Voucher : List View</title>
      </Helmet>

      {/* <TransferPIVoucherListView /> */}
      <TransferPIVoucherGridView />
    </>
  );
}
