import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    paddingTop: 52,
    paddingBottom: 64,
    paddingHorizontal: 54,
    fontFamily: 'Helvetica',
    fontSize: 10.5,
    color: '#111827',
  },

  // ── Header ──
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: '1 solid #e5e7eb',
  },
  headerBrand: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#9ca3af',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  headerTag: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#6366f1',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  headerMeta: {
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 1.7,
  },

  // ── Body ──
  h1: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginTop: 22,
    marginBottom: 8,
  },
  h2: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 6,
  },
  h3: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginTop: 11,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 10.5,
    color: '#374151',
    lineHeight: 1.75,
    marginBottom: 9,
    textAlign: 'justify',
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingLeft: 8,
  },
  bulletDot: {
    fontSize: 10.5,
    color: '#6b7280',
    width: 16,
  },
  bulletText: {
    fontSize: 10.5,
    color: '#374151',
    lineHeight: 1.68,
    flex: 1,
  },
  numberedDot: {
    fontSize: 10.5,
    color: '#6b7280',
    width: 22,
  },
  hr: {
    borderBottom: '0.5 solid #e5e7eb',
    marginVertical: 12,
  },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 54,
    right: 54,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
})

// ── Inline parser (handles **bold**) ─────────────────────────────────────────

function inlineParts(text: string): (string | React.ReactElement)[] {
  if (!text.includes('**')) return [text]
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? (
        <Text key={i} style={{ fontFamily: 'Helvetica-Bold' }}>
          {part.slice(2, -2)}
        </Text>
      )
      : part
  )
}

// ── Content renderer ──────────────────────────────────────────────────────────

function renderContent(text: string): React.ReactElement[] {
  const lines = text.split('\n')
  const elements: React.ReactElement[] = []
  let idx = 0
  const k = () => `line-${idx++}`

  for (const line of lines) {
    const t = line.trim()
    if (!t) continue

    // Headings
    if (t.startsWith('### ')) {
      elements.push(<Text key={k()} style={styles.h3}>{t.slice(4)}</Text>)
      continue
    }
    if (t.startsWith('## ')) {
      elements.push(<Text key={k()} style={styles.h2}>{t.slice(3)}</Text>)
      continue
    }
    if (t.startsWith('# ')) {
      elements.push(<Text key={k()} style={styles.h1}>{t.slice(2)}</Text>)
      continue
    }

    // Horizontal rule
    if (t === '---' || t === '***' || t === '___') {
      elements.push(<View key={k()} style={styles.hr} />)
      continue
    }

    // Unordered bullets
    const bulletMatch = t.match(/^[-*+]\s(.*)/)
    if (bulletMatch) {
      elements.push(
        <View key={k()} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{inlineParts(bulletMatch[1])}</Text>
        </View>
      )
      continue
    }

    // Ordered bullets
    const orderedMatch = t.match(/^(\d+)[.)]\s(.*)/)
    if (orderedMatch) {
      elements.push(
        <View key={k()} style={styles.bulletRow}>
          <Text style={styles.numberedDot}>{orderedMatch[1]}.</Text>
          <Text style={styles.bulletText}>{inlineParts(orderedMatch[2])}</Text>
        </View>
      )
      continue
    }

    // Regular paragraph
    elements.push(
      <Text key={k()} style={styles.paragraph}>
        {inlineParts(t)}
      </Text>
    )
  }

  return elements
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface RelatorioPDFProps {
  patientName: string
  reportType: 'clinical' | 'simplified'
  geminiModel: string
  generatedAt: string
  content: string
}

// ── Document ──────────────────────────────────────────────────────────────────

export default function RelatorioPDF({
  patientName,
  reportType,
  geminiModel,
  generatedAt,
  content,
}: RelatorioPDFProps) {
  const typeLabel = reportType === 'clinical' ? 'Relatório Clínico' : 'Relatório Simplificado'

  return (
    <Document
      title={`${typeLabel} — ${patientName}`}
      author="Jornada Vocacional"
      creator="Jornada Vocacional · IA"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerBrand}>JORNADA VOCACIONAL</Text>
          <Text style={styles.headerTitle}>{typeLabel}</Text>
          <Text style={styles.headerTag}>Orientação Profissional Gamificada</Text>
          <Text style={styles.headerMeta}>
            {`Participante: ${patientName}\nGerado em: ${generatedAt}\nModelo IA: ${geminiModel}`}
          </Text>
        </View>

        {/* Content */}
        {renderContent(content)}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Jornada Vocacional — Documento confidencial</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}
