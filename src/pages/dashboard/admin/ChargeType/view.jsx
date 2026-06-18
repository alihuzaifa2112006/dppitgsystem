import { Helmet } from 'react-helmet-async';
import { ChargeTypeListView } from 'src/sections/ChargeType/view';




// ----------------------------------------------------------------------

export default function MachineListPage() {
  return (
    <>
      <Helmet>
        <title> Charge Type</title>
      </Helmet>

      <ChargeTypeListView />
    </>
  );
}
