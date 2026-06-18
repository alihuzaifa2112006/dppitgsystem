import { Helmet } from 'react-helmet-async';
import { YarnTypeListView } from 'src/sections/yarn-type/view';

// ----------------------------------------------------------------------

export default function YarnTypeViewPage() {
  return (
    <>
      <Helmet>
        <title>Yarn Types</title>
      </Helmet>

      <YarnTypeListView />
    </>
  );
}
