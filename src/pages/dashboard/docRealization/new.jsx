import { Helmet } from 'react-helmet-async';
import DocRealizationAddView from '../../../sections/docRealization/view/DocRealization-add-view';




// ----------------------------------------------------------------------

export default function DocRealizationAddPage() {
  return (
    <>
      <Helmet>
        <title>Document Realization: Add</title>
      </Helmet>

      <DocRealizationAddView />
    </>
  );
}
