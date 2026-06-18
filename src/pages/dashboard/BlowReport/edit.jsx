import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import BlowReportEditView from '../../../sections/BlowReport/view/BlowReport-edit-view';




// ----------------------------------------------------------------------

export default function BlowReportEditPage() {
  const params = useParams();
  
  const urlData = { ReportID: params.ReportID };

  return (
    <>
      <Helmet>
        <title>Blowroom Report Edit</title>
      </Helmet>

      <BlowReportEditView urlData={urlData} />
    </>
  );
}
