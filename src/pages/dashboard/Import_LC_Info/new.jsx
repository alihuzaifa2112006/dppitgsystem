import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import {ImportLCNewView} from 'src/sections/Import_LC_Info/view';

// ----------------------------------------------------------------------

export default function ImportLCNewPage() {

  return (
    <>
      <Helmet>
        <title> Import LC Add</title>
      </Helmet>

      <ImportLCNewView />
    </>
  );
}
