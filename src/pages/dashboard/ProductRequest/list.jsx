import { Helmet } from 'react-helmet-async';
import { ProductRequestListView } from 'src/sections/ProductRequest/view';
import ProductRequestGridView from 'src/sections/ProductRequest/view/ProductRequest-sheet-grid-view';
// ----------------------------------------------------------------------

export default function ProductRequestListPage() {
  return (
    <>
      <Helmet>
        <title>Departmental Requisition : List View</title>
      </Helmet>

      {/* <ProductRequestListView /> */}
      <ProductRequestGridView />
    </>
  );
}
