import { Helmet } from 'react-helmet-async';
import { BudgetListView } from 'src/sections/budget/view';


// ----------------------------------------------------------------------

export default function BudgetListPage() {
  return (
    <>
      <Helmet>
        <title> Budget</title>
      </Helmet>

      <BudgetListView />
    </>
  );
}
