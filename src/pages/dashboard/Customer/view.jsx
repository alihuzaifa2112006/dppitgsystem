import { Helmet } from 'react-helmet-async';
import { useParams } from 'src/routes/hooks';
import CustomerDetailView from 'src/sections/Customer/view/Customer-detail-view';

export default function CustomerDetailPage() {
  const { id } = useParams();

  return (
    <>
      <Helmet>
        <title>Customer Details | Powertool</title>
      </Helmet>

      <CustomerDetailView id={id} />
    </>
  );
}
