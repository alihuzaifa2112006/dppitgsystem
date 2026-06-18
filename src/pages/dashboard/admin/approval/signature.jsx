import { Helmet } from 'react-helmet-async';
import { ApprovalSignatureView } from 'src/sections/approval/view';

// ----------------------------------------------------------------------

export default function ApprovalSignaturePage() {
  return (
    <>
      <Helmet>
        <title> Approval: Signature List View</title>
      </Helmet>

      <ApprovalSignatureView />
    </>
  );
}
