import { Helmet } from 'react-helmet-async';
import { ColorListView } from 'src/sections/color/view';
import RMListView from 'src/sections/Raw_Material/view/raw-view';


// ----------------------------------------------------------------------

export default function ColorListPage() {
  return (
    <>
      <Helmet>
        <title> CYCLO Colors: List View</title>
      </Helmet>

      <RMListView />
    </>
  );
}
