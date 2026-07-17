import { Helmet } from 'react-helmet-async';
import CityForm from 'src/sections/Powertool/City/City-form';

export default function CityNewPage() {
  return (
    <>
      <Helmet><title> Dashboard: Create a new City</title></Helmet>
      <CityForm />
    </>
  );
}
