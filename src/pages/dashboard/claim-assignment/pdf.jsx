import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import { decrypt } from 'src/api/encryption';
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
// import { PiPDFView } from 'src/sections/pi/view';
import ClaimPDFView from 'src/sections/claim-assignment/view/claim-pdf-view';


    
// ----------------------------------------------------------------------

export default function ClaimPdfPage() {
  const params = useParams();

    // console.log("check karo ya pdf ki file hai ")

  return (
    <>
      <Helmet>
        <title> PI: View PDF</title>
      </Helmet>

 
        <ClaimPDFView  urlData={params}/>
      {/* <PiPDFView urlData={params} /> */}
    </>
  );
}
