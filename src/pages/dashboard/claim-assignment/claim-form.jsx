import { Helmet } from 'react-helmet-async';
import { WICListView } from 'src/sections/claimForm/view';

// ----------------------------------------------------------------------

export default function ClaimAssignmentListPage() {
  return (
    <>
      <Helmet>
        <title> Claim Form</title>
      </Helmet>

      <WICListView />
    </>
  );
}
