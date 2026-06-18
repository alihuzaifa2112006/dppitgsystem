import { Helmet } from 'react-helmet-async';

import FormAdd from 'src/sections/forms/view/forms-category-add';



// ----------------------------------------------------------------------

export default function AccountPage() {
  return (
    <>
      <Helmet>
        <title>Form: Add</title>
      </Helmet>

      <FormAdd />
    </>
  );
}
