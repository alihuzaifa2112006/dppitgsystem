import { Helmet } from 'react-helmet-async';
import CustomerGridView from 'src/sections/Customer/view/Customer-sheet-grid-view';

export default function CustomerListPage() {
  return (
    <>
      <Helmet>
        <title>Customer List | Powertool</title>
      </Helmet>

      <CustomerGridView />
    </>
  );
}
