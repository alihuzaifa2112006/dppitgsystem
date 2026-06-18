import { Helmet } from 'react-helmet-async';
import { ProductionBucketNewView } from 'src/sections/ProductionBucket/view';

// ----------------------------------------------------------------------

export default function ProductionBucketNewPage() {

  return (
    <>
      <Helmet>
        <title> AI Bucket Add</title>
      </Helmet>

      <ProductionBucketNewView />
    </>
  );
}
