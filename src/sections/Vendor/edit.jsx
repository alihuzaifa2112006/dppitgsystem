import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router';

import { VendorEditView } from 'src/sections/Vendor/view';

// ----------------------------------------------------------------------

export default function ColorNewPage() {
  const params = useParams();
  return (
    <>
      <Helmet>
        <title> Edit View</title>
      </Helmet>

      <VendorEditView urlData={params} />
    </>
  );
}
