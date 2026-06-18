import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { QuotationNewView } from 'src/sections/quotation/view';

// ----------------------------------------------------------------------

export default function QuotationNewPage() {

  return (
    <>
      <Helmet>
        <title> Quotation Add</title>
      </Helmet>

      <QuotationNewView />
    </>
  );
}
