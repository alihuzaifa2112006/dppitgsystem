import { Helmet } from 'react-helmet-async';
import { CountryListView } from 'src/sections/country/view';


// ----------------------------------------------------------------------

export default function CountryListPage() {
  return (
    <>
      <Helmet>
        <title> Country: List View</title>
      </Helmet>

      <CountryListView />
    </>
  );
}
