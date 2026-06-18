import { Helmet } from 'react-helmet-async';
import { OriginFactorListView } from 'src/sections/OriginFactor/view';




// ----------------------------------------------------------------------

export default function OriginFactorListPage() {
  return (
    <>
      <Helmet>
        <title> Origin Factors</title>
      </Helmet>

      <OriginFactorListView />
    </>
  );
}
