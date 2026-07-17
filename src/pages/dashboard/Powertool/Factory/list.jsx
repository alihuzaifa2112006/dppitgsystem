import { Helmet } from 'react-helmet-async';
import FactoryList from 'src/sections/Powertool/Factory/Factory-list';

export default function FactoryListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Factories List</title>
      </Helmet>
      <FactoryList />
    </>
  );
}