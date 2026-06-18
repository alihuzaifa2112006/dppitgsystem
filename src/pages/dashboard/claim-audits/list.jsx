import { Helmet } from 'react-helmet-async';
import { ClaimAuditsListView } from 'src/sections/claim-audits/view';

// ----------------------------------------------------------------------

export default function ClaimAuditsListPage() {
  return (
    <>
      <Helmet>
        <title> Claim Audits: List View</title>
      </Helmet>

      <ClaimAuditsListView/>
    </>
  );
}
