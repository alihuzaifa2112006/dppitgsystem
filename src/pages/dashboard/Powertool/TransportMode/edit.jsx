import { Helmet } from 'react-helmet-async';
import TransportModeEditForm from 'src/sections/Powertool/TransportMode/TransportMode-edit-form';

export default function TransportModeEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Edit TransportMode</title>
      </Helmet>
      <TransportModeEditForm />
    </>
  );
}