import { useState, useEffect, useCallback, useMemo } from 'react';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { Typography } from '@mui/material';

import { useMockedUser } from 'src/hooks/use-mocked-user';

import { SeoIllustration } from 'src/assets/illustrations';
import { _appAuthors, _appRelated, _appFeatured, _appInvoices, _appInstalled } from 'src/_mock';
import { LoadingScreen } from 'src/components/loading-screen';
import { useSettingsContext } from 'src/components/settings';
import { decrypt } from 'src/api/encryption';
import { Get } from 'src/api/apibasemethods';
import { countries } from 'src/assets/data';

import AppWidget from '../app-widget';
import AppWelcome from '../app-welcome';
import AppFeatured from '../app-featured';
import AppNewInspections from '../app-new-inspections';
import AppTopAuthors from '../app-top-authors';
import InspectionPerformance from '../inspection-performance';
import AppWidgetSummary from '../app-widget-summary';
import AppTotalSuppliersRegistered from '../app-total-suppliers';
import AppTopCustomerCountries from '../app-top-customer-countries';
import AnalyticsWidgetSummary from '../anylatics-widget';
import axios from 'axios';
import InspectionPerformanceBar from '../inspection-performance-bar';
import InspectionPerformanceKSP from '../inspection-performance-ksp';
import { fNumber } from 'src/utils/format-number';
import { Box } from '@mui/system';

function getSalesDataByKSP(data) {
  const allYearsSet = new Set();
  const allBuyersSet = new Set();

  // Collect all years and buyer names safely
  data.forEach((entry) => {
    allBuyersSet.add(entry.year);

    entry.ordered?.forEach((item) => allYearsSet.add(item.x));
    entry.delivered?.forEach((item) => allYearsSet.add(item.x));
  });

  const years = Array.from(allYearsSet).sort(); // Sorted years
  const buyers = Array.from(allBuyersSet);

  const yearIndexMap = years.reduce((map, year, index) => {
    map[year] = index;
    return map;
  }, {});

  const series = buyers.map((buyer) => {
    const buyerData = data.find((entry) => entry.year === buyer);

    const orderedData = new Array(years.length).fill(0);
    const deliveredData = new Array(years.length).fill(0);

    buyerData?.ordered?.forEach((item) => {
      const idx = yearIndexMap[item.x];
      if (idx !== undefined) {
        orderedData[idx] = item.y;
      }
    });

    buyerData?.delivered?.forEach((item) => {
      const idx = yearIndexMap[item.x];
      if (idx !== undefined) {
        deliveredData[idx] = item.y;
      }
    });

    return {
      year: buyer,
      data: [
        { name: 'Ordered', data: orderedData },
        { name: 'Delivered', data: deliveredData },
      ],
    };
  });

  return {
    categories: years,
    series,
  };
}

const processSalesData = (rawData) => {
  // Extract all unique years and salespersons
  const years = [...new Set(rawData.map((item) => new Date(item.SalesYear).getFullYear()))].sort();
  const salesPersons = [...new Set(rawData.map((item) => item.KeySalesPerson))];

  // Create series data for each salesperson
  const series = salesPersons.map((salesPerson) => {
    // Create ordered and delivered quantity data for each year
    const orderedData = years.map((year) => {
      const yearData = rawData.find(
        (item) =>
          new Date(item.SalesYear).getFullYear() === year && item.KeySalesPerson === salesPerson
      );
      return yearData ? `${fNumber(yearData.TotalOrderQty_KG)} KG` : 0;
    });

    const deliveredData = years.map((year) => {
      const yearData = rawData.find(
        (item) =>
          new Date(item.SalesYear).getFullYear() === year && item.KeySalesPerson === salesPerson
      );
      return yearData ? fNumber(yearData.TotalDeliveredQty) : 0;
    });

    return {
      year: salesPerson, // Using salesPerson as the "year" identifier
      data: [
        {
          name: 'Ordered Quantity',
          data: orderedData,
        },
        {
          name: 'Delivered Quantity',
          data: deliveredData,
        },
      ],
    };
  });

  return {
    categories: years.map(String), // Convert years to strings for categories
    series,
  };
};
// ----------------------------------------------------------------------

export default function OverviewAppView() {
  const { user } = useMockedUser();

  const theme = useTheme();

  const settings = useSettingsContext();

  const userData = useMemo(() => JSON.parse(localStorage.getItem('UserData')), []);
  const userRoles = userData?.userDetails?.roles || [];
  const HRRoles = [1, 2, 3, 4];
  const hasRole = (rolesToCheck) => rolesToCheck.some((role) => userRoles.includes(role));
  const currentYear = new Date().getFullYear();

  const [selectedPerson, setSelectedPerson] = useState('Alnoor');

  // States
  const [suppliersData, setSuppliersData] = useState([]);
  const [citySet, setCitySet] = useState(new Set());
  const [customersData, setCustomersData] = useState([]);
  const [yarnTypeData, setYarnTypeData] = useState();
  const [allKSP, setAllKSP] = useState([]);
  const [ODQuantityData, setODQuantityData] = useState({});
  const [isLoading, setLoading] = useState(false);

  const decryptObjectKeys = (data) => {
    const decryptedData = data.map((item) => {
      const decryptedItem = {};
      Object.keys(item).forEach((key) => {
        decryptedItem[key] = decrypt(item[key]);
      });
      return decryptedItem;
    });
    return decryptedData;
  };

  // Function to get flag URL based on country code
  const getFlagByCountryCode = (countryName) => {
    const country = countries.find((c) => c.label.toLowerCase() === countryName.toLowerCase());
    return country ? `flagpack:${country.code.toLowerCase()}` : '';
  };

  // // ********************************

  // Fetch Customer Data
  const FetchCustomersData = useCallback(async () => {
    try {
      // Check if supplier data exists in session storage
      const storedData = sessionStorage.getItem('customersData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Group data by country
        const groupedData = {};
        parsedData.forEach((item) => {
          if (!groupedData[item.Country]) {
            groupedData[item.Country] = [];
          }
          groupedData[item.Country].push(item);
        });

        // Sort groups in descending order based on the length of each group
        const sortedGroups = Object.values(groupedData).sort((a, b) => b.length - a.length);

        // Convert sorted groups to the desired format
        const dynamicArray = sortedGroups.map((group, index) => ({
          id: index,
          name: group[0].Country,
          totalCustomer: group.length,
          flag: getFlagByCountryCode(group[0].Country),
        }));

        setCustomersData(dynamicArray);
      } else {
        // Fetch data from the API if not available in session storage
        const response = await axios.get(
          `https://ssbqcsystemapi.m5groupe.online:6443/mapi/GetCustomerData?UserID=1`
        );

        // const response = await Get(`GetYarnSetupList`);
        const decryptedData = decryptObjectKeys(response.data.ServiceRes);
        // Group data by country
        const groupedData = {};
        decryptedData.forEach((item) => {
          if (!groupedData[item.Country]) {
            groupedData[item.Country] = [];
          }
          groupedData[item.Country].push(item);
        });

        // Sort groups in descending order based on the length of each group
        const sortedGroups = Object.values(groupedData).sort((a, b) => b.length - a.length);

        // Convert sorted groups to the desired format
        const dynamicArray = sortedGroups.map((group, index) => ({
          id: index,
          name: group[0].Country,
          totalCustomer: group.length,
          flag: getFlagByCountryCode(group[0].Country),
        }));

        setCustomersData(dynamicArray);

        // Store data in session storage for future use
        sessionStorage.setItem('customersData', JSON.stringify(decryptedData));
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  const FetchPriceByYarnType = useCallback(async () => {
    try {
      const response = await Get('avgunitpricebyyeartypeandsalesperson');
      if (response.status === 200) {
        const rawData = response.data;

        // Get unique KeySalesPersons (categories)
        const categories = Array.from(new Set(rawData.map((item) => item.KeySalesPerson)));

        // Group data by SalesYear
        const groupedByYear = rawData.reduce((acc, curr) => {
          const year = curr.SalesYear;
          if (!acc[year]) acc[year] = [];
          acc[year].push(curr);
          return acc;
        }, {});

        const series = Object.entries(groupedByYear).map(([year, records]) => {
          // Get unique yarn types for the year
          const yarnTypes = Array.from(new Set(records.map((r) => r.YarnType)));

          const data = yarnTypes.map((yarnType) => {
            // Prepare data for each yarn type based on all sales persons (aligned with categories)
            const yarnData = categories.map((person) => {
              const match = records.find(
                (r) => r.YarnType === yarnType && r.KeySalesPerson === person
              );
              return match ? `${fNumber(match.AvgUnitPricePerKG)} KG` : 0; // or null
            });

            return {
              name: yarnType,
              data: yarnData,
            };
          });

          return {
            year,
            data,
          };
        });

        setYarnTypeData({
          categories,
          series,
        });
      }
    } catch (error) {
      console.log('error', error);
    }
  }, []);

  const FetchKeySalePersons = useCallback(async () => {
    try {
      const response = await Get('salesaggregatedata');
      if (response.status === 200) {
        setAllKSP(response.data);
      }
    } catch (error) {
      console.log('error', error);
    }
  }, []);

  const sortedKSP = useMemo(() => {
    if (!allKSP?.length) return null;
    return processSalesData(allKSP);
  }, [allKSP]);

  const allKSPofSelectedPerson = allKSP.filter((item) => item.KeySalesPerson === selectedPerson);

  // *****************************************
  // Is All Data Fetched
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([FetchPriceByYarnType(), FetchCustomersData(), FetchKeySalePersons()]);
      setLoading(false);
    };
    fetchData();
  }, [FetchPriceByYarnType, FetchCustomersData, FetchKeySalePersons]);

  // Convert the Set back to an array for rendering,
  const uniqueCitySetArray = useMemo(() => [...citySet], [citySet]);

  const sliderData = [
    {
      id: 1,
      // mainTitle: 'SERVICES',
      title: 'INNOVATION',
      description:
        'Research & development is our heritage and know how. Be always innovative is how we meet the needs of our partners thanks to high technical knowledge in product study. Yarn development, machine at the forefront of knitting technology and confection are constant areas of interest and innovation.',
      coverUrl: '/assets/images/slider/cover-1.jpg',
    },
    {
      id: 2,
      // mainTitle: 'SERVICES',
      title: 'SUSTAINABLE FUTURE',
      description:
        'Sustainability is on top of our values as we want to imagine a business where beauty and future are together. We dedicate a department that follows the traceability of our production process managing responsibly the supply chain.',
      coverUrl: '/assets/images/slider/cover-2.jpg',
    },
    {
      id: 3,
      // mainTitle: 'SERVICES',
      title: 'INTERNATIONAL PRODUCTION',
      description:
        'We have external production partners in ROMANIA, BULGARIA and TUNISIA, all of them vertically integrated and aligned with Diana Studio standards, and policy & sustainability requirements.Our production portfolio has been established also in BANGLADESH, where we have a Cyclo and technical team that works closely to our Italian team, in a looking forward production unit that has the purpose to develop the knitting knowledge in the country',
      coverUrl: '/assets/images/slider/cover-3.jpg',
    },
  ];
  const renderLoading = (
    <LoadingScreen
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '70vh',
      }}
    />
  );
  return isLoading ? (
    renderLoading
  ) : (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <AppWelcome
            title="TRACEABILITY AND TRANSPARENCY"
            description="WE BELIEVE IN A CONSCIOUS CONSUMPTION WHERE TRANSPARENCY IS SYNONYMOUS WITH QUALITY"
          // img={<SeoIllustration />}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppFeatured list={sliderData} />
        </Grid>

        {/* {userData?.userDetails?.userId === 1 || 2 ? ( */}
        <>
          <Grid xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Active Customers"
              total={127}
              color="info"
              icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Open Orders"
              total={1350}
              color="warning"
              icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="This Week Ship Quantity"
              total={0}
              color="error"
              icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Quantity Booked This Week"
              total="240,000 kg"
              color="success"
              icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4}>
            <AppTotalSuppliersRegistered
              title="Total Registered Customers"
              chart={{
                series: uniqueCitySetArray.map((city) => ({
                  label: city,
                  value: suppliersData.filter((obj) => obj.CityName === city).length,
                })),
              }}
            />
          </Grid>
          {yarnTypeData && (
            <>
              <Grid xs={12} md={6} lg={6}>
                <InspectionPerformanceBar title="Average of Unit Price (KG)" chart={yarnTypeData} />
              </Grid>
              <Grid xs={12} md={6} lg={6}>
                <InspectionPerformance title="Average of Unit Price (KG)" chart={yarnTypeData} />
              </Grid>
            </>
          )}

          {allKSP && (
            <>
              {sortedKSP && (
                <Grid sm={12} md={6} lg={6}>
                  <InspectionPerformanceKSP
                    title="Ordered and Delivered Quantity"
                    chart={sortedKSP}
                    selectedPerson={selectedPerson}
                    onSelectPerson={setSelectedPerson}
                  />
                </Grid>
              )}

              <Grid sm={12} md={6} lg={6}>
                <AppNewInspections
                  title={`Ordered and Delivered Quantity by ${selectedPerson}`}
                  tableData={allKSPofSelectedPerson || []}
                  tableLabels={[
                    { id: 'SalesYear', label: 'Year' },
                    // { id: 'KeySalesPerson', label: 'Key Sales Person' },
                    {
                      id: 'AvgUnitPrice_KG',
                      label: 'Unit Price (KG)',
                      minWidth: 95,
                      align: 'right',
                    },
                    { id: 'TotalOrderQty_KG', label: 'Ordered Quantity (KG)', align: 'right' },
                    { id: 'TotalOrderValue_USD_KG', label: 'Ordered Value USD/KG', align: 'right' },
                    { id: 'TotalDeliveredQty', label: 'Delivered Quantity (KG)', align: 'right' },
                    { id: 'TotalDeliveredValue', label: 'Delivered Value USD/KG', align: 'right' },
                  ]}
                />
              </Grid>
            </>
          )}
          <Grid xs={12} md={4} lg={4}>
            <AppTopCustomerCountries
              title="Customer Distribution by Country"
              list={customersData.map((x) => ({
                id: x.id,
                name: x.name,
                totalCustomer: x.totalCustomer,
                flag: x.flag,
              }))}
            />
          </Grid>
          <Grid xs={12} lg={8}>
            <AppNewInspections
              title="New Order"
              tableData={_appInvoices}
              tableLabels={[
                { id: 'id', label: 'PI Referece' },
                { id: 'Colors', label: 'Color' },
                { id: 'styleno', label: 'Count' },
                { id: 'yarnType', label: 'Yarn Type' },
                { id: 'machineNo', label: 'Machine No' },
                { id: 'status', label: 'Status' },
              ]}
            />
          </Grid>


          <Grid xs={12} sx={{ textAlign: 'center', mt: 5 }}>
            <Typography variant="p" sx={{ fontSize: '14px' }}>
              Copyright © {currentYear} Interactive Technologies Gateway. All Rights Reserved.
            </Typography>
          </Grid>
        </>
        {/* ) : null} */}
      </Grid>
    </Container>
  );
}
