import { Helmet } from 'react-helmet-async';
import { useParams } from 'src/routes/hooks';
import { ApprovalEditView } from 'src/sections/approval/view';

// ----------------------------------------------------------------------

export default function ApprovalNewPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Approval: Edit View</title>
      </Helmet>

      <ApprovalEditView urlData={params} />
    </>
  );
}
