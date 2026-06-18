import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { PiNewView } from 'src/sections/pi/view';

// ----------------------------------------------------------------------

export default function PiNewPage() {

  return (
    <>
      <Helmet>
        <title> PI Add</title>
      </Helmet>

      <PiNewView />
    </>
  );
}
