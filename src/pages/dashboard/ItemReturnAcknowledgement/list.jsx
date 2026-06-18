import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { ItemReturnAcknowledgementGridView } from 'src/sections/ItemReturnAcknowledgement/view';

// ----------------------------------------------------------------------

export default function ItemReturnAcknowledgementListPage() {
  return (
    <>
      <Helmet>
        <title> Stock Acknowledgement List</title>
      </Helmet>

      {/* <ItemReturnAcknowledgementListView /> */}
      <ItemReturnAcknowledgementGridView />
    </>
  );
}
