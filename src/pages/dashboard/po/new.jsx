import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { PoNewView } from 'src/sections/po/view';

// ----------------------------------------------------------------------

export default function PoNewPage() {

  return (
    <>
      <Helmet>
        <title> Purchase Order: Add</title>
      </Helmet>

      <PoNewView />
    </>
  );
}
