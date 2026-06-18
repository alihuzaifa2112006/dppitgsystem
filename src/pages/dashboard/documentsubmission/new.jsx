import { Helmet } from 'react-helmet-async';
import { DocSubmitAddView } from 'src/sections/documentsubmission/view';



// ----------------------------------------------------------------------

export default function DocSubmitAddPage() {
  return (
    <>
      <Helmet>
        <title>Document Submission: Add</title>
      </Helmet>

      <DocSubmitAddView />
    </>
  );
}
