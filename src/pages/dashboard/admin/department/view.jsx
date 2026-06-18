import { Helmet } from 'react-helmet-async';
import { DepartmentListView } from 'src/sections/department/view';

// ----------------------------------------------------------------------

export default function DepartmentListPage() {
  return (
    <>
      <Helmet>
        <title> Department: List View</title>
      </Helmet>

      <DepartmentListView />
    </>
  );
}
