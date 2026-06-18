import { Helmet } from 'react-helmet-async';
import { useParams } from 'src/routes/hooks';
import { ProductionBucketEditView } from 'src/sections/ProductionBucket/view';


// ----------------------------------------------------------------------

export default function ProductionBucketEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> AI Bucket Edit</title>
      </Helmet>

      <ProductionBucketEditView urlData={params} />
    </>
  );
}
