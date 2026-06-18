import { Helmet } from 'react-helmet-async';
import { TransferVoucherListView } from 'src/sections/TransferVoucher/view';
import TransferVoucherGridView from 'src/sections/TransferVoucher/view/TransferVoucher-sheet-grid-view';


// ----------------------------------------------------------------------

export default function TransferVoucherListPage() {
  return (
    <>
      <Helmet>
        <title>Transfer Vouchers: List View</title>
      </Helmet>

      {/* <TransferVoucherListView /> */}
<TransferVoucherGridView /> 
    </>
  );
}
