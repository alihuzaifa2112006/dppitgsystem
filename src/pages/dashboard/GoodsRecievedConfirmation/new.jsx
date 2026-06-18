import { Helmet } from 'react-helmet-async';
import { GoodsRecievedConfirmationNewView } from 'src/sections/GoodsRecievedConfirmation/view';

// ----------------------------------------------------------------------

export default function GoodsRecievedConfirmationNewPage() {
  return (
    <>
      <Helmet>
        <title>Goods Recieved Confirmation : Create View</title>
      </Helmet>

      <GoodsRecievedConfirmationNewView />
    </>
  );
}
