import { Helmet } from 'react-helmet-async';
import { FabricListView } from 'src/sections/fabric/view';


// ----------------------------------------------------------------------

export default function FabricListPage() {
  return (
    <>
      <Helmet>
        <title> Fabric: List View</title>
      </Helmet>

      <FabricListView />
    </>
  );
}
