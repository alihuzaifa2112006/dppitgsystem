import { Helmet } from 'react-helmet-async';
import { useParams } from 'src/routes/hooks';
import { CompositionEditView } from 'src/sections/composition/view';

// ----------------------------------------------------------------------

export default function CompositionNewPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Composition: Edit View</title>
      </Helmet>

      <CompositionEditView urlData={params} />
    </>
  );
}
