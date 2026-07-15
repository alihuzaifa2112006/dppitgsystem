import { Helmet } from 'react-helmet-async';
import CustomerNewView from 'src/sections/Customer/view/Customer-new-view';

export default function CustomerNewPage() {
  return (
    <>
      <Helmet>
        <title>Add Customer | Powertool</title>
      </Helmet>

      <CustomerNewView />
    </>
  );
}
