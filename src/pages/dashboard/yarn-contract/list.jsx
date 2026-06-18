import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { YarnContractListView } from 'src/sections/yarn-contract/view';

// ----------------------------------------------------------------------

export default function YarnContractListPage() {

  return (
    <>
      <Helmet>
        <title> Yarn Module: Yarn Contract View</title>
      </Helmet>

      <YarnContractListView />
    </>
  );
}
