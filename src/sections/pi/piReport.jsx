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
} from '@react-pdf/renderer';
import PropTypes from 'prop-types';
import { amountToWords, amountinBDTWords } from 'src/utils/amountToWords';
import { fDate } from 'src/utils/format-time';
import { fCurrency, fNumber } from 'src/utils/format-number';
import { APP_API_STORAGE } from 'src/config-global';
import { Get } from 'src/api/apibasemethods';
import { convertUSDtoBDT } from 'src/utils/BDTtoUSD';

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 120,
    paddingHorizontal: 30,
    fontSize: 10,
    fontFamily: 'Roboto-Regular',
  },
  header: {
    marginBottom: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
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
    borderLeft: 1,
    borderRight: 1,
    flexDirection: 'row',
    backgroundColor: '#eee',
    fontWeight: 'bold',
    fontSize: 7,
    fontFamily: 'Roboto-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderLeft: 1,
    borderRight: 1,
  },
  cell: {
    padding: 3,
    fontSize: 10,
    textAlign: 'center',
    borderBottom: 1,
    borderRight: 1,
    borderColor: '#000',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 5,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'black',
  },
});

const columnWidths = ['5%', '10%', '25%', '10%', '8%', '12%', '10%', '10%', '10%'];
const columnWidthsWithCones = ['5%', '10%', '20%', '10%', '8%', '12%', '8%', '8%', '10%', '9%'];

// Header Component
const Header = () => (
  <View style={styles.header} fixed>
    {/* Logo Section */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View>
        <Image source="/logo/Simco(CMYK).png" style={{ height: 35, width: 130 }} />
      </View>
      <View>
        <Image source="/logo/CYCLO(CMYK).png" style={{ height: 40, width: 100 }} />
      </View>
    </View>

    {/* Company Information */}
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
  </View>
);

// RenderFooter Component
const RenderFooter = ({ currentData, showSignatures = true }) => (
  <View style={styles.footer} fixed>
    {showSignatures && (
      <>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 5,
            marginBottom: 10,
          }}
        >
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'flex-end',
              borderBottom: 1,
            }}
          >
            <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 12, paddingVertical: 5 }}>
              {currentData?.WIC_Name}
            </Text>
          </View>
          {currentData?.SupplierSignature && (
            <Image
              style={{ height: 70, width: 120, objectFit: 'contain', borderBottom: 1 }}
              src={currentData?.SupplierSignature}
            />
          )}
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 22,
            marginTop: 2,
          }}
        >
          <View>
            <Text>Customer Acceptance</Text>
          </View>
          <View>
            <Text>Seller Acceptance</Text>
          </View>
        </View>
      </>
    )}

    {/* Page Number */}
    <Text
      style={styles.pageNumber}
      render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
    />
  </View>
);

const TableHeader = () => (
  <View style={styles.tableHeader} wrap={false}>
    {[
      { label: 'SL', fontSize: 10 },
      { label: 'Yarn Type', fontSize: 10 },
      { label: 'Composition', fontSize: 10 },
      { label: 'Color Ref Code', fontSize: 10 },
      { label: 'Count', fontSize: 10 },
      { label: 'CYCLO Color & Code', fontSize: 10 },
      { label: 'Order Quantity', fontSize: 10 },
      { label: 'Unit Price', fontSize: 10 },
      { label: 'Amount (USD)', fontSize: 10 },
    ].map((col, i) => (
      <View
        key={col.label}
        style={{
          ...styles.cell,
          width: columnWidths[i],
          borderRight: i === 8 ? 0 : 1, // Last cell border removed
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

const TableHeaderWithCones = () => (
  <View style={styles.tableHeader} wrap={false}>
    {[
      { label: 'SL', fontSize: 10 },
      { label: 'Yarn Type', fontSize: 10 },
      { label: 'Composition', fontSize: 10 },
      { label: 'Color Ref Code', fontSize: 10 },
      { label: 'Count', fontSize: 10 },
      { label: 'CYCLO Color & Code', fontSize: 10 },
      { label: 'Order Qty', fontSize: 10 },
      { label: 'No. Of Cones', fontSize: 10 },
      { label: 'Unit Price', fontSize: 10 },
      { label: 'Amount (USD)', fontSize: 10 },
    ].map((col, i) => (
      <View
        key={col.label}
        style={{
          ...styles.cell,
          width: columnWidthsWithCones[i],
          borderRight: i === 9 ? 0 : 1, // Last cell border removed
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

const firstPageLimit = 17;
const otherPagesLimit = 24;

const addSerials = (rows) => rows.map((item, index) => ({ ...item, serial: index + 1 }));

const splitRows = (rows) => {
  const withSerial = addSerials(rows);
  const chunks = [];

  if (withSerial.length <= firstPageLimit) {
    chunks.push(withSerial);
  } else {
    chunks.push(withSerial.slice(0, firstPageLimit));
    let remaining = withSerial.slice(firstPageLimit);

    while (remaining.length > 0) {
      chunks.push(remaining.slice(0, otherPagesLimit));
      remaining = remaining.slice(otherPagesLimit);
    }
  }

  return chunks;
};

const PiDocument = ({
  currentData,
  clauses,
  chunkedItems,
  headerOptions,
  footerOptions,
  shouldShowConesTable,
  conversionRate,
}) => (
  <Document
    title={`${currentData?.PiFor === 'C' ? 'Bill Invoice' : 'Proforma Invoice'} - ${currentData?.PINo}`}
    subject={`${currentData?.PiFor === 'C' ? 'Bill Invoice' : 'Proforma Invoice'}`}
    creator="CYCLO® Cloud"
    author="ITG"
  >
    {chunkedItems.map((chunk, chunkIndex) => (
      <Page key={chunkIndex} size="A3" style={styles.page}>
        {/* Header - show full header info only on first page */}
        <Header />

        {/* Main Content - only show on first page */}
        {chunkIndex === 0 && (
          <>
            {/* PI Information - Only show on first page or when showHeaderInfo is true */}
            <View
              style={{ border: 1, flexDirection: 'row', fontFamily: 'Roboto-Bold', fontSize: 12 }}
            >
              <View style={{ width: '10%', borderRight: 1, padding: 5, alignItems: 'center' }}>
                <Text>{currentData?.PiFor === 'C' ? 'Bill No.' : 'PI No.'}</Text>
              </View>
              <View style={{ width: '20%', borderRight: 1, padding: 5, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Roboto-Regular' }}>{currentData?.PINo}</Text>
              </View>
              <View
                style={{
                  width: '40%',
                  borderRight: 0,
                  padding: 5,
                  alignItems: 'center',
                  backgroundColor: '#f5f5f5',
                }}
              >
                <Text>{currentData?.PiFor === 'C' ? 'Bill Invoice' : 'Proforma Invoice'}</Text>
              </View>
              <View
                style={{
                  width: '10%',
                  borderRight: 1,
                  padding: 5,
                  alignItems: 'center',
                  borderLeft: 1,
                }}
              >
                <Text>Date :</Text>
              </View>
              <View style={{ width: '20%', padding: 5, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Roboto-Regular' }}>
                  {currentData?.ReApprovalDate
                    ? fDate(currentData?.ReApprovalDate)
                    : fDate(currentData?.PIDate)}
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                fontFamily: 'Roboto-Bold',
                fontSize: 12,
                marginTop: 10,
              }}
            >
              {currentData?.ApplyForReapproval ? (
                <>
                  <View
                    style={{
                      width: '30%',
                      borderRight: 1,
                      borderLeft: 1,
                      borderBottom: 1,
                      borderTop: 1,
                      padding: 5,
                      alignItems: 'center',
                    }}
                  >
                    <Text>Revised-{currentData?.HistoryCount}</Text>
                  </View>
                </>
              ) : (
                <View
                  style={{
                    width: '30%',
                    padding: 5,
                    alignItems: 'center',
                  }}
                />
              )}
              <View
                style={{
                  width: '40%',
                  padding: 5,
                  alignItems: 'center',
                }}
              />
              <View
                style={{
                  width: '10%',
                  borderRight: 1,
                  borderLeft: 1,
                  borderBottom: 1,
                  borderTop: 1,
                  padding: 5,
                  alignItems: 'center',
                }}
              >
                <Text>Initiative :</Text>
              </View>
              <View
                style={{
                  width: '20%',
                  padding: 5,
                  borderRight: 1,
                  borderBottom: 1,
                  borderTop: 1,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: 'Roboto-Regular' }}>
                  {currentData?.InitiativeName || ''}
                </Text>
              </View>
            </View>

            {/* Customer and Buyer Details */}
            <View
              style={{
                marginTop: 10,
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

                {[
                  { label: 'Company Name :', value: currentData?.WIC_Name || '-' },
                  {
                    label: 'Contact Person :',
                    value:
                      currentData?.WIC_Contacts.length > 0
                        ? currentData?.WIC_Contacts[0]?.Contact_Name
                        : '-',
                  },
                  { label: 'Address :', value: currentData?.WIC_Address || '-' },
                  { label: 'Phone :', value: currentData?.WIC_Phone || '-' },
                  { label: 'Email :', value: currentData?.WIC_Emial || '-' },
                ].map((item, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      borderBottom: index < 4 ? 1 : 0,
                    }}
                  >
                    <View
                      style={{
                        borderRight: 1,
                        padding: 5,
                        backgroundColor: '#f5f5f5',
                        width: '30%',
                        minHeight: 24,
                      }}
                    >
                      <Text style={{ fontFamily: 'Roboto-Bold' }}>{item.label}</Text>
                    </View>
                    <View
                      style={{
                        padding: 5,
                        width: '70%',
                        minHeight: 24,
                        justifyContent: 'center',
                      }}
                    >
                      <Text>{item.value || '-'}</Text>
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

                {[
                  { label: 'Company Name :', value: currentData?.End_Cust_Name || '-' },
                  {
                    label: 'Contact Person :',
                    value: '-',
                  },
                  { label: 'Address :', value: '-' },
                  { label: 'Phone :', value: '-' },
                  { label: 'Email :', value: '-' },
                  // {
                  //   label: 'Contact Person :',
                  //   value:
                  //     currentData?.EndCustomer_Contacts?.length > 0
                  //       ? currentData?.EndCustomer_Contacts[0]?.Contact_Name
                  //       : '-',
                  // },
                  // { label: 'Address :', value: currentData?.End_Cus_Address || '-' },
                  // { label: 'Phone :', value: currentData?.End_Cus_Phone || '-' },
                  // { label: 'Email :', value: currentData?.End_Cus_Email || '-' },
                ].map((item, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      borderBottom: index < 4 ? 1 : 0,
                    }}
                  >
                    <View
                      style={{
                        borderRight: 1,
                        padding: 5,
                        backgroundColor: '#f5f5f5',
                        width: '30%',
                        minHeight: 24,
                      }}
                    >
                      <Text style={{ fontFamily: 'Roboto-Bold' }}>{item.label}</Text>
                    </View>
                    <View
                      style={{
                        padding: 5,
                        width: '70%',
                        minHeight: 24,
                        justifyContent: 'center',
                      }}
                    >
                      <Text>{item.value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Table Content */}
        <View>
          {shouldShowConesTable ? (
            <View>
              <TableHeaderWithCones />
              {chunk.map((item, idx) => (
                <View key={idx} style={styles.tableRow} wrap={false}>
                  {[
                    item?.serial,
                    item?.Yarn_Type,
                    item?.Composition_Name,
                    item?.ColorRefCode || '-',
                    item?.Yarn_Count_Name,
                    item?.Color_and_Code,
                    `${fNumber(item.Quantity)} ${item.UOMName}`,
                    item.ConesQty > 0 ? fNumber(item.ConesQty) : '0',
                    `${fCurrency(item.UnitPrice)}`,
                    `${fCurrency(item.UnitPrice * item.Quantity)}`,
                  ].map((val, i) => (
                    <View
                      key={i}
                      style={{
                        ...styles.cell,
                        width: columnWidthsWithCones[i],
                        borderRight: i === 9 ? 0 : 1,
                        justifyContent: 'center',
                        minHeight: 20,
                      }}
                    >
                      <Text
                        style={{
                          textAlign: i === 9 ? 'right' : 'center',
                          fontSize: 10,
                        }}
                        wrap
                      >
                        {val}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : (
            // Original table without ConesQty
            <View>
              <TableHeader />
              {chunk.map((item, idx) => (
                <View key={idx} style={styles.tableRow} wrap={false}>
                  {[
                    item?.serial,
                    item?.Yarn_Type,
                    item?.Composition_Name,
                    item?.ColorRefCode || '-',
                    item?.Yarn_Count_Name || '-',
                    item?.Color_and_Code,
                    `${fNumber(item.Quantity)} ${item.UOMName}`,
                    `${fCurrency(item.UnitPrice)}`,
                    `${fCurrency(item.UnitPrice * item.Quantity)}`,
                  ].map((val, i) => (
                    <View
                      key={i}
                      style={{
                        ...styles.cell,
                        width: columnWidths[i],
                        borderRight: i === 8 ? 0 : 1,
                        justifyContent: 'center',
                        minHeight: 20,
                      }}
                    >
                      <Text
                        style={{
                          textAlign: i === 8 ? 'right' : 'center',
                          fontSize: 10,
                        }}
                        wrap
                      >
                        {val}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* Show totals only on last page */}
          {chunkIndex === chunkedItems.length - 1 && (
            <>
              {/* Totals Row */}
              <View style={[styles.tableRow, { backgroundColor: '#f5f5f5' }]} wrap={false}>
                {/* Grand Total Label */}
                <View
                  style={{
                    ...styles.cell,
                    width: shouldShowConesTable ? '65%' : '70%',
                    borderRight: 1,
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: 'Roboto-Bold', textAlign: 'center' }}>
                    Grand Total
                  </Text>
                </View>

                {/* Quantity Total */}
                <View
                  style={{
                    ...styles.cell,
                    width: shouldShowConesTable ? '8%' : '10%',
                    borderRight: 1,
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ textAlign: 'center', fontFamily: 'Roboto-Bold' }}>
                    {fNumber(
                      currentData?.Details.reduce((total, item) => total + item.Quantity, 0)
                    )}{' '}
                    {currentData?.Details[0]?.UOMName}
                  </Text>
                </View>

                {/* Cones Total - only shown when needed */}
                {shouldShowConesTable && (
                  <View
                    style={{
                      ...styles.cell,
                      width: '8%',
                      borderRight: 1,
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ textAlign: 'center', fontFamily: 'Roboto-Bold' }}>
                      {fNumber(
                        currentData?.Details.reduce(
                          (total, item) => total + (item.ConesQty || 0),
                          0
                        )
                      )}
                    </Text>
                  </View>
                )}

                {/* Empty cell for Unit Price column */}
                <View
                  style={{
                    ...styles.cell,
                    width: shouldShowConesTable ? '10%' : '10%',
                    borderRight: 1,
                    justifyContent: 'center',
                  }}
                />

                {/* Amount Total */}
                <View
                  style={{
                    ...styles.cell,
                    width: shouldShowConesTable ? '9%' : '10%',
                    borderRight: 0,
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ textAlign: 'right', fontFamily: 'Roboto-Bold' }}>
                    {fCurrency(
                      ( // eslint-disable-next-line
                        currentData?.Details.reduce(
                          (total, item) => total + item.Total_Amount,
                          0
                        )
                      ).toFixed(2)
                    )}
                  </Text>
                </View>
              </View>

              {/* Additional Information */}
              {currentData?.CostFactorID != null &&
                currentData?.CostFactorID !== 1 &&
                (currentData?.CostFactorType?.trim() || Number(currentData?.CostFactorCharges) !== 0) && (
                <View style={{ marginTop: 15, marginRight: 73, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                  {/* eslint-disable-next-line */}
                  <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 12 }}>
                    {currentData?.CostFactorType?.trim()
                      ? `${currentData.CostFactorType}:  ${fCurrency(currentData?.CostFactorCharges)}`
                      : fCurrency(currentData?.CostFactorCharges)}
                  </Text>
                </View>
              )}
              {/* add convertion rate to BDT and BDT amount in words and numbers */}
              <View
                style={{
                  marginTop: 40,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '80%' }}>
                  <Text style={{ fontFamily: 'Roboto-Bold', marginRight: 5, fontSize: 12 }}>
                    Sustainability Certificates:
                  </Text>
                  <View
                    style={{ borderBottom: 1, flex: 1, paddingBottom: 1, borderColor: '#000000' }}
                  >
                    <Text style={{ fontFamily: 'Roboto-Regular' }}>
                      {(() => {
                        const certificates = Array.from(
                          new Set(
                            currentData?.Details.map((x) => x.Sustainability_Name).filter(
                              (name) => name && name !== 'Regular'
                            )
                          )
                        );
                        return certificates.length > 0 ? certificates.join(', ') : '×××';
                      })()}
                    </Text>
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
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '80%' }}>
                  <Text style={{ fontFamily: 'Roboto-Bold', marginRight: 5, fontSize: 12 }}>
                    Payment Terms:
                  </Text>
                  <View
                    style={{ borderBottom: 1, flex: 1, paddingBottom: 1, borderColor: '#000000' }}
                  >
                    <Text style={{ fontFamily: 'Roboto-Regular' }}>
                      {currentData?.Payment_Term || 'Payment terms not specified'}
                    </Text>
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
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '80%' }}>
                  <Text style={{ fontFamily: 'Roboto-Bold', marginRight: 5, fontSize: 12 }}>
                    Total Amount (USD):
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
                      {fCurrency(
                        ( // eslint-disable-next-line
                          currentData?.Details.reduce( // eslint-disable-next-line
                            (total, item) => total + item.Total_Amount,
                            0 // eslint-disable-next-line
                          ) + (currentData?.CostFactorCharges ?? 0)
                        ).toFixed(2)
                      )}
                    </Text>
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
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '80%' }}>
                  <Text style={{ fontFamily: 'Roboto-Bold', marginRight: 5, fontSize: 12 }}>
                    Total Amount (in Words):
                  </Text>
                  <View
                    style={{ borderBottom: 1, flex: 1, paddingBottom: 1, borderColor: '#000000' }}
                  >
                    <Text style={{ fontFamily: 'Roboto-Regular' }}>
                      {amountToWords(
                        ( // eslint-disable-next-line
                          currentData?.Details.reduce( // eslint-disable-next-line
                            (total, item) => total + item.Total_Amount,
                            0 // eslint-disable-next-line
                          ) + (currentData?.CostFactorCharges ?? 0)
                        ).toFixed(2) || 0
                      )}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Conversion Rate and BDT Amount */}
              {conversionRate > 0 && (
                <>
                  <View
                    style={{
                      marginTop: 15,
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '80%' }}>
                      <Text style={{ fontFamily: 'Roboto-Bold', marginRight: 5, fontSize: 12 }}>
                        Conversion Rate (USD to BDT):
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
                          {fNumber(conversionRate)}
                        </Text>
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
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '80%' }}>
                      <Text style={{ fontFamily: 'Roboto-Bold', marginRight: 5, fontSize: 12 }}>
                        Total Amount (BDT):
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
                          {fNumber(
                            (
                              ( // eslint-disable-next-line
                                currentData?.Details.reduce(
                                  (total, item) => total + item.Total_Amount,
                                  0 // eslint-disable-next-line
                                ) + (currentData?.CostFactorCharges ?? 0)
                                // eslint-disable-next-line
                              ) * conversionRate
                            ).toFixed(2)
                          )}
                        </Text>
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
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '80%' }}>
                      <Text style={{ fontFamily: 'Roboto-Bold', marginRight: 5, fontSize: 12 }}>
                        Amount in Words (BDT):
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
                          {amountinBDTWords(
                            (
                              ( // eslint-disable-next-line
                                currentData?.Details.reduce( // eslint-disable-next-line
                                  (total, item) => total + item.Total_Amount,
                                  0 // eslint-disable-next-line
                                ) + (currentData?.CostFactorCharges ?? 0)
                                // eslint-disable-next-line
                              ) * conversionRate
                            ).toFixed(2)
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                </>
              )}

              {/* Remarks Section */}
              {currentData?.Details?.length > 0 && (
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
                    {currentData?.Details?.map((c, index) => {
                      if (!c?.Remarks || c?.Remarks === 'N/A') return null;
                      return (
                        <View
                          key={c.PIDtlID}
                          style={{
                            flexDirection: 'row',
                            marginBottom: 5,
                            lineHeight: 1.5,
                            fontSize: 10,
                            fontFamily: 'Roboto-Regular',
                          }}
                        >
                          <Text style={{ width: 20, fontFamily: 'Roboto-Bold' }}>{index + 1}.</Text>
                          <Text style={{ flex: 1 }}>{c?.Remarks}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Clauses - Horizontal Layout */}
              {clauses.filter(
                (clause) =>
                  clause.paymentTermID === currentData?.Payment_TermID || clause.paymentTermID === 0
              ).length > 0 && (
                  <View style={{ marginTop: 20 }}>
                    <View
                      style={{
                        padding: 10,
                        fontFamily: 'Roboto-Bold',
                        fontSize: 12,
                        backgroundColor: '#f0f0f0',
                        marginBottom: 10,
                      }}
                    >
                      <Text>TERMS & CONDITIONS:</Text>
                    </View>

                    {/* Group clauses by ClausesCatID */}
                    {Object.entries(
                      clauses
                        .filter(
                          (clause) =>
                            clause.paymentTermID === currentData?.Payment_TermID ||
                            clause.paymentTermID === 0
                        )
                        .reduce((acc, clause) => {
                          const catId = clause.ClausesCatID;
                          if (!acc[catId]) {
                            acc[catId] = {
                              categoryName: clause.ClausesCategory,
                              clauses: [],
                            };
                          }
                          acc[catId].clauses.push(clause);
                          return acc;
                        }, {})
                    ).map(([catId, group]) => (
                      <View key={catId} style={{ flexDirection: 'row', marginLeft: 10 }}>
                        {/* Categories column */}
                        <View style={{ width: '20%' }}>
                          {group.clauses.map((item, index) => (
                            <View key={item.id} style={{ marginBottom: 8 }}>
                              {index === 0 && (
                                <Text
                                  style={{
                                    fontFamily: 'Roboto-Bold',
                                    fontSize: 10,
                                    textAlign: 'left',
                                    paddingRight: 10,
                                  }}
                                >
                                  {group.categoryName}:
                                </Text>
                              )}
                            </View>
                          ))}
                        </View>

                        {/* Clauses column */}
                        <View style={{ width: '80%' }}>
                          {group.clauses.map((item) => (
                            <View key={item.id} style={{ marginBottom: 8, paddingRight: 10 }}>
                              <Text
                                style={{
                                  fontFamily: 'Roboto-Regular',
                                  fontSize: 10,
                                  lineHeight: 1.5,
                                }}
                              >
                                {item.clause}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
            </>
          )}


        </View>

        {/* RenderFooter */}
        <RenderFooter currentData={currentData} showSignatures={footerOptions.showSignatures} />
      </Page>
    ))}
  </Document>
);

const PiReport = ({
  currentData,
  clauses,
  headerOptions = { showHeaderInfo: true },
  footerOptions = { showSignatures: true },
  conversionRate,
}) => {
  const chunkedItems = splitRows(currentData?.Details);
  const shouldShowConesTable = currentData?.Details?.some((item) => item.ConesQty > 0);

  return (
    <>
      <PDFViewer style={{ width: '100%', height: '100vh' }}>
        <PiDocument
          currentData={currentData}
          clauses={clauses}
          chunkedItems={chunkedItems}
          headerOptions={headerOptions}
          footerOptions={footerOptions}
          shouldShowConesTable={shouldShowConesTable}
          conversionRate={conversionRate}
        />
      </PDFViewer>
    </>
  );
};

Font.register({ family: 'book-antiqua-bold', src: '/fonts/book-antiqua-bold.ttf' });
Font.register({ family: 'Century Gothic', src: '/fonts/Century Gothic.ttf' });
Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf' });
Font.register({ family: 'Roboto-Medium', src: '/fonts/Roboto-Medium.ttf' });
Font.register({ family: 'Roboto-Regular', src: '/fonts/Roboto-Regular.ttf' });

export default PiReport;

RenderFooter.propTypes = {
  currentData: PropTypes.shape({
    WIC_Name: PropTypes.string,
    SupplierSignature: PropTypes.string,
  }),
  showSignatures: PropTypes.bool,
};

RenderFooter.defaultProps = {
  currentData: {
    WIC_Name: '',
    SupplierSignature: '',
  },
  showSignatures: true,
};

// ... (keep the rest of your existing code)

PiReport.propTypes = {
  currentData: PropTypes.shape({
    PINo: PropTypes.string,
    PiFor: PropTypes.string,
    PIDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    ReApprovalDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    InitiativeName: PropTypes.string,
    WIC_Name: PropTypes.string,
    Contact_Person_Name: PropTypes.string,
    Cust_Address1: PropTypes.string,
    WIC_Address: PropTypes.string,
    WIC_Phone: PropTypes.string,
    WIC_Emial: PropTypes.string,
    Cust_Landline_No: PropTypes.string,
    Cust_Onboarding_Email: PropTypes.string,
    End_Cust_Name: PropTypes.string,
    End_Cus_Address: PropTypes.string,
    End_Cus_Phone: PropTypes.string,
    End_Cus_Email: PropTypes.string,
    EndCustomer_Contacts: PropTypes.arrayOf(PropTypes.object),
    WIC_Contacts: PropTypes.arrayOf(PropTypes.object),
    Payment_Term: PropTypes.string,
    Payment_TermID: PropTypes.number,
    CostFactorType: PropTypes.string,
    CostFactorID: PropTypes.number,
    CostFactorCharges: PropTypes.number,
    Clauses: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        clause: PropTypes.string.isRequired,
        docName: PropTypes.string,
        isActive: PropTypes.bool,
      })
    ),
    Remarks: PropTypes.arrayOf(
      PropTypes.shape({
        PIDtlID: PropTypes.number,
        Remarks: PropTypes.string,
      })
    ),
    Details: PropTypes.arrayOf(
      PropTypes.shape({
        Yarn_Type: PropTypes.string,
        Composition_Name: PropTypes.string,
        Yarn_Count_Name: PropTypes.string,
        Color_and_Code: PropTypes.string,
        // Color_Code: PropTypes.string,
        Quantity: PropTypes.number,
        UOMName: PropTypes.string,
        UnitPrice: PropTypes.number,
        Total_Amount: PropTypes.number,
        Sustainability_Name: PropTypes.string,
      })
    ),
    SupplierSignature: PropTypes.string,
  }).isRequired,
  clauses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      clause: PropTypes.string.isRequired,
      docName: PropTypes.string,
      isActive: PropTypes.bool,
    })
  ).isRequired,
  headerOptions: PropTypes.shape({
    showHeaderInfo: PropTypes.bool,
  }),
  footerOptions: PropTypes.shape({
    showSignatures: PropTypes.bool,
  }),
  conversionRate: PropTypes.number,
};

PiReport.defaultProps = {
  headerOptions: {
    showHeaderInfo: true,
  },
  footerOptions: {
    showSignatures: true,
  },
};

PiDocument.propTypes = {
  currentData: PropTypes.shape({
    PINo: PropTypes.string,
    PiFor: PropTypes.string,
    PIDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    ReApprovalDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    InitiativeName: PropTypes.string,
    ApplyForReapproval: PropTypes.bool,
    HistoryCount: PropTypes.number,
    WIC_Name: PropTypes.string,
    Contact_Person_Name: PropTypes.string,
    Cust_Address1: PropTypes.string,
    WIC_Address: PropTypes.string,
    WIC_Phone: PropTypes.string,
    WIC_Emial: PropTypes.string,
    Cust_Landline_No: PropTypes.string,
    Cust_Onboarding_Email: PropTypes.string,
    End_Cust_Name: PropTypes.string,
    End_Cus_Address: PropTypes.string,
    End_Cus_Phone: PropTypes.string,
    End_Cus_Email: PropTypes.string,
    EndCustomer_Contacts: PropTypes.arrayOf(PropTypes.object),
    WIC_Contacts: PropTypes.arrayOf(PropTypes.object),
    Payment_Term: PropTypes.string,
    CostFactorType: PropTypes.string,
    CostFactorID: PropTypes.number,
    CostFactorCharges: PropTypes.number,
    Payment_TermID: PropTypes.number,
    Remarks: PropTypes.arrayOf(
      PropTypes.shape({
        PIDtlID: PropTypes.number,
        Remarks: PropTypes.string,
      })
    ),
    Clauses: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        clause: PropTypes.string.isRequired,
        docName: PropTypes.string,
        isActive: PropTypes.bool,
      })
    ),
    Details: PropTypes.arrayOf(
      PropTypes.shape({
        Yarn_Type: PropTypes.string,
        Composition_Name: PropTypes.string,
        Yarn_Count_Name: PropTypes.string,
        Color_and_Code: PropTypes.string,
        // Color_Code: PropTypes.string,
        Quantity: PropTypes.number,
        UOMName: PropTypes.string,
        UnitPrice: PropTypes.number,
        Total_Amount: PropTypes.number,
        Sustainability_Name: PropTypes.string,
      })
    ),
    SupplierSignature: PropTypes.string,
  }).isRequired,
  clauses: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      clause: PropTypes.string.isRequired,
      docName: PropTypes.string,
      isActive: PropTypes.bool,
    })
  ).isRequired,
  shouldShowConesTable: PropTypes.bool,
  chunkedItems: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)).isRequired,
  headerOptions: PropTypes.shape({
    showHeaderInfo: PropTypes.bool,
  }),
  footerOptions: PropTypes.shape({
    showSignatures: PropTypes.bool,
  }),
  conversionRate: PropTypes.number,
};

PiDocument.defaultProps = {
  headerOptions: {
    showHeaderInfo: true,
  },
  footerOptions: {
    showSignatures: true,
  },
};
