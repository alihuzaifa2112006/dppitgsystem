import { Helmet } from 'react-helmet-async';
import { EndCustomerListView } from 'src/sections/EndCustomers/view';

// import { ProfileListView } from 'src/sections/profile/view';

// ----------------------------------------------------------------------

export default function ProfileListPage() {
  return (
    <>
      <Helmet>
        <title> End Customer : List View</title>
      </Helmet>

      <EndCustomerListView />
    </>
  );
}
