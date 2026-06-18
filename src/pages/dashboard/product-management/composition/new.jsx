import { Helmet } from 'react-helmet-async';
import { CompositionNewView } from 'src/sections/composition/view';

// ----------------------------------------------------------------------

export default function CompositionNewPage() {
  return (
    <>
      <Helmet>
        <title> Composition: Add View</title>
      </Helmet>

      <CompositionNewView />
    </>
  );
}
