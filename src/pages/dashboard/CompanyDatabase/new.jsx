import { Helmet } from 'react-helmet-async';

import CompanyDatabaseCreateForm from 'src/sections/CompanyDatabase/CompanyDatabase-new';

// ----------------------------------------------------------------------

export default function CompanyDatabaseNewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create Company Profile</title>
      </Helmet>

      <CompanyDatabaseCreateForm />
    </>
  );
}
