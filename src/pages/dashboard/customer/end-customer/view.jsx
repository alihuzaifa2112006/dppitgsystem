import { Helmet } from 'react-helmet-async';
import { EndCustomerListView } from 'src/sections/endCustomer/view';

// ----------------------------------------------------------------------

export default function CustomerListPage() {
  return (
    <>
      <Helmet>
        <title> Main Buyer: List View</title>
      </Helmet>

      <EndCustomerListView />
    </>
  );
}
