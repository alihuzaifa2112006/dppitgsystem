import { Helmet } from 'react-helmet-async';
import OpeningBankListView from 'src/sections/OpeningBank/view/OpeningBank-view';



// ----------------------------------------------------------------------

export default function OpeningBankListPage() {
  return (
    <>
      <Helmet>
        <title> OpeningBank: List View</title>
      </Helmet>

      <OpeningBankListView />
    </>
  );
}
