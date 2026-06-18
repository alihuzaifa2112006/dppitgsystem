import {
  View,
  Text,
  Page,
  Font,
  Document,
  PDFViewer,
  StyleSheet,
  Image,
  Link,
} from '@react-pdf/renderer';
import React from 'react';
import PropTypes from 'prop-types';
import { fDate, fDateTime } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

// ==================== MAIN COMPONENT ====================
const RTReportPDF = ({ currentData }) => {
  // ----------- Handle API: single report object with Details & WasteDetails arrays -----------
  const Master = currentData && typeof currentData === 'object' && !Array.isArray(currentData)
    ? currentData
    : Array.isArray(currentData) && currentData[0]
      ? currentData[0]
      : {};
  const Details = Array.isArray(Master.Details) ? Master.Details : [];
  const WasteDetails = Array.isArray(Master.WasteDetails) ? Master.WasteDetails : [];

  // ----------- Font Registration -----------
  Font.register({ family: 'Century Gothic', src: '/fonts/Century Gothic.ttf' });
  Font.register({ family: 'Roboto-Bold', src: '/fonts/Roboto-Bold.ttf' });
  Font.register({ family: 'Roboto-Medium', src: '/fonts/Roboto-Medium.ttf' });
  Font.register({ family: 'Roboto-Regular', src: '/fonts/Roboto-Regular.ttf' });

  const uom = Master.UOMName || 'KG';

  // ----------- Styles -----------
  const styles = StyleSheet.create({
    page: {
      paddingTop: 10,
      paddingBottom: 50,
      paddingHorizontal: 30,
      fontSize: 10,
      fontFamily: 'Century Gothic',
      color: '#000000',
    },
    header: {
      marginBottom: 15,
      borderBottom: 1,
      borderColor: '#000000',
      paddingBottom: 10,
    },
    sectionTitle: {
      fontSize: 12,
      fontFamily: 'Roboto-Bold',
      marginVertical: 8,
      paddingBottom: 3,
      borderBottom: 1,
      borderColor: '#000000',
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
      borderBottom: 1,
      borderColor: '#000000',
      paddingBottom: 10,
    },
    grnInfo: { flex: 1, textAlign: 'left' },
    centerTitle: { flex: 2, textAlign: 'center' },
    dateInfo: { flex: 1, textAlign: 'right' },
    infoContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    infoContent: {
      border: 1,
      borderColor: '#000000',
      borderRadius: 3,
      // minHeight: 140,
    },
    infoHeader: {
      flexDirection: 'row',
      borderBottom: 1,
      borderColor: '#000000',
      padding: 5,
      backgroundColor: '#f0f0f0',
    },
    infoHeaderText: {
      flex: 1,
      textAlign: 'center',
      fontFamily: 'Roboto-Bold',
      fontSize: 11,
    },
    infoRowInner: {
      flexDirection: 'row',
      borderBottom: 1,
      borderColor: '#e0e0e0',
      paddingVertical: 5,
      paddingHorizontal: 10,
    },
    infoLabelInner: { flex: 1, fontFamily: 'Roboto-Medium' },
    infoValueInner: { flex: 1, textAlign: 'left' },
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
        <Image source="/logo/Simco(CMYK).png" style={{ height: 35, width: 130 }} />
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 18, fontFamily: 'Roboto-Bold' }}>
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
        <Image source="/logo/CYCLO(CMYK).png" style={{ height: 40, width: 100 }} />
      </View>
    </View>
  );


  // ==================== RETURN ====================
  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document title={`PRODUCTION REPORT - ${Master.Line_No}`}>
        <Page size='A3' style={styles.page}>
          <Header />

          <View style={styles.topRow}>
            <View style={styles.grnInfo}>
              <Text
                style={{
                  fontFamily: 'Roboto-Bold',
                  fontSize: 10,
                  marginTop: 5,
                  textAlign: 'left',
                  textTransform: 'uppercase',
                }}
              >
                Production No: {Master.PDONO || '-'}
              </Text>
            </View>
            <View style={styles.centerTitle}>
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: 'Roboto-Bold',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  marginBottom: 5,
                }}
              >
                MARGASA Production Report
              </Text>
            </View>
            <View style={styles.dateInfo}>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: 'Roboto-Bold',
                  marginTop: 3,
                }}
              >
                Report Date: {fDate(Master.RptDate)}
              </Text>
            </View>
          </View>

          <View style={[styles.infoContainer, { width: '100%' }]}>
            <View style={{ width: '100%' }}>
              <View style={[styles.infoContent, { width: '100%' }]}>
                <View style={styles.infoHeader}>
                  <Text style={styles.infoHeaderText}>Received Item Info</Text>
                </View>

                {[
                  ['Line No', Master.Line_No ?? '-', false],
                  ['Shift Name', Master.ShiftName ?? '-', false],
                ].map(([label, value, showUom], i) => (
                  <View key={i} style={[styles.infoRowInner, { width: '100%' }]}>
                    <Text style={styles.infoLabelInner}>{label}:</Text>
                    <Text style={styles.infoValueInner}>
                      {value ? `${value}${showUom && uom ? ` ${uom}` : ''}` : '-'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Received Item Detail</Text>

          <View style={{ border: 1, borderColor: '#000', marginTop: 10 }} wrap>
            <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0' }}>
              {['Challan / Req No', 'Sorted Item Code', 'Item Description'].map((col, i) => (
                <Text
                  key={col}
                  style={{
                    width: ['30%', '22%', '48%'][i],
                    padding: 4,
                    fontFamily: 'Roboto-Bold',
                    fontSize: 8,
                    borderRight: i !== 2 ? 1 : 0,
                    borderColor: '#000',
                    textAlign: 'center',
                  }}
                >
                  {col}
                </Text>
              ))}
            </View>

            {Details.length === 0 ? (
              <View style={{ flexDirection: 'row', borderTop: 1, borderColor: '#000', padding: 6 }}>
                <Text style={{ fontSize: 8, width: '100%', textAlign: 'center' }}>No details</Text>
              </View>
            ) : (
              Details.map((detail, idx) => (
                <View key={detail.DetailID || idx} style={{ flexDirection: 'row', borderTop: 1, borderColor: '#000' }}>
                  <Text
                    style={{
                      width: '30%',
                      padding: 4,
                      fontSize: 8,
                      borderRight: 1,
                      textAlign: 'center',
                    }}
                  >
                    {detail.ChallanNo || detail.ReqCode || detail.TransferNo || '-'}
                  </Text>
                  <Text
                    style={{
                      width: '22%',
                      padding: 4,
                      fontSize: 8,
                      borderRight: 1,
                      textAlign: 'center',
                    }}
                  >
                    {detail.SortedItemCode || '-'}
                  </Text>
                  <Text
                    style={{
                      width: '48%',
                      padding: 4,
                      fontSize: 8,
                      textAlign: 'left',
                    }}
                  >
                    {detail.SortedItemDescription || '-'}
                  </Text>
                </View>
              ))
            )}
          </View>

          <Text style={styles.sectionTitle}>Produced Item (Report Summary)</Text>

          <View style={{ border: 1, borderColor: '#000', marginTop: 10 }} wrap>
            <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0' }}>
              {[
                'Inv Type',
                'Category',
                'Sub Cat',
                'Color / Spare',
                'Item Code',
                'Item Description',
                'Total Bale',
                'MC Running',
                'Production HR',
                'Total Weight',
                'UOM',
              ].map((col, i) => (
                <Text
                  key={col}
                  style={{
                    width: ['8%', '8%', '10%', '12%', '14%', '18%', '8%', '8%', '8%', '8%', '6%'][i],
                    padding: 4,
                    fontFamily: 'Roboto-Bold',
                    fontSize: 8,
                    borderRight: i !== 10 ? 1 : 0,
                    borderColor: '#000',
                    textAlign: 'center',
                  }}
                >
                  {col}
                </Text>
              ))}
            </View>
            <View style={{ flexDirection: 'row', borderTop: 1, borderColor: '#000' }}>
              <Text style={{ width: '8%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'center' }}>
                {Master.InvTypeName || '-'}
              </Text>
              <Text style={{ width: '8%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'center' }}>
                {Master.CatName || '-'}
              </Text>
              <Text style={{ width: '10%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'center' }}>
                {Master.SubCatName || '-'}
              </Text>
              <Text style={{ width: '12%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'center' }}>
                {[Master.ColorName, Master.SpAreaName].filter(Boolean).join(' / ') || '-'}
              </Text>
              <Text style={{ width: '14%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'center' }}>
                {Master.SFGItemCode || '-'}
              </Text>
              <Text style={{ width: '18%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'left' }}>
                {Master.SFGItemDescription || '-'}
              </Text>
              <Text style={{ width: '8%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'right' }}>
                {fNumber(Master.Total_Bale ?? Master.Bale)}
              </Text>
              <Text style={{ width: '8%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'right' }}>
                {fNumber(Master.Total_MC_Running)}
              </Text>
              <Text style={{ width: '8%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'right' }}>
                {fNumber(Master.Total_Production_HR)}
              </Text>
              <Text style={{ width: '8%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'right' }}>
                {fNumber(Master.Total_Weight ?? Master.Production)}
              </Text>
              <Text style={{ width: '6%', padding: 4, fontSize: 8 }}>
                {Master.UOMName || uom}
              </Text>
            </View>
          </View>

          {/* Details (Requisition/Transfer) totals per line - optional summary */}
          {Details.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Details (Requisition / Transfer Lines)</Text>
              <View style={{ border: 1, borderColor: '#000', marginTop: 10 }} wrap>
                <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0' }}>
                  {['Challan No', 'Sorted Item', 'Bale', 'Weight', 'MC Running', 'Production HR'].map((col, i) => (
                    <Text
                      key={col}
                      style={{
                        width: ['25%', '35%', '10%', '12%', '10%', '8%'][i],
                        padding: 4,
                        fontFamily: 'Roboto-Bold',
                        fontSize: 8,
                        borderRight: i !== 5 ? 1 : 0,
                        borderColor: '#000',
                        textAlign: 'center',
                      }}
                    >
                      {col}
                    </Text>
                  ))}
                </View>
                {Details.map((detail, idx) => (
                  <View key={detail.DetailID || idx} style={{ flexDirection: 'row', borderTop: 1, borderColor: '#000' }}>
                    <Text style={{ width: '25%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'center' }}>
                      {detail.ChallanNo || detail.ReqCode || detail.TransferNo || '-'}
                    </Text>
                    <Text style={{ width: '35%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'left' }}>
                      {detail.SortedItemDescription || detail.SortedItemCode || '-'}
                    </Text>
                    <Text style={{ width: '10%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'right' }}>
                      {fNumber(detail.TotalBale)}
                    </Text>
                    <Text style={{ width: '12%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'right' }}>
                      {fNumber(detail.TotalWeight)}
                    </Text>
                    <Text style={{ width: '10%', padding: 4, fontSize: 8, borderRight: 1, textAlign: 'right' }}>
                      {fNumber(detail.Detail_MC_Running)}
                    </Text>
                    <Text style={{ width: '8%', padding: 4, fontSize: 8, textAlign: 'right' }}>
                      {fNumber(detail.Detail_Production_HR)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Waste Details Section */}
          {WasteDetails.length > 0 && (
            <View style={{ marginTop: 15, marginBottom: 15 }}>
              <Text style={styles.sectionTitle}>Waste Details</Text>
              <View style={{ border: 1, borderColor: '#000', marginTop: 10 }}>
                <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0' }}>
                  {['Waste Sub Category', 'Item Code', 'Item Description', 'Waste Qty'].map((col, i) => (
                    <Text
                      key={col}
                      style={{
                        width: ['20%', '18%', '42%', '20%'][i],
                        padding: 4,
                        fontFamily: 'Roboto-Bold',
                        fontSize: 8,
                        borderRight: i !== 3 ? 1 : 0,
                        borderColor: '#000',
                        textAlign: 'center',
                      }}
                    >
                      {col}
                    </Text>
                  ))}
                </View>
                {WasteDetails.map((waste, wasteIdx) => (
                  <View
                    key={waste.WasteItemID ? `${waste.WasteItemID}-${wasteIdx}` : wasteIdx}
                    style={{ flexDirection: 'row', borderTop: 1, borderColor: '#000' }}
                  >
                    <Text
                      style={{
                        width: '20%',
                        padding: 4,
                        fontSize: 8,
                        borderRight: 1,
                        textAlign: 'center',
                      }}
                    >
                      {waste.WasteSubCatName || '-'}
                    </Text>
                    <Text
                      style={{
                        width: '18%',
                        padding: 4,
                        fontSize: 8,
                        borderRight: 1,
                        textAlign: 'center',
                      }}
                    >
                      {waste.WasteItemCode || '-'}
                    </Text>
                    <Text
                      style={{
                        width: '42%',
                        padding: 4,
                        fontSize: 8,
                        borderRight: 1,
                        textAlign: 'left',
                      }}
                    >
                      {waste.WasteItemDescription || '-'}
                    </Text>
                    <Text
                      style={{
                        width: '20%',
                        padding: 4,
                        fontSize: 8,
                        textAlign: 'right',
                      }}
                    >
                      {fNumber(waste.WasteQty || 0)} {waste.WasteUOMName || uom}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}



          {Master.Remarks && (
            <View style={{ marginTop: 10, marginBottom: 15 }}>
              <Text style={styles.sectionTitle}>Remarks</Text>
              <View style={{ border: 1, borderColor: '#000', padding: 10, minHeight: 40 }}>
                <Text style={{ fontSize: 10, fontFamily: 'Roboto-Regular' }}>{Master.Remarks}</Text>
              </View>
            </View>
          )}

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

// ==================== PROPTYPES ====================
RTReportPDF.propTypes = {
  currentData: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

export default RTReportPDF;
