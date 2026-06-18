import { Helmet } from 'react-helmet-async';
import { AccountAddView } from 'src/sections/profile/view';


// ----------------------------------------------------------------------

export default function AccountPage() {
  return (
    <>
      <Helmet>
        <title>Customer Profile: Add</title>
      </Helmet>

      <AccountAddView />
    </>
  );
}
