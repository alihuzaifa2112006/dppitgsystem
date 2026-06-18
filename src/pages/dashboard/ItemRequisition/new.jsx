import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { ItemRequisitionNewView } from 'src/sections/ItemRequisition/view';

// ----------------------------------------------------------------------

export default function ItemRequisitionNewPage() {

  return (
    <>
      <Helmet>
        <title> Item Requisition Add</title>
      </Helmet>

      <ItemRequisitionNewView />
    </>
  );
}
