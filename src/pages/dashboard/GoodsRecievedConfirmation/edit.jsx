import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';

import GoodsRecievedConfirmationEditView from 'src/sections/GoodsRecievedConfirmation/view/GoodsRecievedConfirmation-edit-view';

// ----------------------------------------------------------------------

export default function GoodsRecievedConfirmationEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Goods Recieved Confirmation: Edit</title>
      </Helmet>

      <GoodsRecievedConfirmationEditView urlData={params} />
    </>
  );
}
