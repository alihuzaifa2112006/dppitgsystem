import { Helmet } from 'react-helmet-async';
import { FormListView } from 'src/sections/form/view';

// ----------------------------------------------------------------------

export default function FormListPage() {
  return (
    <>
      <Helmet>
        <title> Form: List View</title>
      </Helmet>

      <FormListView />
    </>
  );
}
