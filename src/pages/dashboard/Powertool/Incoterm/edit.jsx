import { Helmet } from 'react-helmet-async';
import IncotermEditForm from 'src/sections/Powertool/Incoterm/Incoterm-edit-form';

export default function IncotermEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Edit Incoterm</title>
      </Helmet>
      <IncotermEditForm />
    </>
  );
}