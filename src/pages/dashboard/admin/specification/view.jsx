import { Helmet } from 'react-helmet-async';
import { SpecificationListView } from 'src/sections/specification/view';


// ----------------------------------------------------------------------

export default function SpecificationListPage() {
  return (
    <>
      <Helmet>
        <title> Specification</title>
      </Helmet>

      <SpecificationListView />
    </>
  );
}
