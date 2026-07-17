import { Helmet } from 'react-helmet-async';
import LocationList from 'src/sections/Powertool/Location/Location-list';

export default function LocationListPage() {
  return (
    <>
      <Helmet><title> Dashboard: Locations List</title></Helmet>
      <LocationList />
    </>
  );
}
