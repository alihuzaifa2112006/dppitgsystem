import { Helmet } from 'react-helmet-async';

import RTReportGridView from 'src/sections/RTReport/view/RTReport-sheet-grid-view';
// ----------------------------------------------------------------------

export default function RTReportListPage() {
  return (
    <>
      <Helmet>
        <title>Production Report: List View</title>
      </Helmet>
     

      <RTReportGridView />
    </>
  );}

