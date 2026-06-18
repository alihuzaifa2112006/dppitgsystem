import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import ProductRequestEditView from 'src/sections/ProductRequest/view/ProductRequest-edit-view';



// ----------------------------------------------------------------------

export default function ProductRequestEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Departmental Request Edit</title>
      </Helmet>

      <ProductRequestEditView urlData={params} />
    </>
  );
}
