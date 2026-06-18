import { Helmet } from 'react-helmet-async';
import { ColorWiseStockReportGridView } from 'src/sections/ColorWiseStockReport/view';
// ----------------------------------------------------------------------

export default function ColorWiseStockReportListPage() {
  return (
    <>
      <Helmet>
        <title>Color Wise Stock Report: Grid View</title>
      </Helmet>

      <ColorWiseStockReportGridView />
    </>
  );
}
