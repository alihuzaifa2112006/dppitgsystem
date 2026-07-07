import { Helmet } from 'react-helmet-async';
import { RegulationsNewView } from 'src/sections/Regulations/view';

// ----------------------------------------------------------------------

export default function RegulationsNewPage() {
  return (
    <>
      <Helmet>
        <title> Regulations Create </title>
      </Helmet>

      <RegulationsNewView />
    </>
  );
}
