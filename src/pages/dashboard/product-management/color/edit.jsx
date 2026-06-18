import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router';
import { ColorEditView } from 'src/sections/color/view';

// ----------------------------------------------------------------------

export default function ColorNewPage() {
  const params = useParams();
  return (
    <>
      <Helmet>
        <title> CYCLO Colors: Edit View</title>
      </Helmet>

      <ColorEditView urlData={params} />
    </>
  );
}
