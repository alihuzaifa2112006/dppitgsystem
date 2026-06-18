import { Helmet } from 'react-helmet-async';

import BlowReportGridView from 'src/sections/BlowReport/view/BlowReport-sheet-grid-view';
// ----------------------------------------------------------------------

export default function BlowReportListPage() {
  return (
    <>
      <Helmet>
        <title> Production Report (Blow Room): List View</title>
      </Helmet>
     

      <BlowReportGridView />
    </>
  );}

