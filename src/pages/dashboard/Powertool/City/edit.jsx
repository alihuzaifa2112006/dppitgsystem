import { Helmet } from 'react-helmet-async';
import CityEditForm from 'src/sections/Powertool/City/City-edit-form';

export default function CityEditPage() {
  return (
    <>
      <Helmet><title> Dashboard: Edit City</title></Helmet>
      <CityEditForm />
    </>
  );
}
