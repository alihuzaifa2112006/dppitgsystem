// components/PiReport.js

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
import { amountToWords } from 'src/utils/amountToWords';
import { fDate } from 'src/utils/format-time';
import { fCurrency, fNumber } from 'src/utils/format-number';
import { APP_API_STORAGE } from 'src/config-global';
import { Get } from 'src/api/apibasemethods';

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 120, // Increased to accommodate footer
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
    fontSize: 10,
    textAlign: 'center',
    borderBottom: 1,
    borderLeft: 1,
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

const columnWidths = ['5%', '10%', '30%', '10%', '15%', '10%', '10%', '10%'];
const columnWidthsWithCones = ['5%', '10%', '25%', '8%', '12%', '10%', '8%', '10%', '12%'];

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
const TableHeaderWithCones = () => (
  <View style={styles.tableHeader} wrap={false}>
    {[
      { label: 'SL', fontSize: 10 },
      { label: 'Yarn Type', fontSize: 10 },
      { label: 'Composition', fontSize: 10 },
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
          borderLeft: 1,
          borderRight: i === 8 ? 1 : 0,
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

function groupClausesByCategory(clauses) {
  // First, extract clauses with categories
  const categorized = clauses.filter((c) => c.ClausesCategory && c.ClausesCategory !== '');

  // Group them by category
  const grouped = categorized.reduce((acc, clause) => {
    const category = clause.ClausesCategory;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(clause);
    return acc;
  }, {});

  // Convert to array format
  const result = Object.keys(grouped).map((category) => ({
    category,
    clauses: grouped[category],
  }));

  // Add uncategorized clauses at the end
  const uncategorized = clauses.filter((c) => !c.ClausesCategory || c.ClausesCategory === '');
  if (uncategorized.length > 0) {
    result.push({
      category: null,
      clauses: uncategorized,
    });
  }

  return result;
}

const PiDocument = ({
  currentData,
  clauses,
  chunkedItems,
  headerOptions,
  footerOptions,
  shouldShowConesTable,
}) => (
  <Document
    title={`Proforma Invoice - ${currentData?.PINo}`}
    subject="Proforma Report"
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
                <Text>PI No.</Text>
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
                <Text>Proforma Invoice</Text>
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
                    ? fDate(new Date(currentData?.ReApprovalDate))
                    : fDate(new Date(currentData?.PIDate))}
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
                  {/* <View
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
                      {currentData?.HistoryCount}
                    </Text>
                  </View> */}
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
                  { label: 'Company Name :', value: currentData?.WIC_Name },
                  { label: 'Contact Person :', value: currentData?.Contact_Person_Name },
                  { label: 'Address :', value: currentData?.Cust_Address1 },
                  { label: 'Phone :', value: currentData?.Cust_Landline_No },
                  { label: 'Email :', value: currentData?.Cust_Onboarding_Email },
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
                  { label: 'Contact Person :', value: '-' },
                  { label: 'Address :', value: currentData?.End_Cus_Address || '-' },
                  { label: 'Phone :', value: currentData?.End_Cus_Phone || '-' },
                  { label: 'Email :', value: currentData?.End_Cus_Email || '-' },
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
          {currentData?.Details.some((item) => item.ConesQty > 0) ? (
            <View>
              <TableHeaderWithCones />
              {chunk.map((item, idx) => (
                <View key={idx} style={styles.tableRow} wrap={false}>
                  {[
                    chunkIndex * (chunkIndex === 0 ? firstPageLimit : otherPagesLimit) + idx + 1,
                    item?.Yarn_Type,
                    item?.Composition_Name,
                    item?.Yarn_Count_Name,
                    `${item?.ColorName} - ${item?.Color_Code}`,
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
                        borderLeft: 1,
                        borderRight: i === 8 ? 1 : 0,
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
          ) : (
            // Original table without ConesQty
            <View>
              <TableHeader />
              {chunk.map((item, idx) => (
                <View key={idx} style={styles.tableRow} wrap={false}>
                  {[
                    chunkIndex * (chunkIndex === 0 ? firstPageLimit : otherPagesLimit) + idx + 1,
                    item?.Yarn_Type,
                    item?.Composition_Name,
                    item?.Yarn_Count_Name,
                    `${item?.ColorName} - ${item?.Color_Code}`,
                    `${fNumber(item.Quantity)} ${item.UOMName}`,
                    `${fCurrency(item.UnitPrice)}`,
                    `${fCurrency(item.UnitPrice * item.Quantity)}`,
                  ].map((val, i) => (
                    <View
                      key={i}
                      style={{
                        ...styles.cell,
                        width: columnWidths[i],
                        borderLeft: 1,
                        borderRight: i === 7 ? 1 : 0,
                        justifyContent: 'center',
                        minHeight: 20,
                      }}
                    >
                      <Text
                        style={{
                          textAlign: i === 7 ? 'right' : 'center',
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
                {/* Grand Total Label - width adjusts based on table type */}
                <View
                  style={{
                    ...styles.cell,
                    width: currentData?.Details.some((item) => item.ConesQty > 0) ? '40%' : '50%',
                    borderLeft: 1,
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: 'Roboto-Bold', textAlign: 'center' }}>
                    Grand Total
                  </Text>
                </View>

                {/* Conditional Cones Total - only shown when needed */}
                {/* Empty cells to maintain alignment */}
                <View style={{ ...styles.cell, width: '10%', borderLeft: 0 }} />
                <View style={{ ...styles.cell, width: '10%', borderLeft: 0 }} />

                {/* Quantity Total */}
                <View
                  style={{
                    ...styles.cell,
                    width: '10%',
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
                {currentData?.Details.some((item) => item.ConesQty > 0) && (
                  <View
                    style={{
                      ...styles.cell,
                      width: '8%',
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
                <View style={{ ...styles.cell, width: '10%', justifyContent: 'center' }} />

                {/* Amount Total */}
                <View
                  style={{
                    ...styles.cell,
                    width: currentData?.Details.some((item) => item.ConesQty > 0) ? '12%' : '10%',
                    borderRight: 1,
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ textAlign: 'right', fontFamily: 'Roboto-Bold' }}>
                    {fCurrency(
                      currentData?.Details.reduce(
                        (total, item) => total + item.Total_Amount,
                        0
                      ).toFixed(2)
                    )}
                  </Text>
                </View>
              </View>
              {/* Additional Information */}
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
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '70%' }}>
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
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', width: '70%' }}>
                  <Text style={{ fontFamily: 'Roboto-Bold', marginRight: 5, fontSize: 12 }}>
                    Total Amount (in Words):
                  </Text>
                  <View
                    style={{ borderBottom: 1, flex: 1, paddingBottom: 1, borderColor: '#000000' }}
                  >
                    <Text style={{ fontFamily: 'Roboto-Regular' }}>
                      {amountToWords(
                        currentData?.Details.reduce(
                          (total, item) => total + item.Total_Amount,
                          0
                        ).toFixed(2) || 0
                      )}
                    </Text>
                  </View>
                </View>
              </View>

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
    PIDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    ReApprovalDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    InitiativeName: PropTypes.string,
    WIC_Name: PropTypes.string,
    Contact_Person_Name: PropTypes.string,
    Cust_Address1: PropTypes.string,
    Cust_Landline_No: PropTypes.string,
    Cust_Onboarding_Email: PropTypes.string,
    End_Cust_Name: PropTypes.string,
    End_Cus_Address: PropTypes.string,
    End_Cus_Phone: PropTypes.string,
    End_Cus_Email: PropTypes.string,
    Payment_Term: PropTypes.string,
    Payment_TermID: PropTypes.number,
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
        ColorName: PropTypes.string,
        Color_Code: PropTypes.string,
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
    PIDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    ReApprovalDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    InitiativeName: PropTypes.string,
    ApplyForReapproval : PropTypes.bool,
    HistoryCount: PropTypes.number,
    WIC_Name: PropTypes.string,
    Contact_Person_Name: PropTypes.string,
    Cust_Address1: PropTypes.string,
    Cust_Landline_No: PropTypes.string,
    Cust_Onboarding_Email: PropTypes.string,
    End_Cust_Name: PropTypes.string,
    End_Cus_Address: PropTypes.string,
    End_Cus_Phone: PropTypes.string,
    End_Cus_Email: PropTypes.string,
    Payment_Term: PropTypes.string,
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
        ColorName: PropTypes.string,
        Color_Code: PropTypes.string,
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
};

PiDocument.defaultProps = {
  headerOptions: {
    showHeaderInfo: true,
  },
  footerOptions: {
    showSignatures: true,
  },
};
