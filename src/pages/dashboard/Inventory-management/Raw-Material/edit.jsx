import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router';
import { ColorEditView } from 'src/sections/color/view';
import { ProductEditView } from 'src/sections/RawMaterial/view';

// ----------------------------------------------------------------------

export default function ColorNewPage() {
  const params = useParams();
  return (
    <>
      <Helmet>
        <title> CYCLO Colors: Edit View</title>
      </Helmet>

      <ProductEditView urlData={params} />
    </>
  );
}
