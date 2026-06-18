import { Helmet } from 'react-helmet-async';
import { ProfileListView } from 'src/sections/profile/view';

// ----------------------------------------------------------------------

export default function ProfileListPage() {
  return (
    <>
      <Helmet>
        <title> Customer Profile: List View</title>
      </Helmet>

      <ProfileListView />
    </>
  );
}
