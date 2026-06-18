import { Helmet } from 'react-helmet-async';

import ProductionReportGridView from 'src/sections/ProductionReport/view/ProductReport-sheet-grid-view';
// ----------------------------------------------------------------------

export default function ProductionReportListPage() {
  return (
    <>
      <Helmet>
        <title>Production Report: List View</title>
      </Helmet>

      <ProductionReportGridView />
    </>
  );}

