import { Helmet } from 'react-helmet-async';
import { ColorListView } from 'src/sections/color/view';

// ----------------------------------------------------------------------

export default function ColorListPage() {
  return (
    <>
      <Helmet>
        <title> CYCLO Colors: List View</title>
      </Helmet>

      <ColorListView />
    </>
  );
}
