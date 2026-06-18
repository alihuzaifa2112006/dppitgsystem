import { Helmet } from 'react-helmet-async';
import { useParams } from 'src/routes/hooks';
import { ProductionMiddlewareEditView } from 'src/sections/ProductionMiddleware/view';


// ----------------------------------------------------------------------

export default function ProductionMiddlewareEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Production Middleware Edit</title>
      </Helmet>

      <ProductionMiddlewareEditView urlData={params} />
    </>
  );
}
