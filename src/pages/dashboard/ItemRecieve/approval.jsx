import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import { ItemRecieveApprovalView } from 'src/sections/ItemRecieve/view';


// ----------------------------------------------------------------------

export default function ItemRecieveApprovalPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Item Recieve Approval</title>
      </Helmet>

      <ItemRecieveApprovalView urlData={params} />
    </>
  );
}
