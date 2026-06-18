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
import { fDate } from 'src/utils/format-time';

const ClaimPDF = ({ currentData }) => {
  const {
    basicInfo,
    orderItems,
    lotItems,
    statusUpdates,
    audioRecords,
    mediaRecords,
    signatureRecords,
  } = currentData;

  const styles = StyleSheet.create({
    page: {
      paddingTop: 20,
      paddingBottom: 50,
      paddingHorizontal: 30,
      fontSize: 10,
      fontFamily: 'Century Gothic',
      position: 'relative',
    },
    title: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 5,
      textTransform: 'uppercase',
      fontFamily: 'Roboto-Bold',
      color: '#1a3a6c',
    },
    subtitle: {
      fontSize: 12,
      textAlign: 'center',
      marginBottom: 15,
      color: '#666',
      fontFamily: 'Roboto-Medium',
    },
    tableHeader: {
      borderTop: 1,
      flexDirection: 'row',
      backgroundColor: '#1a3a6c',
      color: 'white',
      fontSize: 8,
      fontFamily: 'Roboto-Bold',
    },
    tableRow: {
      flexDirection: 'row',
    },
    cell: {
      padding: 4,
      fontSize: 9,
      textAlign: 'center',
      borderBottom: 1,
      borderLeft: 1,
      borderColor: '#ddd',
    },
    pageNumber: {
      position: 'absolute',
      fontSize: 9,
      bottom: 20,
      left: 0,
      right: 0,
      textAlign: 'center',
      color: '#666',
    },
    sectionTitle: {
      fontSize: 12,
      color: '#1a3a6c',
      fontFamily: 'Roboto-Bold',
      marginVertical: 8,
      paddingBottom: 3,
      borderBottom: 1,
      borderColor: '#1a3a6c',
    },
    infoBox: {
      border: 1,
      borderColor: '#1a3a6c',
      borderRadius: 4,
      fontSize: 10,
      width: '100%',
      marginBottom: 15,
      backgroundColor: '#f9f9f9',
      overflow: 'hidden',
    },
    infoHeader: {
      flexDirection: 'row',
      borderColor: '#1a3a6c',
      borderBottom: 1,
      backgroundColor: '#1a3a6c',
      padding: 5,
    },
    infoHeaderText: {
      flex: 1,
      textAlign: 'center',
      fontFamily: 'Roboto-Bold',
      color: 'white',
      fontSize: 11,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    infoLabel: {
      flex: 1.5,
      padding: 3,
      paddingLeft: 10,
      fontFamily: 'Roboto-Medium',
      color: '#1a3a6c',
    },
    infoValue: {
      flex: 1,
      padding: 3,
      textAlign: 'right',
      paddingRight: 10,
      color: '#333',
    },
    signature: {
      borderTop: 1,
      fontFamily: 'Roboto-Bold',
      marginTop: 20,
      paddingTop: 5,
      width: '40%',
      marginLeft: 'auto',
    },
    detailText: {
      fontSize: 9,
      marginBottom: 3,
      fontFamily: 'Century Gothic',
    },
    statusCard: {
      border: 1,
      borderColor: '#ddd',
      borderRadius: 4,
      padding: 10,
      marginBottom: 12,
      backgroundColor: '#f9f9f9',
    },
    subSectionTitle: {
      fontSize: 10,
      color: '#1a3a6c',
      fontFamily: 'Roboto-Bold',
      marginVertical: 5,
      paddingLeft: 5,
    },
    twoColumnLayout: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    column: {
      width: '48%',
    },
    mediaContainer: {
      width: '30%',
      alignItems: 'center',
      marginBottom: 10,
    },
    mediaBox: {
      width: 80,
      height: 80,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#DDD',
      marginBottom: 5,
    },
    footerText: {
      position: 'absolute',
      fontSize: 8,
      bottom: 8,
      left: 0,
      right: 0,
      textAlign: 'center',
      color: '#666',
    },
    footer: {
      position: 'absolute',
      bottom: 10,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: 9,
      color: '#666',
      paddingTop: 10,
      borderTop: '1 solid #eee',
      marginHorizontal: 30,
    },
  });

  const columnWidths = ['40%', '20%', '20%', '20%'];
  const columnWidths1 = ['20%', '30%', '10%', '20%', '20%'];

  const formatQuantity = (qty) => {
    if (!qty) return '-';

    // Number aur unit ko split karna
    const parts = qty.toString().trim().split(' ');

    const numberPart = parts[0];
    const unitPart = parts.slice(1).join(' ');

    // if (isNaN(numberPart)) return qty;
    if (Number.isNaN(Number(numberPart))) return qty;

    // Number format with commas
    const formattedNumber = new Intl.NumberFormat('en-US').format(Number(numberPart));

    return `${formattedNumber} ${unitPart}`.trim();
  };

  const filteredStatusUpdates = statusUpdates.filter(
    (item) =>
      item.styleNo ||
      item.yarnUsing ||
      item.fabricDesign ||
      item.composition ||
      item.countPly ||
      item.machineGauge ||
      item.suppliedYarnQty ||
      item.processedYarnQty ||
      item.yarnCount ||
      item.proceedQty ||
      item.garmentQty ||
      item.checkedQty ||
      item.defectQty ||
      item.defectPercentage ||
      item.rawMaterialUsageType ||
      item.machineType ||
      item.machineSpeed ||
      item.problem ||
      item.description ||
      item.lotNumbers
  );

  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <Document title="CUSTOMER CLAIM AUDIT REPORT">
        <Page size="A4" style={styles.page}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              {/* Logo Left */}
              <View style={{ flex: 1 }}>
                <Image
                  src="/logo/CYCLO(CMYK).png"
                  style={{ width: 120, height: 40, objectFit: 'contain' }}
                />
              </View>

              {/* Center Title */}
              <View style={{ flex: 3, alignItems: 'center' }}>
                <Text style={{ ...styles.title, fontSize: 14 }}>Customer Claim Audit Report</Text>
                <Text style={{ ...styles.subtitle, fontSize: 10 }}>
                  Comprehensive Quality Assessment Document
                </Text>
                <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 8, color: '#1a3a6c' }}>
                  Report No: {basicInfo.reportNo}
                </Text>
              </View>

              {/* Right Side Empty Space (for balance) */}
              <View style={{ flex: 1 }} />
            </View>

            <Text style={styles.sectionTitle}>Basic Information</Text>
            <View style={styles.infoBox}>
              <View style={styles.infoHeader}>
                <Text style={styles.infoHeaderText}>Dates</Text>
              </View>
              {[
                ['Creation Date', fDate(basicInfo.creationDate)],
                ['Audit Date', fDate(basicInfo.auditDate)],
                ['Last Update', fDate(basicInfo.lastUpdateDate)],
              ].map(([label, value], idx) => (
                <View
                  key={idx}
                  style={{
                    ...styles.infoRow,
                    backgroundColor: idx % 2 === 0 ? '#f5f5f5' : 'white',
                  }}
                >
                  <Text style={styles.infoLabel}>{label}</Text>
                  <Text style={styles.infoValue}>{value || '-'}</Text>
                </View>
              ))}
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoHeader}>
                <Text style={styles.infoHeaderText}>Identification</Text>
              </View>
              {[
                // ['Report No', basicInfo.reportNo],
                ['Audit PI No', basicInfo.auditPINos],
              ].map(([label, value], idx) => (
                <View
                  key={idx}
                  style={{
                    ...styles.infoRow,
                    backgroundColor: idx % 2 === 0 ? '#f5f5f5' : 'white',
                  }}
                >
                  <Text style={styles.infoLabel}>{label}</Text>
                  <Text style={styles.infoValue}>{value || '-'}</Text>
                </View>
              ))}
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoHeader}>
                <Text style={styles.infoHeaderText}>Parties</Text>
              </View>
              {[
                ['Customer', basicInfo.customerName],
                ['Factory', basicInfo.factory],
                ['Buyer', basicInfo.buyer],
                ['QC Name', basicInfo.qcName],
                ['Factory Rep', basicInfo.factoryRepName],
              ].map(([label, value], idx) => (
                <View
                  key={idx}
                  style={{
                    ...styles.infoRow,
                    backgroundColor: idx % 2 === 0 ? '#f5f5f5' : 'white',
                  }}
                >
                  <Text style={styles.infoLabel}>{label}</Text>
                  <Text style={styles.infoValue}>{value || '-'}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              {/* Left side */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text>Powered by : ITG Technology Company |</Text>
                <Link
                  src="https://www.itgllc.ae/"
                  style={{ marginLeft: 4, color: '#000000', textDecoration: 'none' }}
                >
                  Visit www.itgllc.ae
                </Link>
              </View>

              {/* Right side */}
              <Text
                render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                fixed
              />
            </View>
          </View>
        </Page>

        <Page size="A4" style={styles.page}>
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 15,
              }}
            >
              {/* Left - Logo */}
              <View style={{ flex: 1, alignItems: 'flex-start' }}>
                <Image
                  src="/logo/CYCLO(CMYK).png"
                  style={{ width: 100, height: 35, objectFit: 'contain' }}
                />
              </View>

              {/* Center - Heading */}
              <View style={{ flex: 2, alignItems: 'center' }}>
                <Text style={styles.title}>ORDER & LOT DETAILS</Text>
                <Text style={styles.subtitle}>Report No: {basicInfo.reportNo}</Text>
              </View>

              {/* Right - Empty for balance */}
              <View style={{ flex: 1 }} />
            </View>

            <Text style={styles.sectionTitle}>Order Details</Text>
            <View style={{ marginBottom: 15 }}>
              <View style={styles.tableHeader}>
                {['Item', 'Order Qty', 'Received', 'Balance'].map((col, i) => (
                  <View
                    key={col}
                    style={{
                      ...styles.cell,
                      width: columnWidths[i],
                      borderLeft: 1,
                      borderRight: i === 3 ? 1 : 0,
                      borderColor: '#1a3a6c',
                    }}
                  >
                    <Text style={{ textAlign: 'center', fontSize: 9, color: 'white' }}>{col}</Text>
                  </View>
                ))}
              </View>
              {orderItems.map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    ...styles.tableRow,
                    backgroundColor: idx % 2 === 0 ? '#f9f9f9' : 'white',
                  }}
                >
                  {[item.item, formatQuantity(item.orderQty), item.receiveQty, item.balanceQty].map(
                    (val, i) => (
                      <Text
                        key={i}
                        style={{
                          ...styles.cell,
                          width: columnWidths[i],
                          borderLeft: 1,
                          borderRight: i === 3 ? 1 : 0,
                          textAlign: i > 0 ? 'right' : 'left',
                        }}
                      >
                        {val || '-'}
                      </Text>
                    )
                  )}
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Lot Details</Text>
            <View style={{ marginBottom: 10 }}>
              <View style={styles.tableHeader}>
                {['Lot No.', 'Item', 'Quantity', 'Delivery Date', 'Complaint'].map((col, i) => (
                  <View
                    key={col}
                    style={{
                      ...styles.cell,
                      width: columnWidths1[i],
                      borderLeft: 1,
                      borderRight: i === 4 ? 1 : 0,
                      borderColor: '#1a3a6c',
                    }}
                  >
                    <Text style={{ textAlign: 'center', fontSize: 9, color: 'white' }}>{col}</Text>
                  </View>
                ))}
              </View>

              {lotItems.map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    ...styles.tableRow,
                    backgroundColor: idx % 2 === 0 ? '#f9f9f9' : 'white',
                  }}
                >
                  {[
                    item.lotNo,
                    item.item,
                    formatQuantity(item.quantity),
                    fDate(item.deliveryDate),
                    item.complaint,
                  ].map((val, i) => (
                    <Text
                      key={i}
                      style={{
                        ...styles.cell,
                        width: columnWidths1[i],
                        borderLeft: 1,
                        borderRight: i === 4 ? 1 : 0,
                        color: i === 4 ? 'red' : 'black',
                        fontFamily: i === 4 ? 'Roboto-Medium' : 'Century Gothic',
                        textAlign: i === 2 ? 'right' : i === 3 ? 'center' : 'left',
                      }}
                    >
                      {val || '-'}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              {/* Left side */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text>Powered by : ITG Technology Company |</Text>
                <Link
                  src="https://www.itgllc.ae/"
                  style={{ marginLeft: 4, color: '#000000', textDecoration: 'none' }}
                >
                  Visit www.itgllc.ae
                </Link>
              </View>

              {/* Right side */}
              <Text
                render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                fixed
              />
            </View>
          </View>
        </Page>

        {filteredStatusUpdates.length > 0 && (
          <Page size="A4" style={styles.page}>
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 15,
                }}
              >
                {/* Left - Logo */}
                <View style={{ flex: 1, alignItems: 'flex-start' }}>
                  <Image
                    src="/logo/CYCLO(CMYK).png"
                    style={{ width: 100, height: 35, objectFit: 'contain' }}
                  />
                </View>

                {/* Center - Heading */}
                <View style={{ flex: 2, alignItems: 'center' }}>
                  <Text style={styles.title}>ON-SITE STATUS UPDATES</Text>
                  <Text style={styles.subtitle}>Report No: {basicInfo.reportNo}</Text>
                </View>

                {/* Right - Empty for balance */}
                <View style={{ flex: 1 }} />
              </View>

              <Text style={styles.sectionTitle}>On Site Status Updates</Text>

              {filteredStatusUpdates.map((item, index) => (
                <View key={item.caOnSiteID} wrap={false} style={styles.statusCard}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontFamily: 'Roboto-Bold',
                      marginBottom: 8,
                      color: '#1a3a6c',
                      borderBottom: 1,
                      borderColor: '#ddd',
                      paddingBottom: 4,
                    }}
                  >
                    Status Update {index + 1}
                  </Text>

                  <View style={styles.twoColumnLayout}>
                    <View style={styles.column}>
                      <Text style={styles.detailText}>PI No: {item.piNo || 'N/A'}</Text>
                      <Text style={styles.detailText}>Item: {item.item || 'N/A'}</Text>
                      <Text style={styles.detailText}>Lot Numbers: {item.lotNumbers || 'N/A'}</Text>
                      <Text style={styles.detailText}>Problem: {item.problem || 'N/A'}</Text>
                      <Text style={styles.detailText}>
                        Description: {item.description || 'N/A'}
                      </Text>
                      <Text style={styles.detailText}>Sum of Qty: {item.sumOfQty || 'N/A'}</Text>
                      <Text style={styles.detailText}>
                        Expected Replacement QTY: {item.expectedReplacementQTY || 'N/A'}
                      </Text>
                      <Text style={styles.detailText}>
                        Extra Yarn Qty Required: {item.extraYarnQtyRequired || 'N/A'}
                      </Text>
                      <Text style={styles.detailText}>Style No: {item.styleNo || 'N/A'}</Text>
                      <Text style={styles.detailText}>Yarn Using: {item.yarnUsing || 'N/A'}</Text>
                    </View>

                    <View style={styles.column}>
                      <Text style={styles.detailText}>
                        Fabric Design: {item.fabricDesign || 'N/A'}
                      </Text>
                      <Text style={styles.detailText}>
                        Composition: {item.composition || 'N/A'}
                      </Text>
                      <Text style={styles.detailText}>Count/Ply: {item.countPly || 'N/A'}</Text>
                      <Text style={styles.detailText}>GG/GSM: {item.ggGsm || 'N/A'}</Text>
                      <Text style={styles.detailText}>
                        Supplied Yarn Qty: {item.suppliedYarnQty || 'N/A'}
                      </Text>
                      <Text style={styles.detailText}>
                        Processed Yarn Qty: {item.processedYarnQty || 'N/A'}
                      </Text>
                      <Text style={styles.detailText}>Yarn Count: {item.yarnCount || 'N/A'}</Text>
                      <Text style={styles.detailText}>Proceed Qty: {item.proceedQty || 'N/A'}</Text>
                      <Text style={styles.detailText}>Garment Qty: {item.garmentQty || 'N/A'}</Text>
                      <Text style={styles.detailText}>Fabric QTY: {item.fabricQTY || 'N/A'}</Text>
                    </View>
                  </View>

                  <View style={styles.twoColumnLayout}>
                    <View style={styles.column}>
                      <Text style={styles.detailText}>Checked Qty: {item.checkedQty || 'N/A'}</Text>
                      <Text style={styles.detailText}>Defect Qty: {item.defectQty || 'N/A'}</Text>
                    </View>
                    <View style={styles.column}>
                      <Text style={styles.detailText}>
                        Defect Percentage: {item.defectPercentage || 'N/A'}
                      </Text>
                      <Text style={styles.detailText}>
                        Average Weight: {item.avgWeight || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.twoColumnLayout}>
                    <View style={styles.column}>
                      <Text style={styles.detailText}>
                        Raw Material Usage Type: {item.rawMaterialUsageType || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.column}>
                      <Text style={styles.detailText}>
                        Machine Type: {item.machineType || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.twoColumnLayout}>
                    <View style={styles.column}>
                      <Text style={styles.detailText}>
                        Machine Speed: {item.machineSpeed || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.column}>
                      <Text style={styles.detailText}>
                        Machine Gauge: {item.machineGauge || 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.footer}>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}
              >
                {/* Left side */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text>Powered by : ITG Technology Company |</Text>
                  <Link
                    src="https://www.itgllc.ae/"
                    style={{ marginLeft: 4, color: '#000000', textDecoration: 'none' }}
                  >
                    Visit www.itgllc.ae
                  </Link>
                </View>

                {/* Right side */}
                <Text
                  render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                  fixed
                />
              </View>
            </View>
          </Page>
        )}

        <Page size="A4" style={styles.page}>
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 15,
              }}
            >
              {/* Left - Logo */}
              <View style={{ flex: 1, alignItems: 'flex-start' }}>
                <Image
                  src="/logo/CYCLO(CMYK).png"
                  style={{ width: 100, height: 35, objectFit: 'contain' }}
                />
              </View>

              {/* Center - Heading */}
              <View style={{ flex: 2, alignItems: 'center' }}>
                <Text style={styles.title}>MEDIA RECORDS</Text>
                <Text style={styles.subtitle}>Report No: {basicInfo.reportNo}</Text>
              </View>

              {/* Right - Empty for balance */}
              <View style={{ flex: 1 }} />
            </View>

            <Text style={styles.sectionTitle}>Media And Audio Records</Text>

            {(() => {
              const imageRecords = mediaRecords.filter((item) => item.mediaType === 'image');
              const sortedImages = imageRecords.sort(
                (a, b) => new Date(b.creationDate) - new Date(a.creationDate)
              );

              if (sortedImages.length > 0) {
                return (
                  <>
                    <Text style={styles.subSectionTitle}>Images ({sortedImages.length})</Text>
                    <View
                      style={{
                        marginBottom: 10,
                        marginTop: 5,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-start',
                      }}
                    >
                      {sortedImages.map((item, index) => (
                        <View
                          key={index}
                          style={{
                            ...styles.mediaContainer,
                            marginRight: index % 3 === 2 ? 0 : '5%',
                          }}
                        >
                          <View style={styles.mediaBox}>
                            <Link
                              src={`https://cyclohub.scmcloud.online/api/media/media/${item.fileName}`}
                              target="_blank"
                            >
                              <Image
                                src={`https://cyclohub.scmcloud.online/api/media/media/${item.fileName}`}
                                style={{ width: 78, height: 78, objectFit: 'cover' }}
                              />
                            </Link>
                          </View>
                          <Text style={{ fontSize: 7, textAlign: 'center' }}>
                            {item.description || item.fileName}
                          </Text>
                          {item.creationDate && (
                            <Text style={{ fontSize: 6, textAlign: 'center', color: '#666' }}>
                              {fDate(item.creationDate)}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  </>
                );
              }
              return null;
            })()}

            {(() => {
              const videoRecords = mediaRecords.filter((item) => item.mediaType === 'video');
              const sortedVideos = videoRecords.sort(
                (a, b) => new Date(b.creationDate) - new Date(a.creationDate)
              );

              if (sortedVideos.length > 0) {
                return (
                  <>
                    <Text style={styles.subSectionTitle}>Videos ({sortedVideos.length})</Text>
                    <View
                      style={{
                        marginBottom: 10,
                        marginTop: 5,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-start',
                      }}
                    >
                      {sortedVideos.map((item, index) => (
                        <View
                          key={index}
                          style={{
                            ...styles.mediaContainer,
                            marginRight: index % 3 === 2 ? 0 : '5%',
                          }}
                        >
                          <View style={styles.mediaBox}>
                            <Link
                              src={`https://cyclohub.scmcloud.online/api/media/media/${item.fileName}`}
                              target="_blank"
                            >
                              <Image src="/assets/video.png" style={{ width: 40, height: 40 }} />
                            </Link>
                          </View>
                          <Text style={{ fontSize: 7, textAlign: 'center' }}>
                            {item.description || item.fileName}
                          </Text>
                          {item.creationDate && (
                            <Text style={{ fontSize: 6, textAlign: 'center', color: '#666' }}>
                              {fDate(item.creationDate)}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  </>
                );
              }
              return null;
            })()}

            {(() => {
              const pdfRecords = mediaRecords.filter((item) => item.mediaType === 'pdf');
              const sortedPDFs = pdfRecords.sort(
                (a, b) => new Date(b.creationDate) - new Date(a.creationDate)
              );

              if (sortedPDFs.length > 0) {
                return (
                  <>
                    <Text style={styles.subSectionTitle}>PDF Documents ({sortedPDFs.length})</Text>
                    <View
                      style={{
                        marginBottom: 10,
                        marginTop: 5,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-start',
                      }}
                    >
                      {sortedPDFs.map((item, index) => (
                        <View
                          key={index}
                          style={{
                            ...styles.mediaContainer,
                            marginRight: index % 3 === 2 ? 0 : '5%',
                          }}
                        >
                          <View style={styles.mediaBox}>
                            <Link
                              src={`https://cyclohub.scmcloud.online/api/media/media/${item.fileName}`}
                              target="_blank"
                            >
                              <Image
                                src="/assets/pdfIcon.png"
                                style={{ width: 40, height: 40 }}
                                target="_blank"
                              />
                            </Link>
                          </View>
                          <Text style={{ fontSize: 7, textAlign: 'center' }}>
                            {item.description || item.fileName}
                          </Text>
                          {item.creationDate && (
                            <Text style={{ fontSize: 6, textAlign: 'center', color: '#666' }}>
                              {fDate(item.creationDate)}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  </>
                );
              }
              return null;
            })()}
          </View>

          <View style={styles.footer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              {/* Left side */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text>Powered by : ITG Technology Company |</Text>
                <Link
                  src="https://www.itgllc.ae/"
                  style={{ marginLeft: 4, color: '#000000', textDecoration: 'none' }}
                >
                  Visit www.itgllc.ae
                </Link>
              </View>

              {/* Right side */}
              <Text
                render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                fixed
              />
            </View>
          </View>
        </Page>

        <Page size="A4" style={styles.page}>
          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 15,
              }}
            >
              {/* Left - Logo */}
              <View style={{ flex: 1, alignItems: 'flex-start' }}>
                <Image
                  src="/logo/CYCLO(CMYK).png"
                  style={{ width: 100, height: 35, objectFit: 'contain' }}
                />
              </View>

              {/* Center - Heading */}
              <View style={{ flex: 2, alignItems: 'center' }}>
                <Text style={styles.title}>FINAL COMMENTS & SIGNATURES</Text>
                <Text style={styles.subtitle}>Report No: {basicInfo.reportNo}</Text>
              </View>

              {/* Right - Empty for balance */}
              <View style={{ flex: 1 }} />
            </View>

            <Text style={styles.sectionTitle}>QC Final Comments</Text>
            <View
              style={{
                marginBottom: 15,
                border: 1,
                borderColor: '#ddd',
                borderRadius: 4,
                padding: 10,
                backgroundColor: '#f9f9f9',
                minHeight: 80,
              }}
            >
              <Text>{basicInfo.qcFinalComments || 'No comments provided'}</Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: 30,
              }}
            >
              <View style={{ width: '45%', alignItems: 'center' }}>
                {signatureRecords &&
                  signatureRecords.length > 0 &&
                  (() => {
                    const qcSignatures = signatureRecords.filter(
                      (sig) => sig.role === 'Quality Control'
                    );
                    if (qcSignatures.length > 0) {
                      const latestQC = qcSignatures.sort(
                        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                      )[0];
                      return (
                        <View style={{ alignItems: 'center' }}>
                          <Image
                            src={`https://cyclohub.scmcloud.online/api/Media/signature/${latestQC.name}`}
                            style={{
                              width: 120,
                              height: 60,
                              marginBottom: 5,
                              border: 1,
                              borderColor: '#ddd',
                            }}
                          />
                          <Text
                            style={{
                              fontSize: 9,
                              textAlign: 'center',
                              color: '#666',
                              marginTop: 5,
                            }}
                          >
                            {latestQC.name}
                          </Text>
                          <Text style={{ fontSize: 8, textAlign: 'center', color: '#999' }}>
                            {fDate(latestQC.timestamp)}
                          </Text>
                        </View>
                      );
                    }
                    return null;
                  })()}
                <Text
                  style={{
                    borderTop: 1,
                    paddingTop: 5,
                    fontFamily: 'Roboto-Bold',
                    textAlign: 'center',
                    marginTop: 15,
                    width: '100%',
                  }}
                >
                  QC Signature
                </Text>
              </View>

              <View style={{ width: '45%', alignItems: 'center' }}>
                {signatureRecords && signatureRecords.length > 0
                  ? (() => {
                      const factorySigns = signatureRecords.filter((sig) => sig.role === 'Factory');
                      if (factorySigns.length > 0) {
                        const latestFactory = factorySigns.sort(
                          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                        )[0];
                        return (
                          <View style={{ alignItems: 'center' }}>
                            <Image
                              src={`https://cyclohub.scmcloud.online/api/Media/signature/${latestFactory.name}`}
                              style={{
                                width: 120,
                                height: 60,
                                marginBottom: 5,
                                border: 1,
                                borderColor: '#ddd',
                              }}
                              fit="contain"
                            />
                            <Text
                              style={{
                                fontSize: 9,
                                textAlign: 'center',
                                color: '#666',
                                marginTop: 5,
                              }}
                            >
                              {latestFactory.name}
                            </Text>
                            <Text style={{ fontSize: 8, textAlign: 'center', color: '#999' }}>
                              {fDate(latestFactory.timestamp)}
                            </Text>
                          </View>
                        );
                      }
                      return null;
                    })()
                  : null}
                <Text
                  style={{
                    borderTop: 1,
                    paddingTop: 5,
                    fontFamily: 'Roboto-Bold',
                    textAlign: 'center',
                    marginTop: 15,
                    width: '100%',
                  }}
                >
                  Authorized Signature
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              {/* Left side */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text>Powered by : ITG Technology Company |</Text>
                <Link
                  src="https://www.itgllc.ae/"
                  style={{ marginLeft: 4, color: '#000000', textDecoration: 'none' }}
                >
                  Visit www.itgllc.ae
                </Link>
              </View>

              {/* Right side */}
              <Text
                render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                fixed
              />
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

ClaimPDF.propTypes = {
  currentData: PropTypes.any,
};

export default ClaimPDF;
