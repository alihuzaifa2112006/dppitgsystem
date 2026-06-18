import { Helmet } from 'react-helmet-async';
import { CustomerNewView } from 'src/sections/customer/view';

// ----------------------------------------------------------------------

export default function CustomerNewPage() {
  return (
    <>
      <Helmet>
        <title> Walkin Customer: Add View</title>
      </Helmet>

      <CustomerNewView />
    </>
  );
}
