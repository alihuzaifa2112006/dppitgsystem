import { Helmet } from 'react-helmet-async';
import { DepsectionListView } from 'src/sections/depsection/view';

// ----------------------------------------------------------------------

export default function DepsectionListPage() {
  return (
    <>
      <Helmet>
        <title> Department sections: List View</title>
      </Helmet>

      <DepsectionListView />
    </>
  );
}
