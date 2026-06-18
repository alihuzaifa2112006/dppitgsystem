import { Helmet } from 'react-helmet-async';
import { FormRoleListView } from 'src/sections/formRole/view';

// ----------------------------------------------------------------------

export default function FormRoleListPage() {
  return (
    <>
      <Helmet>
        <title> UX Journey: List View</title>
      </Helmet>

      <FormRoleListView />
    </>
  );
}
