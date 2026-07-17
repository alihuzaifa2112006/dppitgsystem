import { Helmet } from 'react-helmet-async';
import OfficeList from 'src/sections/Powertool/Office/Office-list';

export default function OfficeListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Offices List</title>
      </Helmet>
      <OfficeList />
    </>
  );
}