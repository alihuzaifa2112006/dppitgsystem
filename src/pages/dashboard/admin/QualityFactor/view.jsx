import { Helmet } from 'react-helmet-async';
import { QualityFactorListView } from 'src/sections/QualityFactor/view';




// ----------------------------------------------------------------------

export default function QualityFactorListPage() {
  return (
    <>
      <Helmet>
        <title> Quality Factors</title>
      </Helmet>

      <QualityFactorListView />
    </>
  );
}
