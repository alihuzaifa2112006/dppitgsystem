import { Helmet } from 'react-helmet-async';
import DocRealizationListView from '../../../sections/docRealization/view/DocRealization-main-view';



// ----------------------------------------------------------------------

export default function DocRealizationListPage() {
  return (
    <>
      <Helmet>
        <title>Document Realization: List View</title>
      </Helmet>

      <DocRealizationListView />
    </>
  );
}
