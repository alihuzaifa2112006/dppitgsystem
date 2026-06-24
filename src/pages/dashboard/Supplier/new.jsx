import { Helmet } from 'react-helmet-async';
import { SupplierNewView } from 'src/sections/Supplier/view';

// ----------------------------------------------------------------------

export default function SupplierNewPage() {
  return (
    <>
      <Helmet>
        <title> Pre On Boarding Create </title>
      </Helmet>

      <SupplierNewView />
    </>
  );
}
