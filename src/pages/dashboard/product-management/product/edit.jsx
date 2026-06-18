import { Helmet } from 'react-helmet-async';
import { useParams } from 'src/routes/hooks';
import { ProductEditView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export default function ProductNewPage() {
  const params = useParams();
  return (
    <>
      <Helmet>
        <title> Product: Edit View</title>
      </Helmet>

      <ProductEditView urlData={params} />
    </>
  );
}
