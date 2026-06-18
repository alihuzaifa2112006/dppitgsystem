import { Helmet } from 'react-helmet-async';
import { ReqMiddlewareView } from 'src/sections/ReqMiddleware/view';

// ----------------------------------------------------------------------

export default function ReqMiddleware() {
  return (
    <>
      <Helmet>
        <title> Item Type : List View</title>
      </Helmet>

      <ReqMiddlewareView />
    </>
  );
}
