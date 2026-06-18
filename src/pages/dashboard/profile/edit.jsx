import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router';
import { AccountView } from 'src/sections/profile/view';


// ----------------------------------------------------------------------

export default function AccountPage() {
  const params = useParams();
  return (
    <>
      <Helmet>
        <title>Customer Profile: Edit</title>
      </Helmet>

      <AccountView urlData={params}/>
    </>
  );
}