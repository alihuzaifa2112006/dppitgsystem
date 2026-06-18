import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import PrReport from '../prReport';
import useGetAllClausesByDocTypeID from 'src/utils/getClauses';
import { Button } from '@mui/material';
import { RouterLink } from 'src/routes/components';
import Iconify from 'src/components/iconify';
import { enqueueSnackbar } from 'notistack';
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

const fetchPRData = async (userData, prID) => {
  try {
    const response = await Get(
      `getProformaInvoicesAndDetails?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&PRID=${prID}`
    );
    const res = await fetch(
      `${APP_API}GetSignatureImageByApprover?approverId=${response.data.Data[0]?.Level3_Approved_ID}`
    );

    if (!res.ok) throw new Error('Image not found');

    const arrayBuffer = await res.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const imageUrl = `data:image/png;base64,${base64}`;
    const data = {
      ...response.data.Data[0],
      SupplierSignature: imageUrl || null,
      // PRNo: response.data.Data[0]?.ApplyForReapproval
      //   ? `${response.data.Data[0]?.PRNo}-R${response.data.Data[0]?.HistoryCount}`
      //   : response.data.Data[0]?.PRNo,
    };

    return data;
    // return response.data.Data[0];
  } catch (error) {
    console.error('Error fetching PR data:', error);
    enqueueSnackbar('Failed to fetch PR data', { variant: 'error' });
    return null;
  }
};

// const formatPRData = (prData, approverData) => {
//   if (!prData) return null;

//   // Filter and get unique remarks
//   const uniqueRemarks = prData.Details.filter(
//     (item) => item?.Remarks && !['N/A', '', '-', null].includes(item.Remarks)
//   ).filter((item, index, self) => index === self.findIndex((t) => t.Remarks === item.Remarks));

//   return {
//     ...prData,
//     SellerSignature: approverData.find((x) => x.ApproverID === prData?.Level3_Approved_ID) || null,
//     PRNo: prData?.ApplyForReapproval ? `${prData?.PRNo}-R` : prData?.PRNo,
//     PRDate: new Date(prData?.PRDate),
//     ValidFrom: new Date(prData?.ValidFrom),
//     ValidUntil: new Date(prData?.ValidUntil),
//     Customer: {
//       WIC_ID: prData.WIC_ID,
//       WIC_Name: prData.WIC_Name,
//     },
//     Remarks: uniqueRemarks.map((item) => ({
//       PRDtlID: item?.PRDtlID,
//       Remarks: item?.Remarks,
//     })),
//     Details: prData.Details.map((item) => ({
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
//         CurrencyID: prData?.Currency_ID || 1,
//       },
//     })),
//   };
// };

export default function PrPDFView({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  // const getAllClauses = useGetAllClausesByDocTypeID(userData);

  // const [currentData, setCurrentData] = useState(null);
  // const [clauses, setClauses] = useState([]);
  // const [approverData, setApproverData] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);

  // const fetchAllData = useCallback(async () => {
  //   if (!urlData?.prID) return;

  //   setIsLoading(true);
  //   try {
  //     const [prClauses, rawPrData] = await Promise.all([
  //       getAllClauses(2),
  //       fetchPRData(userData, urlData.prID),
  //       // fetchApproverData(userData),
  //     ]);

  //     // setApproverData(approvers);
  //     setClauses(prClauses);
  //     setCurrentData(rawPrData);
  //   } catch (error) {
  //     console.error('Error loading data:', error);
  //     enqueueSnackbar('Failed to load data', { variant: 'error' });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [urlData?.prID, userData, getAllClauses]);

  // useEffect(() => {
  //   fetchAllData();
  // }, [fetchAllData]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="View PDF"
        links={[
          { name: 'Home', href: paths.dashboard.root },
          { name: 'Purchase Request', href: paths.dashboard.procurement.pr.root },
          { name: 'PDF' },
        ]}
        // action={
        //   <Button
        //     component={RouterLink}
        //     href={`${paths.dashboard.procurement.pr.edit(urlData?.prID)}&${generateRandomString()}`}
        //     variant="contained"
        //     startIcon={<Iconify icon="mingcute:pen-line" />}
        //     color="primary"
        //   >
        //     Re-open
        //   </Button>
        // }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* {isLoading ? (
        <div>Loading...</div> // Replace with your preferred loading indicator
      ) : (
        currentData &&  */}
      <PrReport PRRequestID={urlData.prID} />
      {/* )} */}
    </Container>
  );
}

PrPDFView.propTypes = {
  urlData: PropTypes.shape({
    prID: PropTypes.string,
  }),
};
