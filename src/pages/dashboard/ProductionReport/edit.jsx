import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import ProductionReportEditView from 'src/sections/ProductionReport/view/ProductionReport-edit-view';



// ----------------------------------------------------------------------

export default function ProductionReportEditPage() {
  const params = useParams();
  // Only pass ReportID from path – data is loaded via API in the view, not from URL query params
  const urlData = { ReportID: params.ReportID };

  return (
    <>
      <Helmet>
        <title>Sorting Production Report  Edit</title>
      </Helmet>

      <ProductionReportEditView urlData={urlData} />
    </>
  );
}
