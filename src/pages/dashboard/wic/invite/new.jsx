import { Helmet } from 'react-helmet-async';
import { WICInviteNewView } from 'src/sections/WICInvite/view';

// ----------------------------------------------------------------------

export default function WICInviteNewPage() {
  return (
    <>
      <Helmet>
        <title> Walkin Customer: Onboard Add View</title>
      </Helmet>

      <WICInviteNewView />
    </>
  );
}
