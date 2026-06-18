import { Helmet } from 'react-helmet-async';
import { DocSubmitListView } from 'src/sections/documentsubmission/view';


// ----------------------------------------------------------------------

export default function DocSubmitListPage() {
  return (
    <>
      <Helmet>
        <title>Document Submission: List View</title>
      </Helmet>

      <DocSubmitListView />
    </>
  );
}
