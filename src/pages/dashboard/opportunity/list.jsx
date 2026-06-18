import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { OpportunityListView } from 'src/sections/opportunity/view';
import OpportunityGridView from 'src/sections/opportunity/view/opportunity-sheet-grid-view';

// ----------------------------------------------------------------------

export default function OpportunityListPage() {
  return (
    <>
      <Helmet>
        <title> Opportunity View</title>
      </Helmet>

      {/* <OpportunityListView /> */}
      <OpportunityGridView />
    </>
  );
}
