import { Helmet } from 'react-helmet-async';
import MCheckListReportNewView from 'src/sections/maintenance/MChecklist/view/MCheckList-new-view';



// ----------------------------------------------------------------------

export default function MCheckListNewPage() {
  return (
    <>
      <Helmet>
        <title> Maintenance Checklist : Create View</title>
      </Helmet>

      <MCheckListReportNewView />
    </>
  );
}
