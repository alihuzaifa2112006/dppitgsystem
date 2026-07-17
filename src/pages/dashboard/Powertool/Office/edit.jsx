import { Helmet } from 'react-helmet-async';
import OfficeEditForm from 'src/sections/Powertool/Office/Office-edit-form';

export default function OfficeEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Edit Office</title>
      </Helmet>
      <OfficeEditForm />
    </>
  );
}