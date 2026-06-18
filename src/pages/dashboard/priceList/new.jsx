import { Helmet } from 'react-helmet-async';
import { PriceListNewView } from 'src/sections/priceList/view';

// ----------------------------------------------------------------------

export default function PriceListNewPage() {
  return (
    <>
      <Helmet>
        <title> PriceList: Add View</title>
      </Helmet>

      <PriceListNewView />
    </>
  );
}
