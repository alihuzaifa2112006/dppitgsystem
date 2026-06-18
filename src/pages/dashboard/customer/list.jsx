import { Helmet } from 'react-helmet-async';
import { CustomerListView } from 'src/sections/customer/view';

// ----------------------------------------------------------------------

export default function CustomerListPage() {
  return (
    <>
      <Helmet>
        <title> Walkin Customer: List View</title>
      </Helmet>

      <CustomerListView />
    </>
  );
}
