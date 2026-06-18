import { Helmet } from 'react-helmet-async';
import { WICInviteListView } from 'src/sections/WICInvite/view';

// ----------------------------------------------------------------------

export default function WICInviteListPage() {
  return (
    <>
      <Helmet>
        <title> Walkin Customer: Onboard List View</title>
      </Helmet>

      <WICInviteListView />
    </>
  );
}
