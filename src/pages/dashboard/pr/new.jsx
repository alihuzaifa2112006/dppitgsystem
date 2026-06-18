import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { PrNewView } from 'src/sections/pr/view';

// ----------------------------------------------------------------------

export default function PrNewPage() {

  return (
    <>
      <Helmet>
        <title> Purchase Request: Add</title>
      </Helmet>

      <PrNewView />
    </>
  );
}
