import { Helmet } from 'react-helmet-async';
import { RTReportNewView } from 'src/sections/RTReport/view';

// ----------------------------------------------------------------------

export default function RTReportNewPage() {
  return (
    <>
      <Helmet>
        <title> Rag Tearing Production Report: Create View</title>
      </Helmet>

      <RTReportNewView />
    </>
  );
}
