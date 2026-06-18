import { Helmet } from 'react-helmet-async';
import { ProfileListView } from 'src/sections/supplier_profile/view';
// import { ProfileListView } from 'src/sections/profile/view';

// ----------------------------------------------------------------------

export default function ProfileListPage() {
  return (
    <>
      <Helmet>
        <title> Supplier Profile: List View</title>
      </Helmet>

      <ProfileListView />
    </>
  );
}
