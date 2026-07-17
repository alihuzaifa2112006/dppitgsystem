import { Helmet } from 'react-helmet-async';
import TransactionTypeList from 'src/sections/Powertool/TransactionType/TransactionType-list';

export default function TransactionTypeListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Transaction Types List</title>
      </Helmet>
      <TransactionTypeList />
    </>
  );
}