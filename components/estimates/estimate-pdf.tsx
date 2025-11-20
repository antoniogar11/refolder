import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { EstimateWithRelations } from "@/lib/data/estimates";

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  estimateNumber: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: 120,
    fontWeight: "bold",
    color: "#475569",
  },
  value: {
    flex: 1,
    color: "#1e293b",
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  col1: {
    width: "5%",
    textAlign: "center",
  },
  col2: {
    width: "35%",
  },
  col3: {
    width: "12%",
    textAlign: "right",
  },
  col4: {
    width: "12%",
    textAlign: "right",
  },
  col5: {
    width: "12%",
    textAlign: "right",
  },
  col6: {
    width: "12%",
    textAlign: "right",
  },
  col7: {
    width: "12%",
    textAlign: "right",
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#475569",
  },
  tableCell: {
    fontSize: 10,
    color: "#1e293b",
  },
  totals: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: "#cbd5e1",
    alignSelf: "flex-end",
    width: "40%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  totalLabel: {
    fontSize: 11,
    color: "#475569",
  },
  totalValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e293b",
  },
  finalTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    paddingHorizontal: 10,
  },
  finalTotalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
  },
  finalTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2563eb",
  },
  notes: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
  },
  notesText: {
    fontSize: 10,
    color: "#475569",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#94a3b8",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  },
});

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount);
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

type EstimatePDFProps = {
  estimate: EstimateWithRelations;
};

export function EstimatePDF({ estimate }: EstimatePDFProps) {
  const statusLabels: Record<string, string> = {
    draft: "Borrador",
    sent: "Enviado",
    accepted: "Aceptado",
    rejected: "Rechazado",
    expired: "Expirado",
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{estimate.title}</Text>
          <Text style={styles.estimateNumber}>Presupuesto Nº: {estimate.estimate_number}</Text>
          <Text style={styles.estimateNumber}>Estado: {statusLabels[estimate.status] || estimate.status}</Text>
        </View>

        {/* Información del Cliente y Proyecto */}
        <View style={styles.section}>
          {estimate.client && (
            <View style={styles.row}>
              <Text style={styles.label}>Cliente:</Text>
              <Text style={styles.value}>{estimate.client.name}</Text>
            </View>
          )}
          {estimate.client?.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{estimate.client.email}</Text>
            </View>
          )}
          {estimate.project && (
            <View style={styles.row}>
              <Text style={styles.label}>Proyecto:</Text>
              <Text style={styles.value}>{estimate.project.name}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de Emisión:</Text>
            <Text style={styles.value}>{formatDate(estimate.issue_date)}</Text>
          </View>
          {estimate.validity_date && (
            <View style={styles.row}>
              <Text style={styles.label}>Válido hasta:</Text>
              <Text style={styles.value}>{formatDate(estimate.validity_date)}</Text>
            </View>
          )}
        </View>

        {/* Descripción */}
        {estimate.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.value}>{estimate.description}</Text>
          </View>
        )}

        {/* Tabla de Items */}
        {estimate.items && estimate.items.length > 0 && (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.col1]}>#</Text>
              <Text style={[styles.tableHeaderText, styles.col2]}>Concepto</Text>
              <Text style={[styles.tableHeaderText, styles.col3]}>Cant.</Text>
              <Text style={[styles.tableHeaderText, styles.col4]}>Precio U.</Text>
              <Text style={[styles.tableHeaderText, styles.col5]}>Subtotal</Text>
              <Text style={[styles.tableHeaderText, styles.col6]}>IVA</Text>
              <Text style={[styles.tableHeaderText, styles.col7]}>Total</Text>
            </View>
            {estimate.items.map((item, index) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col1]}>{index + 1}</Text>
                <Text style={[styles.tableCell, styles.col2]}>{item.description}</Text>
                <Text style={[styles.tableCell, styles.col3]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.col4]}>{formatCurrency(item.unit_price)}</Text>
                <Text style={[styles.tableCell, styles.col5]}>{formatCurrency(item.subtotal)}</Text>
                <Text style={[styles.tableCell, styles.col6]}>{formatCurrency(item.tax_amount)}</Text>
                <Text style={[styles.tableCell, styles.col7]}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Totales */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(estimate.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA ({estimate.tax_rate}%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(estimate.tax_amount)}</Text>
          </View>
          <View style={styles.finalTotal}>
            <Text style={styles.finalTotalLabel}>TOTAL:</Text>
            <Text style={styles.finalTotalValue}>{formatCurrency(estimate.total)}</Text>
          </View>
        </View>

        {/* Notas */}
        {estimate.notes && (
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>Notas</Text>
            <Text style={styles.notesText}>{estimate.notes}</Text>
          </View>
        )}

        {/* Términos y Condiciones */}
        {estimate.terms && (
          <View style={[styles.notes, { marginTop: 15 }]}>
            <Text style={styles.sectionTitle}>Términos y Condiciones</Text>
            <Text style={styles.notesText}>{estimate.terms}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Refolder - Sistema de Gestión de Obras y Reformas</Text>
          <Text>Generado el {formatDate(new Date().toISOString())}</Text>
        </View>
      </Page>
    </Document>
  );
}

