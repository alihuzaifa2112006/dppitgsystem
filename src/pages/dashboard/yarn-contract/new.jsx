import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { YarnContractNewView } from 'src/sections/yarn-contract/view';

// ----------------------------------------------------------------------

export default function YarnContractNewPage() {

  return (
    <>
      <Helmet>
        <title> Yarn Module: Yarn Contract Add</title>
      </Helmet>

      <YarnContractNewView />
    </>
  );
}
