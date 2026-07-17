import { Helmet } from 'react-helmet-async';
import LocationForm from 'src/sections/Powertool/Location/Location-form';

export default function LocationNewPage() {
  return (
    <>
      <Helmet><title> Dashboard: Create a new Location</title></Helmet>
      <LocationForm />
    </>
  );
}
