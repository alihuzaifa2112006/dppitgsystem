import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { ExportNewView } from 'src/sections/export/view';


// ----------------------------------------------------------------------

export default function PiNewPage() {

  return (
    <>
      <Helmet>
        <title> Export LC Add</title>
      </Helmet>
      {/* <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Proforma Invoice Sheet</h1> */}

      <ExportNewView />
    </>
  );
}
