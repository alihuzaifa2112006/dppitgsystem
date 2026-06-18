import { Helmet } from 'react-helmet-async';
import { BlendnameListView } from 'src/sections/blendname/view';

// ----------------------------------------------------------------------

export default function BlendnameListPage() {
  return (
    <>
      <Helmet>
        <title> Blends: List View</title>
      </Helmet>

      <BlendnameListView />
    </>
  );
}
