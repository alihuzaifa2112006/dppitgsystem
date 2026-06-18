import { Helmet } from 'react-helmet-async';
import { BlowReportNewView } from 'src/sections/BlowReport/view';

// ----------------------------------------------------------------------

export default function BlowReportNewPage() {
  return (
    <>
      <Helmet>
        <title> Production Report (Blow Room): Create View</title>
      </Helmet>

      <BlowReportNewView />
    </>
  );
}
