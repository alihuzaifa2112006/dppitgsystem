import { Helmet } from 'react-helmet-async';
import { StockReportGridView } from 'src/sections/StockReport/view';
// ----------------------------------------------------------------------

export default function StockReportListPage() {
  return (
    <>
      <Helmet>
        <title>Stock Report: Grid View</title>
      </Helmet>

      <StockReportGridView />
    </>
  );
}
