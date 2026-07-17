import { Helmet } from 'react-helmet-async';
import FactoryEditForm from 'src/sections/Powertool/Factory/Factory-edit-form';

export default function FactoryEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Edit Factory</title>
      </Helmet>
      <FactoryEditForm />
    </>
  );
}