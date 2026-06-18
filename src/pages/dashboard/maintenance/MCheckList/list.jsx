import { Helmet } from 'react-helmet-async';

import MCheckListGridView from 'src/sections/maintenance/MChecklist/view/MCheckList-sheet-grid-view';
// ----------------------------------------------------------------------

export default function MCheckListListPage() {
  return (
    <>
      <Helmet>
        <title> Maintenance Checklist: List View</title>
      </Helmet>

      <MCheckListGridView />
    </>
  );}

