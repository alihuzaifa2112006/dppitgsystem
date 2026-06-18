import { Helmet } from 'react-helmet-async';
import { ProductionReportNewView } from 'src/sections/ProductionReport/view';

// ----------------------------------------------------------------------

export default function ProductionReportNewPage() {
  return (
    <>
      <Helmet>
        <title> Production Report: Create View</title>
      </Helmet>

      <ProductionReportNewView />
    </>
  );
}
