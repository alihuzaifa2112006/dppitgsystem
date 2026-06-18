import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { ItemOpenDatabaseListView } from 'src/sections/ItemOpenDatabase/view';
import ItemOpenDatabaseGridView from 'src/sections/ItemOpenDatabase/view/ItemOpenDatabase-sheet-grid-view';

// ----------------------------------------------------------------------

export default function ItemOpenDatabaseListPage() {
  return (
    <>
      <Helmet>
        <title> Item Open List</title>
      </Helmet>

      {/* <ItemOpenDatabaseListView /> */}
      <ItemOpenDatabaseGridView />
    </>
  );
}
