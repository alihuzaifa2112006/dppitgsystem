import { Helmet } from 'react-helmet-async';
import { WICListView } from 'src/sections/wic/view';

// ----------------------------------------------------------------------

export default function WICListPage() {
  return (
    <>
      <Helmet>
        <title> Walkin Customer: List View</title>
      </Helmet>

      <WICListView />
    </>
  );
}
