import { Helmet } from 'react-helmet-async';

import ProductionOpenGridView from 'src/sections/production/view/production-sheet-grid-view';

// ----------------------------------------------------------------------

export default function ProfileListPage() {
  return (
    <>
      <Helmet>
        <title> Production : List View</title>
      </Helmet>

      <ProductionOpenGridView />
    </>
  );
}
