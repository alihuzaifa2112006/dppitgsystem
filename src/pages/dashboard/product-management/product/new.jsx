import { Helmet } from 'react-helmet-async';
import { ProductNewView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export default function ProductNewPage() {
  return (
    <>
      <Helmet>
        <title> Product: Add View</title>
      </Helmet>

      <ProductNewView />
    </>
  );
}
