import { Helmet } from 'react-helmet-async';
import { AgentListView } from 'src/sections/agent/view';

// ----------------------------------------------------------------------

export default function CustomerListPage() {
  return (
    <>
      <Helmet>
        <title> Agency: List View</title>
      </Helmet>

      <AgentListView />
    </>
  );
}
