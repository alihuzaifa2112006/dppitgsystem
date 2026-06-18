import { Helmet } from 'react-helmet-async';
import { CompositionListView } from 'src/sections/composition/view';

// ----------------------------------------------------------------------

export default function CompositionListPage() {
  return (
    <>
      <Helmet>
        <title> Composition: List View</title>
      </Helmet>

      <CompositionListView />
    </>
  );
}
