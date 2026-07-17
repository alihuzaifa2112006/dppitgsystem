import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import CustomerEditView from 'src/sections/Customer/Customer-edit-view';

export default function CustomerEditPage() {
  const params = useParams();
  const { id } = params;

  return (
    <>
      <Helmet>
        <title>Edit Customer | Powertool</title>
      </Helmet>

      <CustomerEditView id={id} />
    </>
  );
}
