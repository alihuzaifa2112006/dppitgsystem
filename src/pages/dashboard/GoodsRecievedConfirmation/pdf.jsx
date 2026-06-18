import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';

import GoodsRecievedConfirmationPdfView from 'src/sections/GoodsRecievedConfirmation/view/GoodsRecievedConfirmation-pdf-view';

// ----------------------------------------------------------------------

export default function GoodsRecievedConfirmationPdfPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Goods Recieved Confirmation: PDF</title>
      </Helmet>

      <GoodsRecievedConfirmationPdfView urlData={params} />
    </>
  );
}
