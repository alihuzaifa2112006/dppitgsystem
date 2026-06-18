import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { ItemRequisitionListView } from 'src/sections/ItemRequisition/view';
import ItemRequisitionGridView from 'src/sections/ItemRequisition/view/ItemRequisition-sheet-grid-view';

// ----------------------------------------------------------------------

export default function ItemRequisitionListPage() {
  return (
    <>
      <Helmet>
        <title> ItemRequisition List</title>
      </Helmet>

      <ItemRequisitionListView />
 
    </>
  );
}
