import { Helmet } from 'react-helmet-async';
import CompositionForm from 'src/sections/Powertool/Composition/Composition-form';

export default function CompositionNewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new Composition</title>
      </Helmet>
      <CompositionForm />
    </>
  );
}