import { Helmet } from 'react-helmet-async';
import { FormsListView } from 'src/sections/forms/view';



// ----------------------------------------------------------------------

export default function FormsListPage() {
  return (
    <>
      <Helmet>
        <title> Forms : List View</title>
      </Helmet>

      <FormsListView />
    </>
  );
}
