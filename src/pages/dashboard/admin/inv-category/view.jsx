import { Helmet } from 'react-helmet-async';
import { INVCategoryListView } from 'src/sections/inv-category/view';

// ----------------------------------------------------------------------

export default function INVCategoryListPage() {
  return (
    <>
      <Helmet>
        <title> Inventory Category : List View</title>
      </Helmet>

      <INVCategoryListView />
    </>
  );
}
