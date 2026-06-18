import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import PrGridView from 'src/sections/pr/view/pr-sheet-grid-view';

// ----------------------------------------------------------------------

export default function PrListPage() {
  return (
    <>
      <Helmet>
        <title> Purchase Request: List</title>
      </Helmet>

      {/* <PrListView /> */}
      <PrGridView />
    </>
  );
}
