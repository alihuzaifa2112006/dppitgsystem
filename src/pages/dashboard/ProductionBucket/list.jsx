import { Helmet } from 'react-helmet-async';

import ProductionBucketGridView from 'src/sections/ProductionBucket/view/ProductionBucket-sheet-grid-view';

// ----------------------------------------------------------------------

export default function ProductionBucketListPage() {
  return (
    <>
      <Helmet>
        <title> AI Bucket List</title>
      </Helmet>

      <ProductionBucketGridView />
    </>
  );
}
