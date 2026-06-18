import { Helmet } from 'react-helmet-async';
import { WICInviteEditView } from 'src/sections/WICInvite/view';

// ----------------------------------------------------------------------

export default function WICInviteNewPage() {
  return (
    <>
      <Helmet>
        <title> Walkin Customer: Onboard Edit View</title>
      </Helmet>

      <WICInviteEditView />
    </>
  );
}
