import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { ItemOpenListView } from 'src/sections/ItemOpen/view';
import ItemOpenGridView from 'src/sections/ItemOpen/view/ItemOpen-sheet-grid-view';

// ----------------------------------------------------------------------

export default function ItemOpenListPage() {
  return (
    <>
      <Helmet>
        <title> Item Open List</title>
      </Helmet>

      {/* <ItemOpenListView /> */}
      <ItemOpenGridView />
    </>
  );
}
