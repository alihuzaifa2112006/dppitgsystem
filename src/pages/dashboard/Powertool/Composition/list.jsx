import { Helmet } from 'react-helmet-async';
import CompositionList from 'src/sections/Powertool/Composition/Composition-list';

export default function CompositionListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Composition List</title>
      </Helmet>
      <CompositionList />
    </>
  );
}