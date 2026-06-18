import { Helmet } from 'react-helmet-async';
import { useParams } from 'src/routes/hooks';
import { PriceListEditView } from 'src/sections/priceList/view';

// ----------------------------------------------------------------------

export default function PriceListNewPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> PriceList: Edit View</title>
      </Helmet>

      <PriceListEditView urlData={params} />
    </>
  );
}
