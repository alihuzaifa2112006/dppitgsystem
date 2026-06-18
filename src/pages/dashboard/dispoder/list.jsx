import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { DispoderListView } from 'src/sections/dispoder/view';
import DispoderGridView from 'src/sections/dispoder/view/dispoder-sheet-grid-view';

// ----------------------------------------------------------------------

export default function DispoderListPage() {
  return (
    <>
      <Helmet>
        <title> Dispatch Order</title>
      </Helmet>

      {/* <DispoderListView /> */}
      <DispoderGridView />
    </>
  );
}
