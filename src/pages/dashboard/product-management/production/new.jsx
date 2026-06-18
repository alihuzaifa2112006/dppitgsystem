import { Helmet } from 'react-helmet-async';
import { ProductionAddView } from 'src/sections/production/view';



// ----------------------------------------------------------------------

export default function AccountPage() {
  return (
    <>
      <Helmet>
        <title>Production: Add</title>
      </Helmet>

      <ProductionAddView />
    </>
  );
}
