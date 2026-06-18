import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { AssignListView } from 'src/sections/assign/view';


// ----------------------------------------------------------------------

export default function AssignListPage() {
  return (
    <>
      <Helmet>
        <title> Assign Order</title>
      </Helmet>

      <AssignListView />
      {/* <AssignGridView /> */}
    </>
  );
}
