import { Helmet } from 'react-helmet-async';
import { ProductionMiddlewareNewView } from 'src/sections/ProductionMiddleware/view';

// ----------------------------------------------------------------------

export default function ProductionMiddlewareNewPage() {

  return (
    <>
      <Helmet>
        <title> Production Middleware Add</title>
      </Helmet>

      <ProductionMiddlewareNewView />
    </>
  );
}
