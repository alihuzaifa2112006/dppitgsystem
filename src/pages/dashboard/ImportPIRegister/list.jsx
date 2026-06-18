import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { PIRegisterGridView } from 'src/sections/PIRegister/view';

// ----------------------------------------------------------------------

export default function PIRegisterListPage() {
  return (
    <>
      <Helmet>
        <title> Import PI Register View</title>
      </Helmet>

      {/* <PIRegisterListView /> */}
      <PIRegisterGridView />
    </>
  );
}
