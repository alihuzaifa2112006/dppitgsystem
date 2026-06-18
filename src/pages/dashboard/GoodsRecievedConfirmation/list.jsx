import { Helmet } from 'react-helmet-async';
import { GoodsRecievedConfirmationListView } from 'src/sections/GoodsRecievedConfirmation/view';
import GoodsRecievedConfirmationGridView from 'src/sections/GoodsRecievedConfirmation/view/GoodsRecievedConfirmation-sheet-grid-view';
// ----------------------------------------------------------------------

export default function GoodsRecievedConfirmationListPage() {
  return (
    <>
      <Helmet>
        <title>Goods Recieved Confirmation : List View</title>
      </Helmet>

      {/* <GoodsRecievedConfirmationListView /> */}
      <GoodsRecievedConfirmationGridView />
    </>
  );
}
