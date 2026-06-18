import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { QuotationListView } from 'src/sections/quotation/view';
import QuotationGridView from 'src/sections/quotation/view/quotation-sheet-grid-view';

// ----------------------------------------------------------------------

export default function QuotationListPage() {
  return (
    <>
      <Helmet>
        <title> Quotation View</title>
      </Helmet>

      {/* <QuotationListView /> */}
      <QuotationGridView />
    </>
  );
}
