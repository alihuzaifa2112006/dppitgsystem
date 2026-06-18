import { Helmet } from 'react-helmet-async';
import { DrawReportNewView } from 'src/sections/DrawReport/view';

// ----------------------------------------------------------------------

export default function DrawReportNewPage() {
  return (
    <>
      <Helmet>
        <title> Production Report (Drawing Report): Create View</title>
      </Helmet>

      <DrawReportNewView />
    </>
  );
}
