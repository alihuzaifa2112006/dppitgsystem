import { Helmet } from 'react-helmet-async';
import MachineListView from 'src/sections/Machine/view/Machine-view';



// ----------------------------------------------------------------------

export default function MachineListPage() {
  return (
    <>
      <Helmet>
        <title> Machine</title>
      </Helmet>

      <MachineListView />
    </>
  );
}
