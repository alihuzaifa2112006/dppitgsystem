import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router';
import { AccountCoversheetView } from 'src/sections/coversheet/view';


// ----------------------------------------------------------------------

export default function AccountPage() {
  const params = useParams();
  return (
    <>
      <Helmet>
        <title>Coversheet: View</title>
      </Helmet>

      <AccountCoversheetView urlData={params}/>
    </>
  );
}