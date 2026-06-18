import { Helmet } from 'react-helmet-async';
import { ComplianceListView } from 'src/sections/compliance/view';

// ----------------------------------------------------------------------

export default function ComplianceListPage() {
  return (
    <>
      <Helmet>
        <title> Compliance Status: List View</title>
      </Helmet>

      <ComplianceListView />
    </>
  );
}
