import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { ItemRecieveNewView } from 'src/sections/ItemRecieve/view';

// ----------------------------------------------------------------------

export default function ItemRecieveNewPage() {

  return (
    <>
      <Helmet>
        <title> Item Recieve Add</title>
      </Helmet>

      <ItemRecieveNewView />
    </>
  );
}
