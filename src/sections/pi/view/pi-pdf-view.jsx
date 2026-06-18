import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import PiEditForm from '../pi-revision';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import PiReport from '../piReport';
import useGetAllClausesByDocTypeID from 'src/utils/getClauses';
import { Button } from '@mui/material';
import { RouterLink } from 'src/routes/components';
import Iconify from 'src/components/iconify';
import { enqueueSnackbar } from 'notistack';
import { convertUSDtoBDT } from 'src/utils/BDTtoUSD';
import { APP_API } from 'src/config-global';

// ----------------------------------------------------------------------

const generateRandomString = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join('');
};

const fetchApproverData = async (userData) => {
  try {
    const response = await Get(
      `GetApproverEsignatureSetup?orgId=${userData?.userDetails?.orgId}&branchId=${userData?.userDetails?.branchID}`
    );
    return response.data.map((item) => ({
      ...item,
      ApproverNickName: item?.Username || '-',
      hasSignature: !!item.EsignaturePath,
    }));
  } catch (error) {
    console.error('Error fetching approval data:', error);
    enqueueSnackbar('Failed to fetch approval data', { variant: 'error' });
    return [];
  }
};

const fetchPIData = async (userData, piID) => {
  try {
    const response = await Get(
      `getProformaInvoicesAndDetails?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&PIID=${piID}`
    );
    let imageUrl = null;
    if (response.data.Data[0]?.Level3_Approved_ID) {
      const res = await fetch(
        `${APP_API}GetSignatureImageByApprover?approverId=${response.data.Data[0]?.Level3_Approved_ID}`
      );

      if (!res.ok) throw new Error('Image not found');

      const arrayBuffer = await res.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      imageUrl = `data:image/png;base64,${base64}`;
    }
    const data = {
      ...response.data.Data[0],
      Details: response.data.Data[0]?.Details.map((item, index) => ({
        ...item,
        indexID: index + 1,
      })),
      SupplierSignature: imageUrl || null,
      // PINo: response.data.Data[0]?.ApplyForReapproval
      //   ? `${response.data.Data[0]?.PINo}-R${response.data.Data[0]?.HistoryCount}`
      //   : response.data.Data[0]?.PINo,
    };

    return data;
    // return response.data.Data[0];
  } catch (error) {
    console.error('Error fetching PI data:', error);
    enqueueSnackbar('Failed to fetch PI data', { variant: 'error' });
    return null;
  }
};

// const formatPIData = (piData, approverData) => {
//   if (!piData) return null;

//   // Filter and get unique remarks
//   const uniqueRemarks = piData.Details.filter(
//     (item) => item?.Remarks && !['N/A', '', '-', null].includes(item.Remarks)
//   ).filter((item, index, self) => index === self.findIndex((t) => t.Remarks === item.Remarks));

//   return {
//     ...piData,
//     SellerSignature: approverData.find((x) => x.ApproverID === piData?.Level3_Approved_ID) || null,
//     PINo: piData?.ApplyForReapproval ? `${piData?.PINo}-R` : piData?.PINo,
//     PIDate: new Date(piData?.PIDate),
//     ValidFrom: new Date(piData?.ValidFrom),
//     ValidUntil: new Date(piData?.ValidUntil),
//     Customer: {
//       WIC_ID: piData.WIC_ID,
//       WIC_Name: piData.WIC_Name,
//     },
//     Remarks: uniqueRemarks.map((item) => ({
//       PIDtlID: item?.PIDtlID,
//       Remarks: item?.Remarks,
//     })),
//     Details: piData.Details.map((item) => ({
//       ...item,
//       Unit_Price: item.UnitPrice,
//       PriceListID: {
//         PriceListID: item.PriceList_ID,
//         PriceListName: item.PriceListName,
//       },
//       Fabric_Type: {
//         Fabric_TypeID: item?.Fabric_TypeID,
//         Fabric_Type: item?.Fabric_Type,
//       },
//       Sustainability: {
//         Sustainability_ID: item?.Sustainability_ID,
//         Sustainability_Name: item?.Sustainability_Name,
//       },
//       Product: {
//         Product_ID: item.Product_ID,
//         Product_Name: item?.Product_Name,
//         UOMName: item?.UOMName,
//         CurrencyID: piData?.Currency_ID || 1,
//       },
//     })),
//   };
// };

export default function PiPDFView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const getAllClauses = useGetAllClausesByDocTypeID(userData);

  const [currentData, setCurrentData] = useState(null);
  const [clauses, setClauses] = useState([]);
  const [approverData, setApproverData] = useState([]);
  const [conversionRate, setConversionRate] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!urlData?.piID) return;

    setIsLoading(true);
    try {
      const [piClauses, rawPiData, rate] = await Promise.all([
        getAllClauses(2),
        fetchPIData(userData, urlData.piID),
        convertUSDtoBDT(1),
        // fetchApproverData(userData),
      ]);

      // setApproverData(approvers);
      setClauses(piClauses);
      setCurrentData(rawPiData);
      setConversionRate(rate || 0);
    } catch (error) {
      console.error('Error loading data:', error);
      enqueueSnackbar('Failed to load data', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [urlData?.piID, userData, getAllClauses]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="View PDF"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Proforma Invoice', href: paths.dashboard.transaction.pi.root },
          { name: 'PDF' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={`${paths.dashboard.transaction.pi.edit(urlData?.piID)}&${generateRandomString()}`}
            variant="contained"
            startIcon={<Iconify icon="mingcute:pen-line" />}
            color="primary"
          >
            Re-open
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading ? (
        <div>Loading...</div> // Replace with your preferred loading indicator
      ) : (
        currentData && (
          <PiReport
            currentData={currentData}
            clauses={clauses}
            conversionRate={conversionRate}
          />
        )
      )}
    </Container>
  );
}

PiPDFView.propTypes = {
  urlData: PropTypes.shape({
    piID: PropTypes.string,
  }),
};
