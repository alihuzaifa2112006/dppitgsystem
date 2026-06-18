import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { ItemOpenDatabaseNewView } from 'src/sections/ItemOpenDatabase/view';

// ----------------------------------------------------------------------

export default function ItemOpenDatabaseNewPage() {

  return (
    <>
      <Helmet>
        <title> Item Open Add</title>
      </Helmet>

      <ItemOpenDatabaseNewView />
    </>
  );
}
