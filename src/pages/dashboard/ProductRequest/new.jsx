import { Helmet } from 'react-helmet-async';
import { ProductRequestNewView } from 'src/sections/ProductRequest/view';

// ----------------------------------------------------------------------

export default function ProductRequestNewPage() {
  return (
    <>
      <Helmet>
        <title>Departmental Requisition : Create View</title>
      </Helmet>

      <ProductRequestNewView />
    </>
  );
}
