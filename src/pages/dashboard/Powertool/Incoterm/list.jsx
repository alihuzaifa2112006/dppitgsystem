import { Helmet } from 'react-helmet-async';
import IncotermList from 'src/sections/Powertool/Incoterm/Incoterm-list';

export default function IncotermListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Incoterms List</title>
      </Helmet>
      <IncotermList />
    </>
  );
}