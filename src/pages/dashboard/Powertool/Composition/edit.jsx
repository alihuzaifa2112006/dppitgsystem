import { Helmet } from 'react-helmet-async';
import CompositionEditForm from 'src/sections/Powertool/Composition/Composition-edit-form';

export default function CompositionEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Edit Composition</title>
      </Helmet>
      <CompositionEditForm />
    </>
  );
}