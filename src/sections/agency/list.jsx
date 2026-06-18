import { Helmet } from 'react-helmet-async';
import { AgencyListView } from 'src/sections/agency/view';
import { ProfileListView } from 'src/sections/supplier_profile/view';
// import { ProfileListView } from 'src/sections/profile/view';

// ----------------------------------------------------------------------

export default function ProfileListPage() {
  return (
    <>
      <Helmet>
        <title> Agency Profile: List View</title>
      </Helmet>

      <AgencyListView />
    </>
  );
}
