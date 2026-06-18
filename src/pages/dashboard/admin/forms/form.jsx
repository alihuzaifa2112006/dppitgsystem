import { Helmet } from 'react-helmet-async';


import FormAddMaster from 'src/sections/forms/view/forms-master-add';



// ----------------------------------------------------------------------

export default function AccountPage() {
  return (
    <>
      <Helmet>
        <title>Form: Add</title>
      </Helmet>

      <FormAddMaster />
    </>
  );
}
