import { Helmet } from 'react-helmet-async';

import EndCustomersAdd from 'src/sections/EndCustomers/view/end-customer-add-view';

// import { AccountAddView } from 'src/sections/profile/view';


// ----------------------------------------------------------------------

export default function AccountPage() {
  return (
    <>
      <Helmet>
        <title>End Customer : Add</title>
      </Helmet>

      <EndCustomersAdd />
    </>
  );
}
