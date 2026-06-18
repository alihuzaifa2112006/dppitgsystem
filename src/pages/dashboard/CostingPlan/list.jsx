import { Helmet } from 'react-helmet-async';
import { CostingPlanListView } from 'src/sections/CostingPlan/view';
import CostingPlanGridView from 'src/sections/CostingPlan/view/CostingPlan-sheet-grid-view';

// ----------------------------------------------------------------------

export default function CostingPlanListPage() {
  return (
    <>
      <Helmet>
        <title>Material Price : List View</title>
      </Helmet>

      {/* <CostingPlanListView /> */}
      <CostingPlanGridView />
    </>
  );
}
