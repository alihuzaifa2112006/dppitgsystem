import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router';
import { WICEditView } from 'src/sections/wic/view';

// ----------------------------------------------------------------------

export default function WICEditPage() {
  const params = useParams();
  return (
    <>
      <Helmet>
        <title> Walkin Customer: Edit View</title>
      </Helmet>

      <WICEditView urlData={params}/>
    </>
  );
}
