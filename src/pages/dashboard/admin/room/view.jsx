import { Helmet } from 'react-helmet-async';
import { RoomListView } from 'src/sections/room/view';

// ----------------------------------------------------------------------

export default function RoomListPage() {
  return (
    <>
      <Helmet>
        <title> Storage Location: List View</title>
      </Helmet>

      <RoomListView />
    </>
  );
}
