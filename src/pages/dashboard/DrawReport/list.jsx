import { Helmet } from 'react-helmet-async';

import DrawReportGridView from 'src/sections/DrawReport/view/DrawReport-sheet-grid-view';
// ----------------------------------------------------------------------

export default function DrawReportListPage() {
  return (
    <>
      <Helmet>
        <title> Production Report (Drawing Report): List View</title>
      </Helmet>
     

      <DrawReportGridView />
    </>
  );}

