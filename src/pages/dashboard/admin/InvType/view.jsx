import { Helmet } from 'react-helmet-async';
import { InvTypeListView } from 'src/sections/InvType/view';




// ----------------------------------------------------------------------

export default function InvTypeListPage() {
  return (
    <>
      <Helmet>
        <title> Item Type : List View</title>
      </Helmet>

      <InvTypeListView />
    </>
  );
}
