// components/Cyclo.js
import React, { useEffect, useState } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Image,
  Font,
  Link,
} from '@react-pdf/renderer';

import numberToWords from 'number-to-words';
import { fDate } from 'src/utils/format-time';
import PropTypes from 'prop-types';
import { APP_API } from 'src/config-global';

// 1. UPDATE STYLES FOR BLACK AND WHITE BORDERS/TEXT
const BLACK = '#000';
const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 10, // reserve space for original footer
    paddingHorizontal: 30,
    fontSize: 10,
    fontFamily: 'Century Gothic',
  },

  title: {
    textDecoration: 'underline',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
    fontFamily: 'Roboto-Bold',
  },
  tableHeader: {
    borderTop: 1,
    flexDirection: 'row',
    borderColor: BLACK, // Changed from gold
    fontWeight: 'bold',
    fontSize: 7,
    fontFamily: 'Roboto-Bold',
  },
  tableRow: {
    flexDirection: 'row',
  },
  cell: {
    padding: 3,
    fontSize: 9,
    textAlign: 'center',
    borderBottom: 1,
    borderRight: 1,
    borderLeft: 1,
    borderColor: BLACK, // Changed from gold
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 20, // Adjusted to match footer position
    left: 0,
    right: 0,
    textAlign: 'right',
    color: BLACK,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Align items vertically in the center
  },
  left: { textDecoration: 'none', color: BLACK },
  center: { position: 'absolute', left: 0, right: 0, textAlign: 'center' }, // New style for centering
  right: { textAlign: 'right' },
  header: {
    marginBottom: 10,
  },
});

// 2. UPDATED Header Component for Black & White Logos
const Header = () => (
  <View style={styles.header} fixed>
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        marginTop: 10,
      }}
    >
      <View>
        <Image source="/logo/Simco(CMYK).png" style={{ height: 35, width: 130 }} />
      </View>
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 10,
          marginTop: 10,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'Roboto-Bold' }}>
          SIMCO SPINNING & TEXTILES LIMITED
        </Text>
        <Text style={{ fontFamily: 'Roboto-Regular', marginTop: 3 }}>
          Factory Address:{' '}
          <Text style={{ fontSize: 12 }}>
            Dhamshur, Mollikbari, Hajirbazar, Bhaluka Mymensingh, Bangladesh
          </Text>
        </Text>
        <Text style={{ fontFamily: 'Roboto-Regular', marginTop: 3 }}>
          Office Address:{' '}
          <Text style={{ fontSize: 12 }}>
            House#2B, Road#04, Block-B, Banani, Dhaka-1213, Bangladesh.
          </Text>
        </Text>
      </View>
      <View>
        <Image source="/logo/CYCLO(CMYK).png" style={{ height: 40, width: 100 }} />
      </View>
    </View>
  </View>
);

const Footer = () => (
  <View style={styles.footer} fixed>
    {/* LEFT ALIGNED Content */}
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text>Powered by : ITG Technology Company | </Text>
      <Link src="https://www.itgllc.ae/" style={styles.left}>
        <Text>Visit www.itgllc.ae</Text>
      </Link>
    </View>

    <Text
      style={styles.center}
      render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
    />

    {/* RIGHT ALIGNED Content */}
    <Text style={styles.right}>
      {`Report Generated On : ${new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })} ${new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`}
    </Text>
  </View>
);

// Updated column widths to accommodate currency column
// const columnWidths = ['8%', '10%', '18%', '8%', '10%', '8%', '10%', '10%', '8%', '10%'];
const columnWidths = ['6%', '13%', '25%', '8%', '10%', '12%', '10%', '16%'];

const PoReport = ({ poID }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${APP_API}GetPOMstDtlById?POID=${poID}`
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [poID]);

  if (loading) {
    return (
      <PDFViewer style={{ width: '100%', height: '100vh' }}>
        <Document>
          <Page size="A3" style={styles.page}>
            <Text>Loading...</Text>
          </Page>
        </Document>
      </PDFViewer>
    );
  }

  if (error) {
    return (
      <PDFViewer style={{ width: '100%', height: '100vh' }}>
        <Document>
          <Page size="A3" style={styles.page}>
            <Text>Error: {error}</Text>
          </Page>
        </Document>
      </PDFViewer>
    );
  }

  // Use optional chaining and default values to prevent crashes if data is malformed
  const poMst = data?.POMst?.[0] || {};
  const poDtl = data?.PODtl || [];

  const firstPageLimit = 25;
  const otherPagesLimit = 35;

  const splitRows = (rows) => {
    const chunks = [];

    if (rows.length <= firstPageLimit) {
      chunks.push(rows);
    } else {
      chunks.push(rows.slice(0, firstPageLimit));
      let remaining = rows.slice(firstPageLimit);

      while (remaining.length > 0) {
        chunks.push(remaining.slice(0, otherPagesLimit));
        remaining = remaining.slice(otherPagesLimit);
      }
    }

    return chunks;
  };

  const convertAmountToWords = (amount, currId) => {
    const [whole, decimal] = amount.toFixed(2).split('.');
    const wholeNumber = Number(whole || 0);
    const decimalNumber = Number(decimal || 0);

    const wholeWords = numberToWords.toWords(wholeNumber).toUpperCase();
    const decimalWords = numberToWords.toWords(decimalNumber).toUpperCase();

    // Currency mapping based on currency ID
    if (currId === 1) {
      // USD - Dollar and Cents
      return `IN WORDS : ${wholeWords} DOLLAR AND ${decimalWords} CENTS ONLY`;
    }

    if (currId === 8) {
      // BDT - Taka and Poisha
      return `IN WORDS : ${wholeWords} TAKA AND ${decimalWords} POISHA ONLY`;
    }

    // Default case for other currencies
    return `IN WORDS : ${wholeWords} AND ${decimalWords} ONLY`;
  };

  // Calculate totals by currency
  const calculateTotalsByCurrency = () => {
    const totals = {};

    poDtl.forEach((item) => {
      const currencyId = item.Currency_ID;
      const amount = item.POQTY * item.POUNITPRICE;

      if (!totals[currencyId]) {
        totals[currencyId] = {
          amount: 0,
          currencyName: item.Currency_Name,
          currencySymbol: item.Currency_ID === 1 ? 'USD ' : item.Currency_ID === 8 ? 'BDT ' : '',
        };
      }

      totals[currencyId].amount += amount;
    });

    return totals;
  };

  const currencyTotals = calculateTotalsByCurrency();
  const chunkedItems = splitRows(poDtl);

  // 3. LOGIC FOR CONDITIONAL APPROVAL STATUS COLOR BASED ON Level2_Approve
  const approvalStatus = poMst.Level2_Approve ? poMst.Level2_Approve.toUpperCase() : 'P'; // Default to Pending

  let approvalColor = 'gray';
  let approvalText = 'Pending';

  if (approvalStatus === 'A') {
    approvalColor = 'green';
    approvalText = 'Approved';
  } else if (approvalStatus === 'R') {
    approvalColor = 'red';
    approvalText = 'Rejected';
  }

  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document
        title={`Purchase Order - ${poMst.POCODE || 'N/A'}`}
        subject="Purchase Order Report"
        creator="CYCLO® Cloud"
        author="ITG"
      >
        {chunkedItems.map((chunk, chunkIndex) => (
          <Page key={chunkIndex} size="A3" style={styles.page} wrap>
            <Header />

            {/* Title Section */}
            <View
              style={{
                alignSelf: 'center',
                textAlign: 'center',
                fontSize: 18,
                marginTop: 5,
                marginBottom: 15,
                fontFamily: 'Roboto-Bold',
              }}
            >
              <Text> Purchase Order </Text>
            </View>

            {/* PO Info Section */}
            <View
              style={{
                fontSize: 11,
                fontFamily: 'Roboto-Bold',
                border: 1,
                padding: 15,
                borderRadius: 5,
                borderColor: BLACK, // B&W
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 11 }}>
                <View style={{ width: '60%', gap: 5 }}>
                  <Text style={{ fontFamily: 'Roboto-Bold' }}>
                    Supplier Info :{' '}
                    <Text style={{ fontFamily: 'Roboto-Regular' }}>{poMst.VendorName}</Text>
                  </Text>
                  <Text style={{ fontFamily: 'Roboto-Bold' }}>
                    Address :{' '}
                    <Text style={{ fontFamily: 'Roboto-Regular' }}>
                      House#2B, Road#04, Block-B, Banani, Dhaka-1213, Bangladesh.
                    </Text>
                  </Text>
                </View>
                <View style={{ width: '40%', gap: 5 }}>
                  <View style={{ flexDirection: 'row', gap: 55 }}>
                    <Text style={{ width: '50%' }}>
                      PO No : <Text style={{ fontFamily: 'Roboto-Regular' }}>{poMst.POCODE}</Text>
                    </Text>
                    <Text style={{ width: '50%' }}>
                      Req. No :{' '}
                      <Text style={{ fontFamily: 'Roboto-Regular' }}>{poMst.PRCODE} </Text>
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 55 }}>
                    <Text style={{ width: '50%' }}>
                      PO Date :{' '}
                      <Text style={{ fontFamily: 'Roboto-Regular' }}>{fDate(poMst.PODate)} </Text>
                    </Text>
                    <Text style={{ width: '50%' }}>
                      Req. Date :{' '}
                      <Text style={{ fontFamily: 'Roboto-Regular' }}>
                        {fDate(poMst.PRRequestDate)}{' '}
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={{
                  border: '1px solid #777',
                  borderColor: BLACK, // B&W
                  marginBottom: 10,
                  marginTop: 10,
                }}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 11 }}>
                <View style={{ width: '60%', gap: 5 }}>
                  <Text style={{ fontFamily: 'Roboto-Bold' }}>
                    Incoterm :{' '}
                    <Text style={{ fontFamily: 'Roboto-Regular' }}>
                      {poMst?.IncotermCode || '-'}
                      {/* {poMst.MeansOfTransports || '-'} */}
                    </Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Table Section */}
            <View style={{ marginTop: 20, marginBottom: 20, width: '100%' }}>
              {/* ===== Table Header ===== */}
              <View style={styles.tableHeader} wrap={false}>
                {[
                  { label: 'SL', fontSize: 9 },
                  { label: 'Item Code', fontSize: 9 },
                  { label: 'Item Description', fontSize: 9 },
                  { label: 'UOM', fontSize: 9 },
                  { label: 'Order Qty', fontSize: 9 },
                  { label: 'Unit Price', fontSize: 9 },
                  { label: 'Currency', fontSize: 9 },
                  { label: 'Amount', fontSize: 9 },
                ].map((col, i) => (
                  <View
                    key={col.label}
                    style={[
                      styles.cell,
                      {
                        width: columnWidths[i],
                        borderLeft: 1,
                        borderRight: i === 7 ? 1 : 0,
                        borderColor: BLACK,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: col.fontSize,
                        fontWeight: 'bold',
                      }}
                    >
                      {col.label}
                    </Text>
                  </View>
                ))}
              </View>

              {/* ===== Table Rows ===== */}
              {chunk.map((item, idx) => {
                const actualIndex =
                  idx +
                  1 +
                  (chunkIndex > 0 ? firstPageLimit + (chunkIndex - 1) * otherPagesLimit : 0);
                const amount = item.POQTY * item.POUNITPRICE;
                const currencySymbol =
                  item.Currency_ID === 1 ? 'USD ' : item.Currency_ID === 8 ? 'BDT ' : '';

                return (
                  <View key={idx} style={styles.tableRow} wrap={false}>
                    {[
                      actualIndex,
                      item.ItemCode,
                      item.ItemDescription,
                      item.UOMName,
                      item.POQTY,
                      `${currencySymbol}${item.POUNITPRICE?.toFixed(2)}`,
                      item.Currency_Name,
                      `${currencySymbol}${amount?.toFixed(2)}`,
                    ].map((val, i) => (
                      <Text
                        key={i}
                        style={[
                          styles.cell,
                          {
                            width: columnWidths[i],
                            borderLeft: 1,
                            borderRight: i === 7 ? 1 : 0,
                            borderColor: BLACK,
                            textAlign:
                              i === 4 || i === 5 || i === 6 || i === 7
                                ? 'right'
                                : styles.cell.textAlign,
                          },
                        ]}
                      >
                        {val}
                      </Text>
                    ))}
                  </View>
                );
              })}

              {/* ===== Totals Section ===== */}
              {chunkIndex === chunkedItems.length - 1 && (
                <>
                  {[
                    { label: 'Additional Charges', value: '-' },
                    { label: 'Landed Cost', value: '-' },
                    { label: 'Deduction', value: '-' },
                  ].map((row, i) => (
                    <View key={i} style={styles.tableRow} wrap={false}>
                      <Text
                        style={{
                          ...styles.cell,
                          width: `${columnWidths
                            .slice(0, 6)
                            .reduce((sum, w) => sum + parseFloat(w), 0)}%`,
                          borderRight: 0,
                          textAlign: 'right',
                          borderColor: BLACK,
                        }}
                      >
                        {row.label}
                      </Text>

                      {/* Currency + Amount merged (last 2 columns) */}
                      <Text
                        style={{
                          ...styles.cell,
                          width: `${parseFloat(columnWidths[6]) + parseFloat(columnWidths[7])}%`,
                          borderLeft: 1,
                          borderRight: 1,
                          textAlign: 'right',
                          borderColor: BLACK,
                        }}
                      >
                        {row.value}
                      </Text>
                    </View>
                  ))}

                  {/* ===== Final Total By Currency ===== */}
                  {Object.entries(currencyTotals).map(([currencyId, totalData]) => (
                    <View key={currencyId} style={styles.tableRow} wrap={false}>
                      <Text
                        style={{
                          ...styles.cell,
                          width: `${columnWidths
                            .slice(0, 6)
                            .reduce((sum, w) => sum + parseFloat(w), 0)}%`,
                          borderRight: 0,
                          textAlign: 'left',
                          fontFamily: 'Roboto-Bold',
                          fontSize: 9,
                          paddingHorizontal: 5,
                          borderColor: BLACK,
                        }}
                      >
                        {convertAmountToWords(totalData.amount, Number(currencyId))}
                      </Text>

                      {/* Merge last 2 columns (Currency + Amount) */}
                      <Text
                        style={{
                          ...styles.cell,
                          width: `${parseFloat(columnWidths[6]) + parseFloat(columnWidths[7])}%`,
                          borderLeft: 1,
                          borderRight: 1,
                          textAlign: 'right',
                          fontFamily: 'Roboto-Bold',
                          borderColor: BLACK,
                        }}
                      >
                        {totalData.currencySymbol}
                        {totalData.amount.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </>
              )}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', fontSize: 11 }}>
              <View style={{ width: '50%', gap: 5 }}>
                <Text style={{ fontFamily: 'Roboto-Bold' }}>
                  Means Of Transport :{' '}
                  <Text style={{ fontFamily: 'Roboto-Regular' }}>
                    {/* {poMst.IncoTerm || '-'} */}
                    {poMst.MeansOfTransports || '-'}
                  </Text>
                </Text>
              </View>
              <View style={{ width: '50%', gap: 5 }}>
                <View style={{ flexDirection: 'row', gap: 5, fontFamily: 'Roboto-Bold' }}>
                  <Text style={{ width: '70%' }}>
                    Delivery Point :{' '}
                    <Text style={{ fontFamily: 'Roboto-Regular' }}>{poMst?.StoreName || '-'}</Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Delivery Terms Section - Updated for B&W border and Conditional Status Color */}
            <View
              style={{
                border: 1,
                borderColor: BLACK, // B&W
                marginTop: 20,
                fontSize: 10,
                fontFamily: 'Roboto-Bold',
              }}
              // Do not wrap this section, keep signatures on the same page
              wrap={false}
            >
              <View style={{ flexDirection: 'row', height: 60 }}>
                <View style={{ borderRight: 1, borderColor: BLACK, flexGrow: 1 }}>
                  {' '}
                  {/* B&W */}
                  <View style={{ flexDirection: 'row', borderBottom: 1, borderColor: BLACK }}>
                    {' '}
                    {/* B&W */}
                    <Text style={{ width: '50%', padding: 4 }}>Delivery Terms :</Text>
                  </View>
                  <View style={{ flexDirection: 'row', borderBottom: 0, borderColor: BLACK }}>
                    {' '}
                    {/* B&W */}
                    <Text style={{ width: '50%', padding: 4 }}>
                      Payment Terms: {poMst.Payment_Term}{' '}
                    </Text>
                  </View>
                </View>

                {/* Conditional Approval Status Display */}
                <View
                  style={{
                    borderColor: BLACK, // B&W
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '30%',
                  }}
                >
                  <Text style={{ color: approvalColor, fontSize: 20 }}>{approvalText}</Text>
                </View>
              </View>

              <View style={{ borderBottom: 1, borderTop: 1, borderColor: BLACK, padding: 4 }}>
                {' '}
                {/* B&W */}
                <Text>Remarks</Text>
              </View>

              <View style={{ marginTop: 5, marginLeft: 5 }}>
                <Text style={{ fontSize: 12, fontFamily: 'Roboto-Bold', marginBottom: 3 }}>
                  Terms & Conditions:
                </Text>

                <View style={{ marginLeft: 10, marginTop: 5 }}>
                  <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular', marginBottom: 2 }}>
                    • All deliveries must be accompanied by a valid VAT invoice and signed delivery
                    challan.
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular', marginBottom: 2 }}>
                    • Supplier must retain proof of dispatch and delivery for audit purposes.
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular' }}>
                    • Partial deliveries must be pre-approved in writing by the buyer.
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular' }}>
                    • Buyer reserves the right to inspect and verify goods before acceptance.
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular' }}>
                    • Payment will be processed only upon receipt of correct and complete
                    documentation (PO, challan, invoice).
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular' }}>
                    • Goods must conform to the specifications mentioned in the PO; non-conforming
                    items will be returned at supplier’s cost.
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular' }}>
                    • Any mismatch between PO and invoice may delay payment processing.
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular' }}>
                    • Buyer reserves the right to reject goods found damaged, defective, or not
                    matching the PO description
                  </Text>
                </View>
              </View>

              {/* Signature Section */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                  height: 100,
                  alignItems: 'flex-end',
                }}
              >
                {/* Prepared By */}
                <View style={{ alignItems: 'center', width: '33.33%' }}>
                  <Text style={{ fontSize: 10, marginBottom: 3 }}>
                    {poMst.PreparedBy && poMst.PreparedBy.trim() !== '' ? poMst.PreparedBy : ' - '}
                  </Text>
                  <Text style={{ fontSize: 9, color: 'gray', marginTop: 4 }}>Prepared By</Text>
                </View>

                {/* Approved By */}
                <View style={{ alignItems: 'center', width: '33.33%' }}>
                  <Text style={{ fontSize: 10, marginBottom: 3 }}>
                    {poMst.FinalApproverName && poMst.FinalApproverName.trim() !== ''
                      ? poMst.FinalApproverName
                      : ' - '}
                  </Text>
                  <Text style={{ fontSize: 9, color: 'gray', marginTop: 4 }}>Approved By</Text>
                </View>
              </View>
            </View>

            {/* Note Section */}
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 12, fontFamily: 'Roboto-Bold', marginBottom: 3 }}>
                Note:
              </Text>

              {/* Bullet Points */}
              <View style={{ marginLeft: 10, marginTop: 5 }}>
                <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular', marginBottom: 2 }}>
                  • Delivery goods will only be accepted with the mentioned PO number in the
                  delivery challan.
                </Text>
                <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular', marginBottom: 2 }}>
                  • Challan must be prepared PO-wise.
                </Text>
                <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular' }}>
                  • Correct challan will help process your payment smoothly.
                </Text>
              </View>
            </View>

            <Footer />
          </Page>
        ))}
      </Document>
    </PDFViewer>
  );
};

// Font registrations remain the same
Font.register({ family: 'book-antiqua-bold', src: '/fonts/book-antiqua-bold.ttf' });
Font.register({ family: 'Century Gothic', src: '/fonts/Century Gothic.ttf' });
Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf' });
Font.register({ family: 'Roboto-Medium', src: '/fonts/Roboto-Medium.ttf' });
Font.register({
  family: 'Roboto-Regular',
  src: '/fonts/Roboto-Regular.ttf',
});
export default PoReport;

PoReport.propTypes = {
  poID: PropTypes.any,
};
