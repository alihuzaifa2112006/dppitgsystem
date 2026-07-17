import { Helmet } from 'react-helmet-async';
import FactoryForm from 'src/sections/Powertool/Factory/Factory-form';

export default function FactoryNewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new Factory</title>
      </Helmet>
      <FactoryForm />
    </>
  );
}