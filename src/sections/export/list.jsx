import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { ExportListView } from 'src/sections/export/view';




// ----------------------------------------------------------------------

export default function PiListPage() {
  return (
    <>
      <Helmet>
        <title>Export LC View</title>
      </Helmet>

      {/* <PiListView /> */}
      <ExportListView />
    </>
  );
}
