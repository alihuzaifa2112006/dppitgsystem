import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { ItemRecieveListView } from 'src/sections/ItemRecieve/view';
import ItemRecieveGridView from 'src/sections/ItemRecieve/view/ItemRecieve-sheet-grid-view';

// ----------------------------------------------------------------------

export default function ItemRecieveListPage() {
  return (
    <>
      <Helmet>
        <title> Item Recieve List</title>
      </Helmet>

      {/* <ItemRecieveListView /> */}
      <ItemRecieveGridView />
    </>
  );
}
