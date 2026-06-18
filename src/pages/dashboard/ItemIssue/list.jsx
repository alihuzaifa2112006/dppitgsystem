import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { ItemIssueGridView } from 'src/sections/ItemIssue/view';

// ----------------------------------------------------------------------

export default function ItemIssueListPage() {
  return (
    <>
      <Helmet>
        <title> Item Issue List</title>
      </Helmet>

      {/* <ItemIssueListView /> */}
      <ItemIssueGridView />
    </>
  );
}
