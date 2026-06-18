import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router';

import EndCustomerView from 'src/sections/EndCustomers/view/end-customer-view';

// import { AccountView } from 'src/sections/profile/view';


// ----------------------------------------------------------------------

export default function AccountPage() {
  const params = useParams();
  return (
    <>
      <Helmet>
        <title>End Customer : Edit</title>
      </Helmet>

      <EndCustomerView urlData={params}/>
    </>
  );
}