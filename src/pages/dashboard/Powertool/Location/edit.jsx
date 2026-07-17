import { Helmet } from 'react-helmet-async';
import LocationEditForm from 'src/sections/Powertool/Location/Location-edit-form';

export default function LocationEditPage() {
  return (
    <>
      <Helmet><title> Dashboard: Edit Location</title></Helmet>
      <LocationEditForm />
    </>
  );
}
