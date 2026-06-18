import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { DispoderNewView } from 'src/sections/dispoder/view';

// ----------------------------------------------------------------------

export default function DispoderNewPage() {

  return (
    <>
      <Helmet>
        <title> Dispoder Add</title>
      </Helmet>

      <DispoderNewView />
    </>
  );
}
