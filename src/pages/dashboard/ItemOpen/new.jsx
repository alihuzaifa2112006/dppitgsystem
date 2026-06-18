import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { ItemOpenNewView } from 'src/sections/ItemOpen/view';

// ----------------------------------------------------------------------

export default function ItemOpenNewPage() {

  return (
    <>
      <Helmet>
        <title> Item Open Add</title>
      </Helmet>

      <ItemOpenNewView />
    </>
  );
}
