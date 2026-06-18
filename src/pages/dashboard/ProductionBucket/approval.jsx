import { Helmet } from 'react-helmet-async';
import { useParams } from 'src/routes/hooks';
import { ProductionBucketApprovalView } from 'src/sections/ProductionBucket/view';


// ----------------------------------------------------------------------

export default function ProductionBucketApprovalPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> AI Bucket Approval</title>
      </Helmet>

      <ProductionBucketApprovalView urlData={params} />
    </>
  );
}
