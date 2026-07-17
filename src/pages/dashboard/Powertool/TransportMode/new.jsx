import { Helmet } from 'react-helmet-async';
import TransportModeForm from 'src/sections/Powertool/TransportMode/TransportMode-form';

export default function TransportModeNewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new TransportMode</title>
      </Helmet>
      <TransportModeForm />
    </>
  );
}