import { Helmet } from 'react-helmet-async';
import { PurposeListView } from 'src/sections/purpose/view';


// ----------------------------------------------------------------------

export default function PurposeListPage() {
  return (
    <>
      <Helmet>
        <title> Purpose</title>
      </Helmet>

      <PurposeListView />
    </>
  );
}
