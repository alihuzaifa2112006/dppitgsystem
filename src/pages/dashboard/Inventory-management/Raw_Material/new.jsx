import { Helmet } from 'react-helmet-async';
import { ColorNewView } from 'src/sections/color/view';
import RMCreateForm from 'src/sections/Raw_Material/raw-new';


// ----------------------------------------------------------------------

export default function ColorNewPage() {
  return (
    <>
      <Helmet>
        <title> CYCLO Colors: Add View</title>
      </Helmet>

      <RMCreateForm />
    </>
  );
}
