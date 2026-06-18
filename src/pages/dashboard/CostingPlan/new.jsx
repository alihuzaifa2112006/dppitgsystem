import { Helmet } from 'react-helmet-async';
import { CostingPlanNewView } from 'src/sections/CostingPlan/view';


// ----------------------------------------------------------------------

export default function CostingPlanNewPage() {
  return (
    <>
      <Helmet>
        <title> Material Price : Create View</title>
      </Helmet>

      <CostingPlanNewView />
         
    </>
  );
}
