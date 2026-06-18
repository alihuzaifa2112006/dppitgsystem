import { Helmet } from 'react-helmet-async';
import { PricelistGridView, PriceListListView } from 'src/sections/priceList/view';

// ----------------------------------------------------------------------

export default function PriceListListPage() {
  return (
    <>
      <Helmet>
        <title> PriceList: List View</title>
      </Helmet>

      {/* <PriceListListView /> */}
      <PricelistGridView/>
    </>
  );
}
