import PropTypes from 'prop-types';
import Container from '@mui/material/Container';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// import PiEditForm from '../ExportInvoice-add';
import { useEffect, useMemo, useState } from 'react';
import { Get } from 'src/api/apibasemethods';
import ExportInvoiceForm from '../ExportInvoice-add';

// ----------------------------------------------------------------------

export default function ExportInvoice({ urlData }) {
  const settings = useSettingsContext();
  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);

  const [currentData, setCurrentData] = useState(null);
  // eslint-disable-next-line
  const isReapproval = urlData?.piID.split('&')[1]?.length === 10 ? true : false;

  useEffect(() => {
    const fetch = async () => {
      try {
        // Fetch main PI data
        const response = await Get(
          `getProformaInvoicesAndDetails?OrgID=${userData?.userDetails?.orgId}&BranchID=${userData?.userDetails?.branchID}&PIID=${urlData?.piID}`
        );
        
        // Fetch PI details from the new API
        const detailsResponse = await Get(
          `CommercialModule/GetPIDetailsByPIID?PIID=${urlData?.piID}`
        );

        const formatedData = {
          ...response.data.Data[0],
          PINo: response.data.Data[0]?.ApplyForReapproval ? `${response.data.Data[0]?.PINo}-R` : response.data.Data[0]?.PINo,
          PIDate: new Date(response.data.Data[0]?.PIDate),
          ValidFrom: new Date(response.data.Data[0]?.ValidFrom),
          ValidUntil: new Date(response.data.Data[0]?.ValidUntil),
          Customer: {
            WIC_ID: response.data.Data[0].WIC_ID,
            WIC_Name: response.data.Data[0].WIC_Name,
          },
          // Use the details from the new API
          Details: detailsResponse.data.Data.map((item) => ({
            PIDtlID: item.PIDtlID,
            PIID: item.PIID,
            PriceList_ID: item.PriceList_ID,
            PriceListName: item.PriceListName,
            Product_ID: item.Product_ID,
            Product_Name: item.Product_Name,
            Item_Code: item.Item_Code,
            ProductDescription: item.ProductDescription,
            UnitPrice: item.UnitPrice,
            Unit_Price: item.UnitPrice, // Keep both for compatibility
            Quantity: item.Quantity,
            ConesQty: item.ConesQty,
            Total_Amount: item.Total_Amount,
            Remarks: item.Remarks,
            DeliveryDueDate: item.DeliveryDueDate ? new Date(item.DeliveryDueDate) : null,
            IsActive: item.IsActive,
            IsDeleted: item.IsDeleted,
            CreatedBy: item.CreatedBy,
            CreatedOn: item.CreatedOn,
            UpdatedBy: item.UpdatedBy,
            UpdatedOn: item.UpdatedOn,
            Org_ID: item.Org_ID,
            Branch_ID: item.Branch_ID,
            
            // Structured data for the form
            PriceListID: {
              PriceListID: item.PriceList_ID,
              PriceListName: item.PriceListName,
            },
            Yarn_Type_ID: {
              Yarn_Type_ID: item?.YarnTypeID,
              Yarn_Type_Name: item?.Yarn_Type,
            },
            Yarn_Count_ID: {
              Yarn_Count_ID: item?.CountID,
              Yarn_Count_Name: item?.Yarn_Count_Name,
            },
            Color: {
              ColorID: item?.ColorID,
              ColorName: item?.ColorName,
            },
            Composition_ID: {
              Composition_ID: item?.CompositionID,
              Composition_Name: item?.Composition_Name,
            },
            UOM: {
              UOMID: item?.UOMID,
              UOMName: item?.UOMName,
            },
            Fabric_Type: {
              Fabric_TypeID: item?.Fabric_TypeID,
              Fabric_Type: item?.Fabric_Type,
            },
            Sustainability: {
              Sustainability_ID: item?.Sustainability_ID,
              Sustainability_Name: item?.Sustainability_Name,
            },
            Product: {
              Product_ID: item.Product_ID,
              PriceListID: item.PriceList_ID,
              Product_Name: item?.Product_Name,
              UOMName: item?.UOMName,
              UOMID: item?.UOMID,
              Price_Range_Frm: item?.Price_Range_Frm,
              Price_Range_To: item?.Price_Range_To,
              Product_Price: item?.Product_Price,
              CurrencyID: item?.Currency_ID || 1,
            },
          })),
        };
        setCurrentData(formatedData);
      } catch (error) {
        console.error('Error fetching PI data:', error);
      }
    };

    if (urlData) {
      fetch();
    }
  }, [urlData, userData?.userDetails?.orgId, userData?.userDetails?.branchID]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={` ${
          isReapproval ? `Re-open PI #${currentData?.PINo || ''}` : `Export Invoice #${currentData?.PINo || ''}`
        }`}
        links={[
          {
            name: 'Home',
            href: paths.dashboard.root,
          },
          {
            name: 'Export Invoice',
            href: paths.dashboard.Commercial.export.ExportInvoice.root,
          },
          { name: isReapproval ? 'Re-open' : 'Home' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {currentData && <ExportInvoiceForm currentData={currentData} isReapproval={isReapproval} />}
    </Container>
  );
}

ExportInvoice.propTypes = {
  urlData: PropTypes.any,
};