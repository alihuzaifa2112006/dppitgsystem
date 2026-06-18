import { Helmet } from 'react-helmet-async';
import { TransferVoucherNewView } from 'src/sections/TransferVoucher/view';


// ----------------------------------------------------------------------

export default function TransferVoucherNewPage() {
  return (
    <>
      <Helmet>
        <title> Transfer Vouchers: Create View</title>
      </Helmet>

      <TransferVoucherNewView />
         
    </>
  );
}
