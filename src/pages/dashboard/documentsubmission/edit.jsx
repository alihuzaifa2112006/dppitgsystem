import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router';
import DocSubmitEdit from 'src/sections/documentsubmission/DocSubmit-edit';



// ----------------------------------------------------------------------

export default function DocSubmitEditPage() {
  const params = useParams();
  return (
    <>
      <Helmet>
        <title>Document Submission : Edit</title>
      </Helmet>

      <DocSubmitEdit urlData={params}/>
    </>
  );
}