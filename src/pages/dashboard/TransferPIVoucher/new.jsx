import { Helmet } from 'react-helmet-async';
import { TransferPIVoucherNewView } from 'src/sections/TransferPIVouchers/view';

// ----------------------------------------------------------------------

export default function TransferPIVoucherNewPage() {
  return (
    <>
      <Helmet>
        <title>Transfer PI Voucher : Create View</title>
      </Helmet>

      <TransferPIVoucherNewView />
    </>
  );
}
