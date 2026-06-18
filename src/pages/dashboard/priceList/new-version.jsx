import { Helmet } from 'react-helmet-async';
import { useParams } from 'src/routes/hooks';
import { PriceListVersionView } from 'src/sections/priceList/view';


// ----------------------------------------------------------------------

export default function PriceListNewVersionPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Pricelist: new version </title>
      </Helmet>

      <PriceListVersionView urlData={params} />
    </>
  );
}
