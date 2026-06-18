import { Helmet } from 'react-helmet-async';
import { useParams } from 'src/routes/hooks';
import { ProductionMiddlewareApprovalView } from 'src/sections/ProductionMiddleware/view';


// ----------------------------------------------------------------------

export default function ProductionMiddlewareApprovalPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Production Middleware Approval</title>
      </Helmet>

      <ProductionMiddlewareApprovalView urlData={params} />
    </>
  );
}
