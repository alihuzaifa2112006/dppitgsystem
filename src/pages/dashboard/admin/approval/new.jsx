import { Helmet } from 'react-helmet-async';
import { ApprovalNewView } from 'src/sections/approval/view';

// ----------------------------------------------------------------------

export default function ApprovalNewPage() {
  return (
    <>
      <Helmet>
        <title> Approval: Add View</title>
      </Helmet>

      <ApprovalNewView />
    </>
  );
}
