import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { PiGridView } from 'src/sections/commercial/view';


// ----------------------------------------------------------------------

export default function PiListPage() {
  return (
    <>
      <Helmet>
        <title>Export Invoice View</title>
      </Helmet>

      {/* <PiListView /> */}
      <PiGridView />
    </>
  );
}
