import { Helmet } from 'react-helmet-async';

import RegulationsListView from 'src/sections/Regulations/view/Regulations-list-view';
// ----------------------------------------------------------------------

export default function RegulationsListPage() {
  return (
    <>
      <Helmet>
        <title> Regulations List</title>
      </Helmet>

      <RegulationsListView />
    </>
  );
}
