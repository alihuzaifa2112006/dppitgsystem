import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router';

import AccountView from 'src/sections/forms/view/forms-category-edit';



// ----------------------------------------------------------------------

export default function AccountPage() {
  const params = useParams();
  return (
    <>
      <Helmet>
        <title>Form: Edit</title>
      </Helmet>

      <AccountView  urlData={params}/>
    </>
  );
}