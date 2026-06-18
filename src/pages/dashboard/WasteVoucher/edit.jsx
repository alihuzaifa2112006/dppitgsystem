import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { WasteVoucherEditView } from 'src/sections/WasteVoucher/view';

// ----------------------------------------------------------------------

export default function WasteVoucherEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Item Voucher Edit</title>
      </Helmet>

      <WasteVoucherEditView urlData={params} />
    </>
  );
}
