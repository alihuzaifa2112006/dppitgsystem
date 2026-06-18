import { Helmet } from 'react-helmet-async';
import { StaffCategoryListView } from 'src/sections/staffCategory/view';

// ----------------------------------------------------------------------

export default function StaffCategoryListPage() {
  return (
    <>
      <Helmet>
        <title> Staff Category: List View</title>
      </Helmet>

      <StaffCategoryListView />
    </>
  );
}
