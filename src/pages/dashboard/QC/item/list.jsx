import { Helmet } from 'react-helmet-async';
import { QCGridView } from 'src/sections/QC/view';

// ----------------------------------------------------------------------

export default function ItemQCListPage() {
  return (
    <>
      <Helmet>
        <title> QC Item: List View</title>
      </Helmet>

      <QCGridView />
    </>
  );
}
