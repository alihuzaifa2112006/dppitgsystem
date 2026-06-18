import { Helmet } from 'react-helmet-async';
import { WICNewView } from 'src/sections/wic/view';

// ----------------------------------------------------------------------

export default function WICNewPage() {
  return (
    <>
      <Helmet>
        <title> Walkin Customer: Add View</title>
      </Helmet>

      <WICNewView />
    </>
  );
}
