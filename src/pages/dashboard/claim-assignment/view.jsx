import { Helmet } from 'react-helmet-async';
import { ClaimAssignmentListView } from 'src/sections/claim-assignment/view';

// ----------------------------------------------------------------------

export default function ClaimAssignmentListPage() {
  return (
    <>
      <Helmet>
        <title> Claim Monitor</title>
      </Helmet>

      <ClaimAssignmentListView />
    </>
  );
}
