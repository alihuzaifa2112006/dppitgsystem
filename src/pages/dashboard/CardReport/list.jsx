import { Helmet } from 'react-helmet-async';

import CardReportGridView from 'src/sections/CardReport/view/CardReport-sheet-grid-view';
// ----------------------------------------------------------------------

export default function CardReportListPage() {
  return (
    <>
      <Helmet>
        <title> Carding Report  : List View</title>
      </Helmet>
     

      <CardReportGridView />
    </>
  );}

