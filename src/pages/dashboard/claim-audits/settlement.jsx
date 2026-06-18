import { Helmet } from 'react-helmet-async';
import { useParams } from 'src/routes/hooks';
import { ClaimSettlementView } from 'src/sections/claim-audits/view';

// ----------------------------------------------------------------------

export default function ClaimSettlementPage() {
    const params = useParams();

    return (
        <>
            <Helmet>
                <title> Claim Audits: Settlement View</title>
            </Helmet>

            <ClaimSettlementView urlData={params} />
        </>
    );
}
