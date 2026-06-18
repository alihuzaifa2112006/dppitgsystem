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
  Link,
} from '@react-pdf/renderer';
import PropTypes from 'prop-types';
import { amountToWords, amountToWordsInBDT } from 'src/utils/amountToWords';
import { fDate } from 'src/utils/format-time';
import { fCurrency, fNumber } from 'src/utils/format-number';

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 12,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  page: {
    paddingTop: 20,
    paddingBottom: 50, // Increased bottom padding for footer
    paddingHorizontal: 30,
    fontSize: 10,
    fontFamily: 'Roboto-Regular',
    position: 'relative',
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
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 9,
    paddingTop: 10,
    borderTop: '1 solid #000000',
    marginHorizontal: 30,
  },
});

const columnWidths = ['10%', '12%', '12%', '30%', '12%', '12%', '12%'];

const TableHeader = () => (
  <View style={styles.tableHeader} wrap={false}>
    {[
      { label: 'S. No.', fontSize: 9 },
      { label: 'Color', fontSize: 9 },
      { label: 'Yarn Count', fontSize: 9 },
      { label: 'Composition', fontSize: 9 },
      { label: 'Quantity in KG', fontSize: 9 },
      { label: 'Unit Price (USD/KG)', fontSize: 9 },
      { label: 'Value (USD)', fontSize: 9 },
    ].map((col, i) => (
      <View
        key={col.label}
        style={{
          ...styles.cell,
          width: columnWidths[i],
          borderLeft: 1,
          borderRight: i === 6 ? 1 : 0,
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

const getInvoiceTypeHeading = (type) => {
  switch (type) {
    case 'I':
      return 'Independent';
    case 'Q':
      return 'from Quotation';
    case 'P':
      return 'from PI';
    case 'R':
      return 'R&D';
    default:
      return null; // default
  }
};


const SampleReport = ({ currentData, clauses }) => {
  const chunkedItems = splitRows(currentData?.Details || []);
  const FilteredRemarks = Array.from(new Set(currentData?.Details?.filter(
    (c) => c?.Remarks && c?.Remarks !== 'N/A'
  ).map((c) => c?.Remarks)));
  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document
        title={`Sample Invoice - ${currentData?.Sample_Code}`}
        subject="Sample Invoice"
        creator="CYCLO® Cloud"
        author="ITG"
      >
        <Page size="A3" style={styles.page}>
          {/* Header Section */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Image source="/logo/Simco(CMYK).png" style={{ height: 35, width: 130 }} />
            <Image source="/logo/CYCLO(CMYK).png" style={{ height: 40, width: 100 }} />
          </View>

          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                fontFamily: 'Roboto-Bold',
                textTransform: 'uppercase',
              }}
            >
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

          {/* Sample Info Table */}
          <View
            style={{ border: 1, flexDirection: 'row', fontFamily: 'Roboto-Bold', fontSize: 12 }}
          >
            <View style={{ width: '10%', borderRight: 1, padding: 5, alignItems: 'center' }}>
              <Text>Sample No.</Text>
            </View>
            <View style={{ width: '20%', borderRight: 1, padding: 5, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Roboto-Regular' }}>{currentData?.Sample_Code}</Text>
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
              <Text>Sample Invoice Sheet</Text>
            </View>
            <View style={{ width: '10%', borderRight: 1, padding: 5, alignItems: 'center' }}>
              <Text>Date :</Text>
            </View>
            <View style={{ width: '20%', padding: 5, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Roboto-Regular' }}>
                {fDate(new Date(currentData?.Sample_Request_Date))}
              </Text>
            </View>
          </View>

          {/* Sample Invoice Details Table */}
          <View style={{ marginTop: 20, marginBottom: 20 }}>
            {/* Table Body - Heading removed */}
            <View
              style={{
                border: '1px solid #000',
              }}
            >
              {(() => {
                const isRND = currentData?.isRND || 'R';
                const allFields = [];

                // Base fields for all types
                allFields.push({
                  label: 'Sample Name :',
                  value: currentData?.Sample_Name || '-',
                });
                allFields.push({
                  label: 'This Sample is:',
                  value:
                    `${getInvoiceTypeHeading(currentData?.isRND)} ${
                      currentData?.PINo ? `- ${currentData.PINo}` : ''
                    }` || '-',
                });
                allFields.push({
                  label: 'KAM Name :',
                  value: currentData?.KAMName || '-',
                });
                allFields.push({
                  label: 'Address 2 :',
                  value: currentData?.Cust_Address2 || '-',
                });

                // Fields for Independent, Quotation, and PI (not RnD)
                if (isRND !== 'R') {
                  allFields.push({
                    label: 'Customer Name :',
                    value: currentData?.WIC_Name || '-',
                  });
                  // allFields.push({
                  //   label: 'Delivery Date :',
                  //   value: currentData?.Delivery_Date
                  //     ? fDate(new Date(currentData?.Delivery_Date))
                  //     : '-',
                  // });

                  // Quotation specific fields
                  if (isRND === 'Q') {
                    allFields.push({
                      label: 'Opportunity :',
                      value:
                        currentData?.Opportunity_Name || currentData?.Opportunity_ID
                          ? `ID: ${currentData.Opportunity_ID}`
                          : '-',
                    });
                    allFields.push({
                      label: 'Phone :',
                      value: currentData?.Cust_Landline_No || '-',
                    });
                    allFields.push({
                      label: 'Quotation :',
                      value:
                        currentData?.Quotation_No || currentData?.Quotation_ID
                          ? `ID: ${currentData.Quotation_ID}`
                          : '-',
                    });
                    allFields.push({
                      label: 'Email Address :',
                      value: currentData?.EmailAddress || '-',
                    });
                  }

                  // PI specific fields
                  if (isRND === 'P') {
                    // allFields.push({
                    //   label: 'PI No. :',
                    //   value: currentData?.PINo ? currentData.PINo : '-',
                    // });
                    allFields.push({
                      label: 'Phone :',
                      value: currentData?.Cust_Landline_No || '-',
                    });
                    allFields.push({
                      label: 'Email Address :',
                      value: currentData?.EmailAddress || '-',
                    });
                  }

                  // Independent specific fields
                  if (isRND === 'I') {
                    // allFields.push({
                    //   label: 'Delivery Date :',
                    //   value: currentData?.Delivery_Date
                    //     ? fDate(new Date(currentData?.Delivery_Date))
                    //     : '-',
                    // });
                    allFields.push({
                      label: 'Phone :',
                      value: currentData?.Cust_Landline_No || '-',
                    });
                    allFields.push({
                      label: 'Email Address :',
                      value: currentData?.EmailAddress || '-',
                    });
                  }

                  // Common fields for I, Q, P
                  allFields.push({
                    label: 'Main Buyer :',
                    value: currentData?.End_Cust_Name || '-',
                  });
                  allFields.push({
                    label: 'Agent :',
                    value: currentData?.Agent_Name || '-',
                  });
                } else {
                  // R&D specific fields
                  // allFields.push({
                  //   label: 'Delivery Date :',
                  //   value: currentData?.Delivery_Date
                  //     ? fDate(new Date(currentData?.Delivery_Date))
                  //     : '-',
                  // });
                  allFields.push({
                    label: 'Phone :',
                    value: currentData?.Cust_Landline_No || '-',
                  });
                  allFields.push({
                    label: 'Email Address :',
                    value: currentData?.EmailAddress || '-',
                  });
                }

                // Address always at the end
                allFields.push({
                  label: 'Address :',
                  value: currentData?.Cust_Address1 || currentData?.WIC_Address || '-',
                });

                // Group fields into rows of 2
                const rows = [];
                for (let i = 0; i < allFields.length; i += 2) {
                  rows.push(allFields.slice(i, i + 2));
                }

                return rows.map((row, rowIndex, rowsArray) => (
                  <View
                    key={rowIndex}
                    style={{
                      flexDirection: 'row',
                      borderBottom:
                        rowIndex === rowsArray.length - 1 ? '0px solid #000' : '1px solid #000',
                    }}
                  >
                    {row.map((item, colIndex) => {
                      const isLastRow = rowIndex === rowsArray.length - 1;
                      const isAddressField = item.label === 'Address :';
                      const minHeight = isLastRow && isAddressField ? 40 : 24;

                      return (
                        <View
                          key={colIndex}
                          style={{
                            width: '50%',
                            borderRight: colIndex === 0 ? '1px solid #000' : '0px solid #000',
                            flexDirection: 'row',
                            minHeight,
                          }}
                        >
                          <View
                            style={{
                              borderRight: '1px solid #000',
                              padding: 5,
                              backgroundColor: '#f5f5f5',
                              width: '40%',
                              justifyContent: isLastRow && isAddressField ? 'flex-start' : 'center',
                              fontFamily: 'Roboto-Bold',
                              minHeight,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 9,
                                textAlign: 'center',
                                marginTop: isLastRow && isAddressField ? 5 : 0,
                              }}
                            >
                              {item.label}
                            </Text>
                          </View>
                          <View
                            style={{
                              padding: 5,
                              width: '60%',
                              justifyContent: isLastRow && isAddressField ? 'flex-start' : 'center',
                              minHeight,
                            }}
                          >
                            <Text
                              style={{
                                flexWrap: 'wrap',
                                fontSize: 9,
                                lineHeight: 1.3,
                                textAlign: 'left',
                              }}
                            >
                              {item.value}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                    {/* Fill empty space if odd number of fields */}
                    {row.length === 1 && (
                      <View
                        style={{
                          width: '50%',
                          borderLeft: '1px solid #000',
                          minHeight: rowIndex === rowsArray.length - 1 ? 40 : 24,
                        }}
                      />
                    )}
                  </View>
                ));
              })()}
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
                      idx + 1,
                      `${item.ColorName || ''} - ${item.Color_Code || ''}`,
                      item.Yarn_Count_Name || '',
                      item.Composition_Name || '',
                      `${fNumber(item.Quantity || 0)} ${item.UOMName || ''}`,
                      `${fCurrency(item.Price || 0)} / ${item.UOMName || ''}`,
                      `${fCurrency(item.TotalAmount || 0)}`,
                    ].map((val, i) => (
                      <Text
                        key={i}
                        style={{
                          ...styles.cell,
                          width: columnWidths[i],
                          borderLeft: 1,
                          borderRight: i === 6 ? 1 : 0,
                          textAlign: i === 6 ? 'right' : 'center',
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
                style={{ ...styles.cell, width: '88%', borderLeft: 1, fontFamily: 'Roboto-Bold' }}
              >
                Total Amount (USD)
              </Text>
              <Text
                style={{
                  ...styles.cell,
                  width: columnWidths[6],
                  borderLeft: 1,
                  borderRight: 1,
                  textAlign: 'right',
                  fontFamily: 'Roboto-Bold',
                }}
              >
                {fCurrency(
                  currentData?.Details?.reduce(
                    (total, item) => total + (item.TotalAmount || 0),
                    0
                  ) || 0
                )}
              </Text>
            </View>
          </View>

          {/* Payment Terms - Only show for Independent, Quotation, and PI (not RnD) */}
          {currentData?.isRND !== 'R' && (
            <View style={{ marginTop: 30 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text
                  style={{
                    fontFamily: 'Roboto-Bold',
                    fontSize: 10,
                    width: '25%',
                    minWidth: 120,
                  }}
                >
                  Payment Terms:
                </Text>
                <View
                  style={{
                    borderBottom: '1px solid #000',
                    flex: 1,
                    paddingBottom: 2,
                    marginLeft: 10,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Roboto-Regular',
                      fontSize: 10,
                    }}
                  >
                    {currentData?.Payment_Term || '-'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Amount in Words (USD) */}
          <View style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text
                style={{
                  fontFamily: 'Roboto-Bold',
                  fontSize: 10,
                  width: '25%',
                  minWidth: 120,
                }}
              >
                Total Amount in Words (USD):
              </Text>
              <View
                style={{
                  borderBottom: '1px solid #000',
                  flex: 1,
                  paddingBottom: 2,
                  marginLeft: 10,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Roboto-Regular',
                    fontSize: 9,
                    lineHeight: 1.2,
                  }}
                >
                  {amountToWords(
                    currentData?.Details?.reduce(
                      (total, item) => total + (item.TotalAmount || 0),
                      0
                    ).toFixed(2) || 0
                  )}
                </Text>
              </View>
            </View>
          </View>

          {/* Amount in Words (BDT) */}
          <View style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text
                style={{
                  fontFamily: 'Roboto-Bold',
                  fontSize: 10,
                  width: '25%',
                  minWidth: 120,
                }}
              >
                Total Amount in Words (BDT):
              </Text>
              <View
                style={{
                  borderBottom: '1px solid #000',
                  flex: 1,
                  paddingBottom: 2,
                  marginLeft: 10,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Roboto-Regular',
                    fontSize: 9,
                    lineHeight: 1.2,
                  }}
                >
                  {amountToWordsInBDT(
                    currentData?.Details?.reduce(
                      (total, item) => total + (item.TotalAmountinBDT || 0),
                      0
                    ).toFixed(2) || 0
                  )}
                </Text>
              </View>
            </View>
          </View>

          {/* Remarks Section */}
          {FilteredRemarks.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <View
                style={{
                  padding: 5,
                  fontFamily: 'Roboto-Bold',
                  fontSize: 12,
                  backgroundColor: '#f0f0f0',
                  marginBottom: 5,
                }}
              >
                <Text>Remarks</Text>
              </View>
              <View style={{ paddingLeft: 10 }}>
                {Array.from(FilteredRemarks).map((c, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      marginBottom: 5,
                      lineHeight: 1.5,
                      fontSize: 10,
                      fontFamily: 'Roboto-Regular',
                    }}
                  >
                    <Text style={{ width: 20, fontFamily: 'Roboto-Bold' }}>{index + 1}.</Text>
                    <Text style={{ flex: 1 }}>{c}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Clauses */}
          {clauses && clauses.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <View
                style={{
                  padding: 5,
                  fontFamily: 'Roboto-Bold',
                  fontSize: 12,
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

          {/* Signature */}
          <View
            style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 5, marginTop: 50 }}
          >
            {currentData?.SupplierSignature && (
              <Image
                style={{ height: 75, width: 120, objectFit: 'contain' }}
                src={currentData?.SupplierSignature}
              />
            )}
          </View>

          {/* Acceptance */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 5,
              marginTop: 20,
            }}
          >
            <View style={{ borderTop: 1, paddingTop: 5 }}>
              <Text>Customer Acceptance</Text>
            </View>
            <View style={{ borderTop: 1, paddingTop: 5 }}>
              <Text>Seller Acceptance</Text>
            </View>
          </View>

          {/* Status Section - Conditional Styling */}
          <View
            style={{
              marginTop: 10,
              marginBottom: 15,
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            {/* Remarks Box - Left Side (50%) */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Roboto-Regular', fontSize: 12, marginBottom: 5 }}>
                Remarks
              </Text>
              <View style={{ border: 1, borderColor: '#000', padding: 10, minHeight: 40 }}>
                <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular' }}>
                  {currentData?.Remarks || '-'}
                </Text>
              </View>
            </View>

            {/* Status Box - Right Side (50%) */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Roboto-Regular', fontSize: 12, marginBottom: 5 }}>
                Status
              </Text>
              <View style={{ border: 1, borderColor: '#000', padding: 10, minHeight: 40 }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: 'Roboto-Regular',
                    color:
                      currentData?.Status === 'Approved'
                        ? '#2e7d32'
                        : currentData?.Status === 'Pending'
                          ? '#c62828'
                          : '#000',
                  }}
                >
                  {currentData?.Status || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer} fixed>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text>Powered by : ITG Technology Company | </Text>
                <Link src="https://www.itgllc.ae/" style={{ textDecoration: 'none' }}>
                  <Text>Visit www.itgllc.ae</Text>
                </Link>
              </View>
              <Text
                render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
              />
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

// Font Registration
Font.register({ family: 'book-antiqua-bold', src: '/fonts/book-antiqua-bold.ttf' });
Font.register({ family: 'Century Gothic', src: '/fonts/Century Gothic.ttf' });
Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf' });
Font.register({ family: 'Roboto-Medium', src: '/fonts/Roboto-Medium.ttf' });
Font.register({ family: 'Roboto-Regular', src: '/fonts/Roboto-Regular.ttf' });

SampleReport.propTypes = {
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

export default SampleReport;
