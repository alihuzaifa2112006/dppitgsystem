import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
import CostingPlanEditView from 'src/sections/CostingPlan/view/CostingPlan-edit-view';

// ----------------------------------------------------------------------

export default function CostingPlanEditPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Material Price Edit</title>
      </Helmet>

      <CostingPlanEditView urlData={params} />
    </>
  );
}
