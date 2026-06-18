import { Helmet } from 'react-helmet-async';
import { UomListView } from 'src/sections/uom/view';

// ----------------------------------------------------------------------

export default function UomListPage() {
  return (
    <>
      <Helmet>
        <title> Unit Of Measure: List View</title>
      </Helmet>

      <UomListView />
    </>
  );
}
