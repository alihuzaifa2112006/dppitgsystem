import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router';
import { ProductionView } from 'src/sections/production/view';



// ----------------------------------------------------------------------

export default function AccountPage() {
  const params = useParams();
  return (
    <>
      <Helmet>
        <title>Production : Edit</title>
      </Helmet>

      <ProductionView urlData={params}/>
    </>
  );
}