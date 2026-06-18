import { Helmet } from 'react-helmet-async';
import { CityListView } from 'src/sections/city/view';


// ----------------------------------------------------------------------

export default function CityListPage() {
  return (
    <>
      <Helmet>
        <title> City: List View</title>
      </Helmet>

      <CityListView />
    </>
  );
}
