import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { SampleListView } from 'src/sections/sample/view';
import SampleGridView from 'src/sections/sample/view/sample-sheet-grid-view';

// ----------------------------------------------------------------------

export default function SampleListPage() {
  return (
    <>
      <Helmet>
        <title> Sample Request View</title>
      </Helmet>

      {/* <SampleListView /> */}
      <SampleGridView />
    </>
  );
}
