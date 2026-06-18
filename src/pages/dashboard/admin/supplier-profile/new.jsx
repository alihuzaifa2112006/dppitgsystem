import { Helmet } from 'react-helmet-async';
import { AccountAddView } from 'src/sections/supplier_profile/view';
// import { AccountAddView } from 'src/sections/profile/view';


// ----------------------------------------------------------------------

export default function AccountPage() {
  return (
    <>
      <Helmet>
        <title>Supplier Profile: Add</title>
      </Helmet>

      <AccountAddView />
    </>
  );
}
