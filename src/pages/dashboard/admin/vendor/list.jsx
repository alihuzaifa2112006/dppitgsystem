import { Helmet } from 'react-helmet-async';


import { VendorListView } from 'src/sections/Vendor/view';

// ----------------------------------------------------------------------

export default function ColorListPage() {
  return (
    <>
      <Helmet>
        <title>  List View</title>
      </Helmet>

      <VendorListView />
    </>
  );
}
