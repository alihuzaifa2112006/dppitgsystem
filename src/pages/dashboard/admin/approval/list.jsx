import { Helmet } from 'react-helmet-async';
import { ApprovalListView } from 'src/sections/approval/view';

// ----------------------------------------------------------------------

export default function ApprovalListPage() {
  return (
    <>
      <Helmet>
        <title> Approval: List View</title>
      </Helmet>

      <ApprovalListView />
    </>
  );
}
