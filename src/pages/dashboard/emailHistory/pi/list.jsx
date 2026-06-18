import { Helmet } from 'react-helmet-async';
import { PiemailEmailView, PiemailListView } from 'src/sections/email/view';

// ----------------------------------------------------------------------

export default function PiListPage() {
  return (
    <>
      <Helmet>
        <title>Email History: PI List</title>
      </Helmet>

      <PiemailListView />
    </>
  );
}
