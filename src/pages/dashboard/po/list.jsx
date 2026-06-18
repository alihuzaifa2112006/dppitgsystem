import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import PoGridView from 'src/sections/po/view/po-sheet-grid-view';

// ----------------------------------------------------------------------

export default function PoListPage() {
  return (
    <>
      <Helmet>
        <title> Purchase Order: List</title>
      </Helmet>

      {/* <PoListView /> */}
      <PoGridView />
    </>
  );
}
