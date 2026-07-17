import { Helmet } from 'react-helmet-async';
import OfficeForm from 'src/sections/Powertool/Office/Office-form';

export default function OfficeNewPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new Office</title>
      </Helmet>
      <OfficeForm />
    </>
  );
}