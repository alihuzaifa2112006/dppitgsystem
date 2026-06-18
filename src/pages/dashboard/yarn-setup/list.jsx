import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { YarnSetupListView } from 'src/sections/yarn-setup/view';

// ----------------------------------------------------------------------

export default function YarnSetupListPage() {

  return (
    <>
      <Helmet>
        <title> Yarn Module: Yarn Setup View</title>
      </Helmet>

      <YarnSetupListView />
    </>
  );
}
