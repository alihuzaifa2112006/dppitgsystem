import { Helmet } from 'react-helmet-async';
import TransportModeList from 'src/sections/Powertool/TransportMode/TransportMode-list';

export default function TransportModeListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Transport Modes List</title>
      </Helmet>
      <TransportModeList />
    </>
  );
}