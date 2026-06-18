import { Helmet } from 'react-helmet-async';
import SparePartsListView from '../../../../sections/spareparts/view/sp-view';



// ----------------------------------------------------------------------

export default function CountryListPage() {
  return (
    <>
      <Helmet>
        <title> Spare Parts: List View</title>
      </Helmet>

      <SparePartsListView />
    </>
  );
}
