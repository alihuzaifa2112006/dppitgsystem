import { Helmet } from 'react-helmet-async';
import { ColorNewView } from 'src/sections/color/view';
import { ProductNewView } from 'src/sections/RawMaterial/view';

// ----------------------------------------------------------------------

export default function ColorNewPage() {
  return (
    <>
      <Helmet>
        <title> CYCLO Colors: Add View</title>
      </Helmet>

      <ProductNewView />
    </>
  );
}
