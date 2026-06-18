
import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { ComplaintRegistrationFormView } from 'src/sections/complaint-registration-form/view'; 

// ----------------------------------------------------------------------

export default function ComplaintRegistrationPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title>Complaint Registration Form</title>
      </Helmet>

      <ComplaintRegistrationFormView urlData={params} />
    </>
  );
}
