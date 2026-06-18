import { Helmet } from 'react-helmet-async';
import { WasteVoucherNewView } from 'src/sections/WasteVoucher/view';


// ----------------------------------------------------------------------

export default function WasteVoucherNewPage() {
  return (
    <>
      <Helmet>
        <title> Item Voucher: Create View</title>
      </Helmet>

      <WasteVoucherNewView />
         
    </>
  );
}
