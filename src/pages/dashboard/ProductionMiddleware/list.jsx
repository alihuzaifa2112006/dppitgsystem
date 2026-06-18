import { Helmet } from 'react-helmet-async';

import ProductionMiddlewareGridView from 'src/sections/ProductionMiddleware/view/ProductionMiddleware-sheet-grid-view';

// ----------------------------------------------------------------------

export default function ProductionMiddlewareListPage() {
  return (
    <>
      <Helmet>
        <title> Production Middleware List</title>
      </Helmet>

      <ProductionMiddlewareGridView />
    </>
  );
}
