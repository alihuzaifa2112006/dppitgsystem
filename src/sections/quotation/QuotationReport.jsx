// components/QuotationReport.js
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Image,
  Font,
} from '@react-pdf/renderer';
import PropTypes from 'prop-types';
import { amountToWords } from 'src/utils/amountToWords';
import { fDate } from 'src/utils/format-time';

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 10, // reserve space for footer
    paddingHorizontal: 30,
    fontSize: 10,
    fontFamily: 'Roboto-Regular',
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
    backgroundColor: '#eee',
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
    borderLeft: 1,
    borderColor: '#000',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: -50,
    left: 0,
    right: 0,
    textAlign: 'right',
    color: 'black',
  },
});

const columnWidths = ['5%', '10%', '10%', '35%', '10%', '10%', '10%', '10%'];

const TableHeader = () => (
  <View style={styles.tableHeader} wrap={false}>
    {[
      { label: 'S. No.', fontSize: 9 },
      { label: 'Yarn Type', fontSize: 9 },
      { label: 'Count', fontSize: 9 },
      { label: 'Composition', fontSize: 9 },
      // { label: 'Product Description', fontSize: 9 },
      { label: 'CYCLO Color & Code', fontSize: 9 },
      // { label: 'Order Qty', fontSize: 9 },
      { label: 'Order Quantity', fontSize: 9 },
      { label: 'Unit Price', fontSize: 9 },
      { label: 'Amount (USD)', fontSize: 9 },
    ].map((col, i) => (
      <View
        key={col.label}
        style={{
          ...styles.cell,
          width: columnWidths[i],
          borderLeft: 1,
          borderRight: i === 7 ? 1 : 0,
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            fontSize: col.fontSize,
            fontWeight: 'bold',
            marginVertical: 'auto',
          }}
        >
          {col.label}
        </Text>
      </View>
    ))}
  </View>
);

const items = [
  {
    orderId: '1', // Order ID
    yarnType: 'Cotton', // Yarn Type
    count: '30s', // Count
    composition: '100% Cotton', // Composition
    productDescription: 'Knitted Boys', // Product Description
    cycloColorCode: 'Blue - 304', // CYCLO Color & Code
    orderQty: '14,130', // Order Qty
    kgLbs: '6200', // KG/LBs
    unitPrice: '4.35', // Unit Price
    amountUsd: '61,465.50', // Amount [US]
  },
];

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

const QuotationReport = ({ currentData, clauses }) => {
  const chunkedItems = splitRows(currentData?.QuotationDtl || []);
  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document
        title={`Quotation Report - ${currentData?.QuotationMst?.QuotationNo}`}
        subject="Quotation Report"
        creator="CYCLO® Cloud"
        author="ITG"
      >
        <Page size="A3" style={styles.page}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              {' '}
              <Image source="/logo/Simco(CMYK).png" style={{ height: 35, width: 130 }} />
            </View>
            <View>
              {' '}
              <Image source="/logo/CYCLO(CMYK).png" style={{ height: 40, width: 100 }} />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 10,
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
          <View
            style={{ border: 1, flexDirection: 'row', fontFamily: 'Roboto-Bold', fontSize: 12 }}
          >
            <View style={{ width: '10%', borderRight: 1, padding: 5, alignItems: 'center' }}>
              <Text>QTN Ref.</Text>
            </View>
            <View style={{ width: '20%', borderRight: 1, padding: 5, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Roboto-Regular' }}>
                {currentData?.QuotationMst?.QuotationNo}
              </Text>
            </View>
            <View
              style={{
                width: '40%',
                borderRight: 1,
                padding: 5,
                alignItems: 'center',
                backgroundColor: '#f5f5f5',
              }}
            >
              <Text>Quotation Invoice</Text>
            </View>
            <View style={{ width: '10%', borderRight: 1, padding: 5, alignItems: 'center' }}>
              <Text>Date :</Text>
            </View>
            <View style={{ width: '20%', padding: 5, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Roboto-Regular' }}>
                {fDate(new Date(currentData?.QuotationMst?.QuotationDate))}
              </Text>
            </View>
          </View>
          <View
            style={{
              marginTop: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 20,
              gap: 20,
            }}
          >
            {/* Customer Details */}
            <View style={{ border: 1, width: '45%' }}>
              <View
                style={{
                  padding: 5,
                  fontFamily: 'Roboto-Bold',
                  fontSize: 12,
                  alignItems: 'center',
                  borderBottom: 1,
                }}
              >
                <Text>Customer Details</Text>
              </View>

              {/* Fixed width rows with text wrapping */}
              {[
                { label: 'Company Name :', value: currentData?.CustomerInfo?.Cust_Name },
                {
                  label: 'Contact Person :',
                  value: currentData?.CustomerContacts?.Contact_Person_Name,
                },
                { label: 'Address :', value: currentData?.CustomerInfo?.Cust_Address1 },
                { label: 'Phone :', value: currentData?.CustomerInfo?.Cust_Landline_No },
                { label: 'Email :', value: currentData?.CustomerInfo?.Cust_Onboarding_Email },
              ].map((item, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    borderBottom: index < 4 ? 1 : 0,
                    minHeight: 24, // Ensure consistent row height
                  }}
                >
                  <View
                    style={{
                      borderRight: 1,
                      padding: 5,
                      backgroundColor: '#f5f5f5',
                      width: '30%', // Slightly wider label column
                      justifyContent: 'center',
                      fontFamily: 'Roboto-Bold',
                    }}
                  >
                    <Text>{item.label}</Text>
                  </View>
                  <View
                    style={{
                      padding: 5,
                      width: '70%',
                      justifyContent: 'center',
                      wordWrap: 'break-word', // Ensure text wraps
                    }}
                  >
                    <Text style={{ flexWrap: 'wrap' }}>{item.value || '-'}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Buyer Details */}
            <View style={{ border: 1, width: '45%' }}>
              <View
                style={{
                  padding: 5,
                  fontFamily: 'Roboto-Bold',
                  fontSize: 12,
                  alignItems: 'center',
                  borderBottom: 1,
                }}
              >
                <Text>Buyer Details</Text>
              </View>

              {/* Fixed width rows matching customer details */}
              {[
                { label: 'Company Name :', value: currentData?.EndCustomerInfo?.End_Cust_Name },
                { label: 'Contact Person :', value: '-' },
                { label: 'Address :', value: '-' },
                { label: 'Phone :', value: '-' },
                { label: 'Email :', value: '-' },
              ].map((item, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    borderBottom: index < 4 ? 1 : 0,
                    minHeight: 24, // Match customer details row height
                  }}
                >
                  <View
                    style={{
                      borderRight: 1,
                      padding: 5,
                      backgroundColor: '#f5f5f5',
                      width: '30%',
                      justifyContent: 'center',
                      fontFamily: 'Roboto-Bold',
                    }}
                  >
                    <Text>{item.label}</Text>
                  </View>
                  <View
                    style={{
                      padding: 5,
                      width: '70%',
                      justifyContent: 'center',
                    }}
                  >
                    <Text>{item.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Quotation Detail Table */}
          <View>
            {chunkedItems.map((chunk, chunkIndex) => (
              <View key={chunkIndex} wrap={false}>
                <TableHeader />

                {chunk.map((item, idx) => (
                  <View key={idx} style={styles.tableRow} wrap={false}>
                    {[
                      idx + 1, // Order ID
                      item.YARN_TYPE, // Yarn Type
                      item.YARN_COUNT_NAME, // Count
                      item.Composition_Name, // Composition
                      // item?.Description || 'N/A', // Product Description
                      `${item.ColorName} - ${item.Color_Code}`, // CYCLO Color & Code
                      // item.Quantity, // Order Qty
                      `${item.Quantity} ${item.UOMName}`, // KG/LBs (formatted)
                      `$${item.UnitPrice}`, // Unit Price
                      `$${item.UnitPrice * item.Quantity}`, // Amount Price,
                    ].map((val, i) => (
                      <Text
                        key={i}
                        style={{
                          ...styles.cell,
                          width: columnWidths[i],
                          textAlign: i === 7 ? 'right' : 'center',
                          borderLeft: 1,
                          borderRight: i === 7 ? 1 : 0,
                        }}
                      >
                        {val}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            ))}
            {/* Total Amount Row */}
            <View style={[styles.tableRow, { backgroundColor: '#f5f5f5' }]} wrap={false}>
              <Text
                style={{ ...styles.cell, width: '90%', borderLeft: 1, fontFamily: 'Roboto-Bold' }}
              >
                Total Amount (USD)
              </Text>

              {/* Empty cells for other columns */}
              {/* {[...Array(7)].map((_, i) => (
                <Text
                  key={i}
                  style={{
                    ...styles.cell,
                    width: columnWidths[i + 1],
                    borderLeft: 0,
                  }}
                />
              ))} */}

              {/* Total Amount cell (right-aligned) */}
              <Text
                style={{
                  ...styles.cell,
                  width: columnWidths[7],
                  borderLeft: 1,
                  borderRight: 1,
                  textAlign: 'right',
                  fontFamily: 'Roboto-Bold',
                }}
              >
                ${currentData?.QuotationDtl[0]?.Total_Amount?.toFixed(2)}
              </Text>
            </View>
          </View>
          <View
            style={{
              marginTop: 40,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '70%' }}>
              <Text style={{ fontFamily: 'Roboto-Bold', marginRight: 5, fontSize: 12 }}>
                Payment Terms:
              </Text>
              <View
                style={{
                  borderBottom: 1,
                  flex: 1,
                  paddingBottom: 1,
                  borderColor: '#000000',
                }}
              >
                <Text style={{ fontFamily: 'Roboto-Regular' }} />
              </View>
            </View>
          </View>
          <View
            style={{
              marginTop: 15,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '70%' }}>
              <Text style={{ fontFamily: 'Roboto-Bold', marginRight: 5, fontSize: 12 }}>
                Total Amount (in Words):
              </Text>
              <View
                style={{
                  borderBottom: 1,
                  flex: 1,
                  paddingBottom: 1,
                  borderColor: '#000000',
                }}
              >
                <Text style={{ fontFamily: 'Roboto-Regular' }}>
                  {amountToWords(currentData?.QuotationDtl[0]?.Total_Amount || 0)}
                </Text>
              </View>
            </View>
          </View>

          {/* Clauses */}
          {clauses.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <View
                style={{
                  padding: 5,
                  fontFamily: 'Roboto-Bold',
                  fontSize: 12,
                  // borderBottom: 1,
                  backgroundColor: '#f0f0f0',
                  marginBottom: 5,
                }}
              >
                <Text>Terms & Condition / Clauses</Text>
              </View>

              <View style={{ paddingLeft: 10 }}>
                {clauses.map((c, index) => (
                  <View
                    key={c.id}
                    style={{
                      flexDirection: 'row',
                      marginBottom: 5,
                      lineHeight: 1,
                      fontSize: 10,
                      fontFamily: 'Roboto-Regular',
                    }}
                  >
                    <Text style={{ width: 20, fontFamily: 'Roboto-Bold' }}>{index + 1}.</Text>
                    <Text style={{ flex: 1 }}>{c?.clause}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              padding: 5,
              marginTop: 50,
            }}
          >
            {/* {signatureDataUrl && ( */}
            <Image
              style={{ height: 75, width: 120, objectFit: 'contain' }}
              src={currentData?.SupplierSignature}
            />
            {/* )} */}
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 5,
            }}
            // debug
          >
            <View style={{ borderTop: 1 }}>
              <Text>Customer Acceptance</Text>
            </View>

            <View style={{ borderTop: 1 }}>
              <Text>Seller Acceptance</Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};
Font.register({ family: 'book-antiqua-bold', src: '/fonts/book-antiqua-bold.ttf' });
Font.register({ family: 'Century Gothic', src: '/fonts/Century Gothic.ttf' });
Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf' });
Font.register({ family: 'Roboto-Medium', src: '/fonts/Roboto-Medium.ttf' });
Font.register({ family: 'Roboto-Regular', src: '/fonts/Roboto-Regular.ttf' });
// Font.register({
//     family: 'Century Gothic',
//     src: '/fonts/Century Gothic.ttf'
// });
export default QuotationReport;

QuotationReport.propTypes = {
  currentData: PropTypes.any,
  clauses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      clause: PropTypes.string.isRequired,
      docName: PropTypes.string,
      isActive: PropTypes.bool,
    })
  ),
};
