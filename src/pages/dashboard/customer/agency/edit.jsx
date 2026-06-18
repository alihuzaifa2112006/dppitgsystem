import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router';
import { AgencyView } from 'src/sections/agency/view';
// import { AccountView } from 'src/sections/supplier_profile/view';
// import { AccountView } from 'src/sections/profile/view';


// ----------------------------------------------------------------------

export default function AccountPage() {
  const params = useParams();
  return (
    <>
      <Helmet>
        <title>Agency Profile: Edit</title>
      </Helmet>

      <AgencyView urlData={params}/>
    </>
  );
}