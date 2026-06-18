import { Helmet } from 'react-helmet-async';
import { ColorListView } from 'src/sections/color/view';
import { ProductListView } from 'src/sections/RawMaterial/view';

// ----------------------------------------------------------------------

export default function ColorListPage() {
  return (
    <>
      <Helmet>
        <title> CYCLO Colors: List View</title>
      </Helmet>

      <ProductListView />
    </>
  );
}
