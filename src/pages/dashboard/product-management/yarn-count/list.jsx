import { Helmet } from 'react-helmet-async';
import { YarnCountListView } from 'src/sections/yarn-count/view';

// ----------------------------------------------------------------------

export default function YarnCountListPage() {
  return (
    <>
      <Helmet>
        <title> Yarn Count: List View</title>
      </Helmet>

      <YarnCountListView />
    </>
  );
}
