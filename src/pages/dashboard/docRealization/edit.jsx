import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router';
import DocRealizationEdit from '../../../sections/docRealization/DocRealization-edit';




// ----------------------------------------------------------------------

export default function DocRealizationEditPage() {
  const params = useParams();
  return (
    <>
      <Helmet>
        <title>Document Realization : Edit</title>
      </Helmet>

      <DocRealizationEdit urlData={params}/>
    </>
  );
}