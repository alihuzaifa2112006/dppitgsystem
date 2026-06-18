import { Helmet } from 'react-helmet-async';
import { ClauseListView } from 'src/sections/clause/view';

// ----------------------------------------------------------------------

export default function ClauseListPage() {
  return (
    <>
      <Helmet>
        <title> Terms & Condition / Clause: List View</title>
      </Helmet>

      <ClauseListView />
    </>
  );
}
