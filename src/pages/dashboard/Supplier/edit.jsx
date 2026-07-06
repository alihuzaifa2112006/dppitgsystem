import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import SupplierEditView from '../../../sections/Supplier/view/Supplier-edit-view';




// ----------------------------------------------------------------------

export default function SupplierEditPage() {
  const params = useParams();

  const urlData = { ReportID: params.ReportID };

  return (
    <>
      <Helmet>
        <title>Supply Chain Network Onboard Edit</title>
      </Helmet>

      <SupplierEditView urlData={urlData} />
    </>
  );
}
