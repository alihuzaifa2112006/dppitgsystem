import { Helmet } from 'react-helmet-async';
import { CardReportNewView } from 'src/sections/CardReport/view';

// ----------------------------------------------------------------------

export default function CardReportNewPage() {
  return (
    <>
      <Helmet>
        <title> Carding Report : Create View</title>
      </Helmet>

      <CardReportNewView />
    </>
  );
}
