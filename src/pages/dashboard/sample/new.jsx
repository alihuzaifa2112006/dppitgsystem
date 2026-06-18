import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { SampleNewView } from 'src/sections/sample/view';

// ----------------------------------------------------------------------

export default function SampleNewPage() {

  return (
    <>
      <Helmet>
        <title> Sample Request Add</title>
      </Helmet>

      <SampleNewView />
    </>
  );
}
