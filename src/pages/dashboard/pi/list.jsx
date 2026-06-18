import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { PiListView } from 'src/sections/pi/view';
import PiGridView from 'src/sections/pi/view/pi-sheet-grid-view';

// ----------------------------------------------------------------------

export default function PiListPage() {
  return (
    <>
      <Helmet>
        <title> PI View</title>
      </Helmet>

      {/* <PiListView /> */}
      <PiGridView />
    </>
  );
}
