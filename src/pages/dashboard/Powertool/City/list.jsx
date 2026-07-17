import { Helmet } from 'react-helmet-async';
import CityList from 'src/sections/Powertool/City/City-list';

export default function CityListPage() {
  return (
    <>
      <Helmet><title> Dashboard: Cities List</title></Helmet>
      <CityList />
    </>
  );
}
