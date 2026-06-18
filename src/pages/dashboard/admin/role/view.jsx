import { Helmet } from 'react-helmet-async';
import { RoleListView } from 'src/sections/role/view';

// ----------------------------------------------------------------------

export default function RoleListPage() {
  return (
    <>
      <Helmet>
        <title> Role: List View</title>
      </Helmet>

      <RoleListView />
    </>
  );
}
