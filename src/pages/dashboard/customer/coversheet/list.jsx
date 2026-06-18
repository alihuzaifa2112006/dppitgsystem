import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router';
import { ProfileListView } from 'src/sections/coversheet/view';

// ----------------------------------------------------------------------

export default function CoverSheetView() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title>Coversheet: List View</title>
      </Helmet>

      <ProfileListView />
    </>
  );
}
