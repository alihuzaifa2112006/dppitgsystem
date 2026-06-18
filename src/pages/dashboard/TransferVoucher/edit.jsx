import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { TransferVoucherEditView } from 'src/sections/TransferVoucher/view';

// ----------------------------------------------------------------------

export default function TransferVoucherEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Transfer Voucher Edit</title>
      </Helmet>

      <TransferVoucherEditView urlData={params} />
    </>
  );
}
