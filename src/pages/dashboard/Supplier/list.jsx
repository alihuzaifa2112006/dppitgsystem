import { Helmet } from 'react-helmet-async';

import SupplierGridView from 'src/sections/Supplier/view/Supplier-sheet-grid-view';
// ----------------------------------------------------------------------

export default function SupplierListPage() {
  return (
    <>
      <Helmet>
        <title> Supply Chain Network Onboard List</title>
      </Helmet>


      <SupplierGridView />
    </>
  );
}

