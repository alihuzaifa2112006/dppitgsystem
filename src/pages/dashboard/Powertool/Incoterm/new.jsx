import { Helmet } from 'react-helmet-async';
import IncotermForm from 'src/sections/Powertool/Incoterm/Incoterm-form';

export default function IncotermNewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new Incoterm</title>
      </Helmet>
      <IncotermForm />
    </>
  );
}