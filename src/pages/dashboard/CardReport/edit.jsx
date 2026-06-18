import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import CardReportEditView from 'src/sections/CardReport/view/CardReport-edit-view';





// ----------------------------------------------------------------------

export default function CardReportEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title>Card Report Edit</title>
      </Helmet>

      <CardReportEditView urlData={params} />
    </>
  );
}
