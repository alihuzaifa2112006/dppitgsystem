import { Helmet } from 'react-helmet-async';

import { VendorNewView } from 'src/sections/Vendor/view';

// ----------------------------------------------------------------------

export default function ColorNewPage() {
  return (
    <>
      <Helmet>
        <title> Add Vendor</title>
      </Helmet>

      <VendorNewView />
    </>
  );
}
