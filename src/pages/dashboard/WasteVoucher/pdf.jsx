import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import ItemVoucherPdf from 'src/sections/WasteVoucher/view/ItemVoucher-pdf-view';

// ----------------------------------------------------------------------

export default function ItemReceivePdfPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Item Voucher: View PDF</title>
      </Helmet>

      <ItemVoucherPdf urlData={params} />
      {/* <ItemRPdf urlData={params} />
       */}
    </>
  );
}
