import { useCallback, useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

import ChartCard from './ChartCard'
import DonutLegend from './DonutLegend'
import KpiCard from './KpiCard'
import RecordPaymentModal from './RecordPaymentModal'
import NotificationModal from './NotificationModal'
import ProfileModal from './ProfileModal'
import { mockDashboard } from '../data/mockDashboard'
import { formatCurrency, formatPercent } from '../utils/formatters'
import apiService from '../services/api'

const NAV_ITEMS = [
  { label: 'Dashboard', key: 'overview' },
  { label: 'Disbursement', key: 'disbursement' },
  { label: 'Reconciliation', key: 'reconciliation' },
  { label: 'Repayment', key: 'repayment' },
]

const QUICK_ACTIONS = [
  {
    title: 'Add Tenant',
    description: 'Onboard new bank/NBFC',
    accent: 'from-sky-100 to-white text-brand-text',
  },
  {
    title: 'View Reports',
    description: 'Analytics & insights',
    accent: 'from-indigo-100 to-white text-brand-text',
  },
  {
    title: 'System Settings',
    description: 'Configure platform',
    accent: 'from-blue-100 to-white text-brand-text',
  },
  {
    title: 'Notifications',
    description: 'Alerts & updates',
    accent: 'from-cyan-100 to-white text-brand-text',
  },
]

const navIcon = (variant) => {
  const base = 'h-5 w-5 stroke-current'
  switch (variant) {
    case 'dashboard':
    case 'overview':
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" strokeWidth={1.8}>
          <path d="M4 13h6v7H4zM14 4h6v16h-6zM4 4h6v7H4zM14 13h6" />
        </svg>
      )
    case 'disbursement':
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" strokeWidth={1.8}>
          <path d="M4 7h16M4 12h10M4 17h16" />
          <path d="M16 5v4M8 10v4M12 15v4" />
        </svg>
      )
    case 'reconciliation':
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" strokeWidth={1.8}>
          <path d="M9 12l2 2 4-4" />
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
        </svg>
      )
    case 'repayment':
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" strokeWidth={1.8}>
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      )
    case 'users':
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" strokeWidth={1.8}>
          <circle cx="9" cy="8" r="4" />
          <path d="M2 20c0-3.5 3.5-5 7-5s7 1.5 7 5" />
          <path d="M18 12a3 3 0 100-6" />
        </svg>
      )
    case 'analytics':
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" strokeWidth={1.8}>
          <path d="M4 20V4" />
          <path d="M4 14l4-4 4 2 6-7" />
          <path d="M18 5h3v3" />
        </svg>
      )
    case 'settings':
      return (
        <svg viewBox="0 0 24 24" className={base} fill="none" strokeWidth={1.8}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 000-6l1.6-2.8-2.6-2.6L15.6 4a1.7 1.7 0 00-6 0L6.8 3.6 4.2 6.2 5.8 9a1.7 1.7 0 000 6l-1.6 2.8 2.6 2.6L8.4 20a1.7 1.7 0 006 0l2.8.4 2.6-2.6z" />
        </svg>
      )
    default:
      return null
  }
}

const normalizeKpi = (entry) => {
  if (entry && typeof entry === 'object') {
    return {
      value: entry.value ?? null,
      trend: entry.trend ?? entry.trendPercentage ?? null,
    }
  }
  if (typeof entry === 'number') {
    return { value: entry, trend: null }
  }
  return { value: null, trend: null }
}

const formatDateTime = (value) => {
  try {
    return new Date(value).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return value
  }
}

const FinanceDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reportState, setReportState] = useState({ loading: false, message: null })
  const [activeView, setActiveView] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [disbursementData, setDisbursementData] = useState(null)
  const [disbursementLoading, setDisbursementLoading] = useState(false)
  const [disbursementError, setDisbursementError] = useState(null)
  const [reconciliationData, setReconciliationData] = useState(null)
  const [reconciliationLoading, setReconciliationLoading] = useState(false)
  const [reconciliationError, setReconciliationError] = useState(null)
  const [selectedTransactions, setSelectedTransactions] = useState(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [filters, setFilters] = useState({
    descriptionQuery: '',
    dateFrom: '',
    dateTo: '',
    statusFilter: 'all',
  })
  const [repaymentData, setRepaymentData] = useState(null)
  const [repaymentLoading, setRepaymentLoading] = useState(false)
  const [repaymentError, setRepaymentError] = useState(null)
  const [repaymentFilters, setRepaymentFilters] = useState({
    status: 'ALL_REPAYMENTS',
    dateFrom: '',
    dateTo: '',
    searchQuery: '',
  })
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false)
  const [selectedRepaymentId, setSelectedRepaymentId] = useState(null)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showTenantModal, setShowTenantModal] = useState(false)
  const [showReportsModal, setShowReportsModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showManageDisbursementModal, setShowManageDisbursementModal] = useState(false)
  const [selectedDisbursement, setSelectedDisbursement] = useState(null)
  const [tenants, setTenants] = useState(() => {
    try {
      const saved = localStorage.getItem('tenants')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [tenantForm, setTenantForm] = useState({ name: '', type: 'Bank', email: '', active: true })
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('settings')
      return saved ? JSON.parse(saved) : { emailNotifications: true, smsNotifications: false }
    } catch {
      return { emailNotifications: true, smsNotifications: false }
    }
  })

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const payload = await apiService.getLegacyDashboard()
      setDashboardData(payload)
    } catch (err) {
      console.warn('[FinanceDashboard] Falling back to mock data:', err.message)
      setDashboardData(mockDashboard)
      setError('Live data is unavailable. Showing synchronized mock snapshot instead.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const loadDisbursementDashboard = useCallback(async () => {
    try {
      setDisbursementLoading(true)
      setDisbursementError(null)
      const payload = await apiService.getDisbursementDashboard()
      setDisbursementData(payload)
    } catch (err) {
      console.warn('[FinanceDashboard] Falling back to disbursement mock data:', err.message)
      setDisbursementData(mockDashboard.disbursement)
      setDisbursementError('Live disbursement data unavailable. Showing mock snapshot.')
    } finally {
      setDisbursementLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeView === 'disbursement' && !disbursementData && !disbursementLoading) {
      loadDisbursementDashboard()
    }
  }, [activeView, disbursementData, disbursementLoading, loadDisbursementDashboard])

  const loadReconciliationData = useCallback(async () => {
    try {
      setReconciliationLoading(true)
      setReconciliationError(null)
      const payload = await apiService.getLegacyReconciliationList(filters)
      setReconciliationData(payload)
    } catch (err) {
      console.warn('[FinanceDashboard] Falling back to reconciliation mock data:', err.message)
      const mockData = mockDashboard.reconciliation
      setReconciliationData(mockData)
      setReconciliationError('Live reconciliation data unavailable. Showing mock snapshot.')
    } finally {
      setReconciliationLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (activeView === 'reconciliation') {
      loadReconciliationData()
    } else {
      setSelectedTransactions(new Set())
      setShowBulkActions(false)
    }
  }, [activeView, loadReconciliationData])

  const loadRepaymentData = useCallback(async () => {
    try {
      setRepaymentLoading(true)
      setRepaymentError(null)
      const payload = await apiService.getLegacyRepaymentList(repaymentFilters)
      setRepaymentData(payload)
    } catch (err) {
      console.warn('[FinanceDashboard] Falling back to repayment mock data:', err.message)
      const mockData = mockDashboard.repayment
      setRepaymentData({
        totalRecords: mockData.repayments.length,
        repayments: mockData.repayments,
        kpis: mockData.kpis,
      })
      setRepaymentError('Live repayment data unavailable. Showing mock snapshot.')
    } finally {
      setRepaymentLoading(false)
    }
  }, [repaymentFilters])

  useEffect(() => {
    if (activeView === 'repayment') {
      loadRepaymentData()
    }
  }, [activeView, loadRepaymentData])

  useEffect(() => {
    if (!showBulkActions) return
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setShowBulkActions(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showBulkActions])

  // Close sidebar on route change (mobile)
  const handleNavChange = (key) => {
    setActiveView(key)
    setSidebarOpen(false)
  }

  const handleBulkUpdate = async (newStatus) => {
    if (selectedTransactions.size === 0) return

    const statusMap = {
      RECONCILED: 'Reconciled',
      UNRECONCILED: 'Unreconciled',
      PENDING: 'Pending',
    }
    const displayStatus = statusMap[newStatus] || newStatus

    try {
      const updates = Array.from(selectedTransactions).map(txnId => ({
        transaction_id: parseInt(txnId),
        status: newStatus
      }))
      await apiService.updateReconciliationBulk(updates)
      setSelectedTransactions(new Set())
      setShowBulkActions(false)
      loadReconciliationData()
    } catch (err) {
      console.warn('[FinanceDashboard] Bulk update failed, updating local state:', err.message)
      setReconciliationData((prev) => {
        if (!prev) return prev
        const updated = { ...prev }
        updated.transactions = prev.transactions.map((t) =>
          selectedTransactions.has(t.transactionId)
            ? { ...t, status: displayStatus }
            : t
        )
        const reconciled = updated.transactions.filter((t) => t.status === 'Reconciled').length
        const unreconciled = updated.transactions.filter((t) => t.status === 'Unreconciled').length
        const pending = updated.transactions.filter((t) => t.status === 'Pending').length
        updated.summary = {
          ...updated.summary,
          reconciledCount: reconciled,
          unreconciledCount: unreconciled,
          pendingCount: pending,
          distribution: [
            { status: 'Reconciled', count: reconciled },
            { status: 'Unreconciled', count: unreconciled },
            { status: 'Pending', count: pending },
          ],
        }
        return updated
      })
      setSelectedTransactions(new Set())
      setShowBulkActions(false)
    }
  }

  const handleGenerateReport = async () => {
    try {
      setReportState({ loading: true, message: null })
      const report = await apiService.generateReport()

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Finance Summary Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
    h1 { color: #333; border-bottom: 3px solid #6366f1; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 20px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 15px 0; }
    .card { background: #f9f9f9; padding: 15px; border-left: 4px solid #6366f1; }
    .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
    .value { font-size: 24px; color: #333; margin: 5px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Finance Summary Report</h1>
    <p>Generated: ${new Date(report.reportData.generatedAt).toLocaleString()}</p>
    <h2>Overall Summary</h2>
    <div class="grid">
      <div class="card"><div class="label">Total Loans</div><div class="value">${report.reportData.summary.totalLoans}</div></div>
      <div class="card"><div class="label">Total Disbursed</div><div class="value">₹${report.reportData.summary.totalDisbursed.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div></div>
      <div class="card"><div class="label">Pending Disbursements</div><div class="value">₹${report.reportData.summary.pendingDisbursements.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div></div>
      <div class="card"><div class="label">Collection Rate</div><div class="value">${report.reportData.summary.collectionRate}%</div></div>
      <div class="card"><div class="label">Total Repayments Due</div><div class="value">₹${report.reportData.summary.totalRepaymentsDue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div></div>
      <div class="card"><div class="label">Total Repayments Paid</div><div class="value">₹${report.reportData.summary.totalRepaymentsPaid.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div></div>
    </div>
    <h2>Disbursement Summary</h2>
    <div class="grid">
      <div class="card"><div class="label">Total Disbursements</div><div class="value">${report.reportData.disbursementSummary.total}</div></div>
      <div class="card"><div class="label">Paid</div><div class="value">${report.reportData.disbursementSummary.paid}</div></div>
      <div class="card"><div class="label">Pending</div><div class="value">${report.reportData.disbursementSummary.pending}</div></div>
      <div class="card"><div class="label">Failed</div><div class="value">${report.reportData.disbursementSummary.failed}</div></div>
    </div>
    <h2>Repayment Summary</h2>
    <div class="grid">
      <div class="card"><div class="label">Total Repayments</div><div class="value">${report.reportData.repaymentSummary.total}</div></div>
      <div class="card"><div class="label">Paid</div><div class="value">${report.reportData.repaymentSummary.paid}</div></div>
      <div class="card"><div class="label">Pending</div><div class="value">${report.reportData.repaymentSummary.pending}</div></div>
      <div class="card"><div class="label">Overdue</div><div class="value">${report.reportData.repaymentSummary.overdue}</div></div>
    </div>
    <div class="footer"><p>This is an automatically generated report. Please verify all data before making decisions.</p></div>
  </div>
</body>
</html>`

      const blob = new Blob([html], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `finance-summary-${new Date().toISOString().slice(0, 10)}.html`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      setReportState({ loading: false, message: 'Finance Summary downloaded successfully!' })
    } catch (err) {
      console.warn('[FinanceDashboard] Report generation failed:', err.message)
      setReportState({ loading: false, message: 'Unable to generate report right now.' })
    }
  }

  const isDisbursementView = activeView === 'disbursement'
  const data = dashboardData ?? mockDashboard
  const disbursementTrends = data?.disbursementTrends ?? []
  const collectionPerformance = data?.collectionPerformance ?? []
  const paymentStatusDistribution = data?.paymentStatusDistribution ?? []
  const loanPortfolioComposition = data?.loanPortfolioComposition ?? []
  const recentActivity = data?.recentActivity ?? []
  const disbursementSnapshot = disbursementData ?? mockDashboard.disbursement
  const disbursementByMethod = disbursementSnapshot?.disbursementByMethod ?? []
  const disbursementStatusDistribution = disbursementSnapshot?.statusDistribution ?? []
  const disbursementTable = disbursementSnapshot?.allDisbursements ?? []

  const kpiItems = [
    {
      key: 'totalDisbursed',
      label: 'Total Disbursed',
      helper: 'Cumulative for selected period',
      formatter: formatCurrency,
    },
    {
      key: 'pendingDisbursement',
      label: 'Pending Disbursement',
      helper: 'Approved & awaiting release',
      formatter: formatCurrency,
    },
    {
      key: 'collectionRate',
      label: 'Collection Rate',
      helper: 'Expected vs actual receipts',
      formatter: (value) => formatPercent(value ?? 0, { digits: 0 }),
    },
    {
      key: 'overdueAmount',
      label: 'Overdue Amount',
      helper: 'Principal + interest past due',
      formatter: formatCurrency,
    },
  ]

  const disbursementKpis = [
    {
      key: 'totalDisbursed',
      label: 'Total Disbursed',
      helper: 'Cumulative amount paid to date',
      formatter: formatCurrency,
    },
    {
      key: 'pendingDisbursementsValue',
      label: 'Pending Disbursements',
      helper: (entry) => `${entry?.count ?? 0} loans awaiting release`,
      formatter: formatCurrency,
    },
    {
      key: 'disbursedThisMonth',
      label: 'Disbursed This Month',
      helper: (entry) => `${entry?.count ?? 0} successful transfers`,
      formatter: formatCurrency,
    },
    {
      key: 'failedTransactions',
      label: 'Failed Transactions',
      helper: (entry) => `${entry?.count ?? 0} payments require action`,
      formatter: formatCurrency,
      tone: 'danger',
    },
  ]

  const statusBadgeTone = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-50 text-emerald-600'
      case 'Pending':
        return 'bg-amber-50 text-amber-600'
      case 'Failed':
      default:
        return 'bg-rose-50 text-rose-600'
    }
  }

  const isReconciliationView = activeView === 'reconciliation'
  const isRepaymentView = activeView === 'repayment'

  const refreshInProgress = isDisbursementView
    ? disbursementLoading
    : isReconciliationView
      ? reconciliationLoading
      : isRepaymentView
        ? repaymentLoading
        : loading

  const handleRefresh = () => {
    if (isDisbursementView) {
      loadDisbursementDashboard()
    } else if (isReconciliationView) {
      loadReconciliationData()
    } else if (isRepaymentView) {
      loadRepaymentData()
    } else {
      loadDashboard()
    }
  }

  const handleRecordPayment = (repaymentId = null) => {
    setSelectedRepaymentId(repaymentId)
    setShowRecordPaymentModal(true)
  }

  const handleSendReminder = async (repaymentId) => {
    try {
      await apiService.sendReminder(repaymentId, 'email')
      alert('Reminder sent successfully')
    } catch (err) {
      console.warn('[FinanceDashboard] Send reminder failed:', err.message)
      alert('Reminder sent (demo mode)')
    }
  }

  const handleDownloadReport = async () => {
    try {
      const { blob, filename } = await apiService.downloadRepaymentsReport()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.warn('[FinanceDashboard] Report download failed:', err.message)
      alert('Report download initiated (demo mode)')
    }
  }

  const handleDownloadDisbursementsReport = async () => {
    try {
      const { blob, filename } = await apiService.downloadDisbursementsReport()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.warn('[FinanceDashboard] Disbursement report download failed:', err.message)
      alert('Disbursement report download initiated (demo mode)')
    }
  }

  const handlePaymentRecorded = () => {
    loadRepaymentData()
  }

  const handleQuickAction = (title) => {
    if (title === 'Add Tenant') setShowTenantModal(true)
    else if (title === 'View Reports') setShowReportsModal(true)
    else if (title === 'System Settings') setShowSettingsModal(true)
    else if (title === 'Notifications') setShowNotificationModal(true)
  }

  const handleAddTenantSubmit = async () => {
    if (!tenantForm.name || !tenantForm.email) {
      alert('Please enter tenant name and email')
      return
    }

    try {
      await apiService.createTenant(tenantForm)
      const list = [...tenants, { id: Date.now(), ...tenantForm }]
      setTenants(list)
      try { localStorage.setItem('tenants', JSON.stringify(list)) } catch {}
      setShowTenantModal(false)
      setTenantForm({ name: '', type: 'Bank', email: '', active: true })
      alert('Tenant added successfully')
    } catch (err) {
      console.warn('[FinanceDashboard] Failed to add tenant to backend:', err.message)
      const list = [...tenants, { id: Date.now(), ...tenantForm }]
      setTenants(list)
      try { localStorage.setItem('tenants', JSON.stringify(list)) } catch {}
      setShowTenantModal(false)
      setTenantForm({ name: '', type: 'Bank', email: '', active: true })
      alert('Tenant added (local storage)')
    }
  }

  const handleSaveSettings = async (next) => {
    const merged = { ...settings, ...next }

    try {
      await apiService.updateSetting(1, {
        email_notifications: merged.emailNotifications,
        sms_notifications: merged.smsNotifications,
      })
      setSettings(merged)
      try { localStorage.setItem('settings', JSON.stringify(merged)) } catch {}
      setShowSettingsModal(false)
      alert('Settings saved successfully')
    } catch (err) {
      console.warn('[FinanceDashboard] Failed to save settings to backend:', err.message)
      setSettings(merged)
      try { localStorage.setItem('settings', JSON.stringify(merged)) } catch {}
      setShowSettingsModal(false)
      alert('Settings saved (local storage)')
    }
  }

  const handleManageDisbursement = (row) => {
    setSelectedDisbursement(row)
    setShowManageDisbursementModal(true)
  }

  const updateDisbursementStatus = async (newStatus) => {
    try {
      await apiService.updateDisbursement(selectedDisbursement.id, { status: newStatus })
      setDisbursementData((prev) => {
        const snapshot = prev ?? mockDashboard.disbursement
        return {
          ...snapshot,
          allDisbursements: snapshot.allDisbursements.map((d) =>
            d.disbursementId === selectedDisbursement.disbursementId ? { ...d, status: newStatus } : d
          ),
        }
      })
      setShowManageDisbursementModal(false)
      setSelectedDisbursement(null)
      alert(`Status updated to ${newStatus}`)
    } catch (err) {
      console.warn('[FinanceDashboard] Failed to update disbursement:', err.message)
      setDisbursementData((prev) => {
        const snapshot = prev ?? mockDashboard.disbursement
        return {
          ...snapshot,
          allDisbursements: snapshot.allDisbursements.map((d) =>
            d.disbursementId === selectedDisbursement.disbursementId ? { ...d, status: newStatus } : d
          ),
        }
      })
      setShowManageDisbursementModal(false)
      setSelectedDisbursement(null)
      alert(`Status updated to ${newStatus} (local)`)
    }
  }

  // Sidebar content shared between mobile overlay and desktop fixed
  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-brand-border lg:border-none">
        <div className="rounded-full bg-indigo-100 p-2.5 text-indigo-600 shrink-0">
          <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor">
            <path d="M12 3l8 4v5c0 5-3 7-8 9-5-2-8-4-8-9V7z" strokeWidth={1.8} />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-slate-500 truncate">LOS Platform</p>
          <p className="text-base sm:text-lg font-semibold text-brand-text truncate">Finance Dashboard</p>
        </div>
        {/* Close button for mobile */}
        <button
          className="ml-auto lg:hidden p-1 rounded-full text-brand-text/60 hover:bg-slate-100"
          onClick={() => setSidebarOpen(false)}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="mt-2 space-y-1 px-3 sm:px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.key
          return (
            <button
              key={item.label}
              onClick={() => handleNavChange(item.key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base font-semibold transition ${
                isActive
                  ? 'bg-brand-accent text-white shadow-sm'
                  : 'text-brand-text/70 hover:bg-white'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-brand-text/60'}>
                {navIcon(item.key)}
              </span>
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="mt-1 px-3 sm:px-4 space-y-1">
        <button
          onClick={() => { handleQuickAction('Add Tenant'); setSidebarOpen(false) }}
          className="flex w-full items-center gap-3 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base font-semibold transition text-brand-text/70 hover:bg-white"
        >
          <span className="text-brand-text/60">{navIcon('users')}</span>
          Add Tenant
        </button>
        <button
          onClick={() => { handleQuickAction('View Reports'); setSidebarOpen(false) }}
          className="flex w-full items-center gap-3 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base font-semibold transition text-brand-text/70 hover:bg-white"
        >
          <span className="text-brand-text/60">{navIcon('analytics')}</span>
          View Reports
        </button>
        <button
          onClick={() => { handleQuickAction('System Settings'); setSidebarOpen(false) }}
          className="flex w-full items-center gap-3 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-left text-sm sm:text-base font-semibold transition text-brand-text/70 hover:bg-white"
        >
          <span className="text-brand-text/60">{navIcon('settings')}</span>
          System Settings
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-brand-surface">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-brand-border bg-white transform transition-transform duration-200 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar (always visible) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-brand-border bg-white">
        <SidebarContent />
      </aside>

      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-brand-border bg-white px-3 sm:px-6 lg:px-10 py-2 gap-2">
          {/* Hamburger for mobile */}
          <button
            className="lg:hidden p-2 rounded-lg text-brand-text/70 hover:bg-slate-100 shrink-0"
            onClick={() => setSidebarOpen(true)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="min-w-0 flex-1 lg:flex-none">
            <h1 className="text-lg sm:text-2xl font-semibold text-brand-text truncate">Finance Dashboard</h1>
            <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">LOS Platform Overview</p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={handleGenerateReport}
              disabled={reportState.loading}
              className="hidden sm:block rounded-full border border-brand-border bg-white px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-accent whitespace-nowrap"
            >
              {reportState.loading ? 'Generating…' : 'Export Report'}
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshInProgress}
              className="rounded-full bg-brand-accent px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-indigo-500 disabled:opacity-50 whitespace-nowrap"
            >
              {refreshInProgress ? 'Refreshing…' : 'Refresh'}
            </button>
            <div className="hidden h-8 w-px bg-brand-border md:block" />
            <button
              onClick={() => setShowProfileModal(true)}
              aria-label="Profile"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-brand-border overflow-hidden bg-indigo-100 text-center text-xs sm:text-sm font-semibold leading-8 sm:leading-9 text-indigo-700 shrink-0"
            >
              {(() => {
                const img = localStorage.getItem('profileImage')
                if (img) {
                  return <img src={img} alt="Profile" className="h-full w-full object-cover" />
                }
                const displayName = localStorage.getItem('displayName')
                const email = localStorage.getItem('userEmail') || 'admin@los.com'
                const source = displayName || email.split('@')[0] || 'Admin'
                return source.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
              })()}
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="px-3 sm:px-6 lg:px-10 py-4 sm:py-6">
          <div className="mx-auto max-w-[1000px] space-y-4">

            {activeView === 'overview' ? (
              <>
                <section className="grid gap-3 sm:gap-4 grid-cols-2 xl:grid-cols-4">
                  {kpiItems.map((item) => {
                    const normalized = normalizeKpi(data?.kpis?.[item.key])
                    return (
                      <KpiCard
                        key={item.key}
                        label={item.label}
                        value={normalized.value}
                        helper={item.helper}
                        trend={normalized.trend}
                        formatter={item.formatter}
                      />
                    )
                  })}
                </section>

                <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
                  <div className="rounded-2xl border border-brand-border bg-brand-panel p-4 sm:p-5 shadow-glow">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-base sm:text-lg font-semibold text-brand-text">Quick Actions</p>
                        <p className="text-xs sm:text-sm text-slate-500">Perform frequently used workflows</p>
                      </div>
                    </div>
                    <div className="grid gap-3 grid-cols-2">
                      {QUICK_ACTIONS.map((action) => (
                        <button
                          key={action.title}
                          onClick={() => handleQuickAction(action.title)}
                          className={`rounded-2xl border border-brand-border bg-gradient-to-br px-3 sm:px-4 py-4 sm:py-5 text-left transition hover:-translate-y-0.5 hover:border-brand-accent hover:shadow ${action.accent}`}
                        >
                          <p className="text-xs sm:text-sm font-semibold">{action.title}</p>
                          <p className="text-xs text-brand-text/60 hidden sm:block">{action.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-brand-border bg-brand-panel p-4 sm:p-5 shadow-glow">
                    <div className="mb-4">
                      <p className="text-base sm:text-lg font-semibold text-brand-text">Recent Activity</p>
                      <p className="text-xs sm:text-sm text-slate-500">Latest events from finance ops</p>
                    </div>
                    <ul className="space-y-3 sm:space-y-4">
                      {recentActivity.map((event) => {
                        const tone =
                          event.status === 'success'
                            ? 'bg-brand-accent/10 text-brand-accent'
                            : event.status === 'warning'
                              ? 'bg-blue-200 text-blue-800'
                              : 'bg-blue-50 text-blue-700'
                        return (
                          <li key={event.id} className="flex items-start gap-2 sm:gap-3">
                            <span className={`mt-0.5 rounded-full px-1.5 sm:px-2 py-0.5 text-xs font-semibold shrink-0 ${tone}`}>
                              {event.status === 'success' ? 'Approved' : event.status === 'warning' ? 'Alert' : 'Info'}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-semibold text-brand-text truncate">{event.title}</p>
                              <p className="text-xs text-slate-500 truncate">{event.entity}</p>
                              <p className="text-xs text-slate-400">{formatDateTime(event.timestamp)}</p>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </section>

                <section className="grid gap-4 lg:grid-cols-2">
                  <ChartCard title="Disbursement Trends" subtitle="Monthly disbursements (₹ in Millions)">
                    <div className="h-56 sm:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={disbursementTrends}>
                          <CartesianGrid strokeDasharray="4 4" stroke="#dbeafe" />
                          <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#4b6cb7', fontSize: 11 }} />
                          <YAxis stroke="#94a3b8" tick={{ fill: '#4b6cb7', fontSize: 11 }} tickFormatter={(value) => `${value}M`} width={50} />
                          <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: 12, borderColor: '#dbeafe' }} labelStyle={{ color: '#1d4ed8' }} formatter={(value) => [`${value}M`, 'Disbursed']} />
                          <Line type="monotone" dataKey="disbursed" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, stroke: '#2563eb', fill: '#fff' }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>

                  <ChartCard title="Collection Performance" subtitle="Expected vs actual collections (₹ in Millions)">
                    <div className="h-56 sm:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={collectionPerformance} barCategoryGap={20}>
                          <CartesianGrid strokeDasharray="4 4" stroke="#dbeafe" />
                          <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#4b6cb7', fontSize: 11 }} />
                          <YAxis stroke="#94a3b8" tick={{ fill: '#4b6cb7', fontSize: 11 }} tickFormatter={(value) => `${value}M`} width={50} />
                          <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: 12, borderColor: '#dbeafe' }} labelStyle={{ color: '#1d4ed8' }} />
                          <Legend wrapperStyle={{ color: '#4b6cb7', fontSize: 12 }} />
                          <Bar dataKey="expected" fill="#cbdcfb" radius={[8, 8, 0, 0]} />
                          <Bar dataKey="actual" fill="#5a8dee" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
                </section>

                <section className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                  <ChartCard compact title="Payment Status Distribution" subtitle="Share of outstanding loans by repayment status">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="w-40 h-40 sm:w-48 sm:h-48 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={paymentStatusDistribution} dataKey="value" nameKey="status" cx="50%" cy="50%" innerRadius={0} outerRadius="85%" stroke="none">
                              {paymentStatusDistribution.map((entry) => (
                                <Cell key={entry.status} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value}%`, name]} contentStyle={{ backgroundColor: '#fff', borderRadius: 12, borderColor: '#dbeafe' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 w-full">
                        <DonutLegend items={paymentStatusDistribution.map((item) => ({ label: item.status, value: item.value, color: item.color }))} />
                      </div>
                    </div>
                  </ChartCard>

                  <ChartCard compact title="Loan Portfolio Composition" subtitle="Outstanding value grouped by loan purpose">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="w-40 h-40 sm:w-48 sm:h-48 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={loanPortfolioComposition} dataKey="value" nameKey="type" cx="50%" cy="50%" innerRadius={0} outerRadius="85%" stroke="none">
                              {loanPortfolioComposition.map((entry) => (
                                <Cell key={entry.type} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value}%`, name]} contentStyle={{ backgroundColor: '#fff', borderRadius: 12, borderColor: '#dbeafe' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 w-full">
                        <DonutLegend items={loanPortfolioComposition.map((item) => ({ label: item.type, value: item.value, color: item.color }))} />
                      </div>
                    </div>
                  </ChartCard>
                </section>
              </>
            ) : isDisbursementView ? (
              <>
                <section className="grid gap-3 sm:gap-4 grid-cols-2 xl:grid-cols-4">
                  {disbursementKpis.map((item) => {
                    const entry = disbursementSnapshot?.kpis?.[item.key]
                    const normalized = normalizeKpi(entry)
                    const helperText = typeof item.helper === 'function' ? item.helper(entry) : item.helper
                    return (
                      <KpiCard key={item.key} label={item.label} value={normalized.value} helper={helperText} trend={normalized.trend} formatter={item.formatter} tone={item.tone} />
                    )
                  })}
                </section>

                {disbursementError && (
                  <div className="rounded-2xl border border-brand-border bg-brand-accentMuted/60 px-4 py-3 text-sm text-brand-text">{disbursementError}</div>
                )}

                <section className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                  <ChartCard title="Disbursement by Method" subtitle="Total value split by payment channels">
                    <div className="h-56 sm:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={disbursementByMethod} barCategoryGap={20}>
                          <CartesianGrid strokeDasharray="4 4" stroke="#dbeafe" />
                          <XAxis dataKey="method" stroke="#94a3b8" tick={{ fill: '#4b6cb7', fontSize: 11 }} />
                          <YAxis stroke="#94a3b8" tick={{ fill: '#4b6cb7', fontSize: 11 }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} width={65} />
                          <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: 12, borderColor: '#dbeafe' }} labelStyle={{ color: '#1d4ed8' }} formatter={(value) => [formatCurrency(value), 'Amount']} />
                          <Bar dataKey="amount" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>

                  <ChartCard compact title="Status Distribution" subtitle="Share of transactions by current status">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="w-40 h-40 sm:w-48 sm:h-48 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={disbursementStatusDistribution} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={0} outerRadius="85%" stroke="none">
                              {disbursementStatusDistribution.map((entry) => (
                                <Cell key={entry.status} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} txns`, name]} contentStyle={{ backgroundColor: '#fff', borderRadius: 12, borderColor: '#dbeafe' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex-1 w-full">
                        <DonutLegend items={disbursementStatusDistribution.map((item) => ({ label: item.status, value: item.count, color: item.color }))} />
                      </div>
                    </div>
                  </ChartCard>
                </section>

                <section className="rounded-2xl border border-brand-border bg-brand-panel p-4 sm:p-5 shadow-glow">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base sm:text-lg font-semibold text-brand-text">All Disbursements</p>
                      <p className="text-xs sm:text-sm text-slate-500">Track transaction-level activity, statuses, and methods</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handleDownloadDisbursementsReport} className="rounded-lg border border-brand-border px-3 py-1.5 text-xs sm:text-sm font-semibold text-brand-text transition hover:border-brand-accent">
                        Download CSV
                      </button>
                      <span className="text-xs font-semibold text-brand-text/70">
                        {disbursementLoading ? 'Syncing…' : `${disbursementTable.length} records`}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="min-w-[600px] px-4 sm:px-0">
                      <table className="w-full divide-y divide-brand-border text-sm">
                        <thead>
                          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-brand-text/60">
                            <th className="py-3 pr-3">Disbursement ID</th>
                            <th className="py-3 pr-3">Loan ID</th>
                            <th className="py-3 pr-3">Recipient</th>
                            <th className="py-3 pr-3">Amount</th>
                            <th className="py-3 pr-3">Date</th>
                            <th className="py-3 pr-3">Status</th>
                            <th className="py-3 pr-3">Method</th>
                            <th className="py-3">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border text-brand-text/80">
                          {disbursementTable.map((row) => (
                            <tr key={row.disbursementId}>
                              <td className="py-3 pr-3 font-semibold text-brand-text text-xs sm:text-sm">{row.disbursementId}</td>
                              <td className="py-3 pr-3 text-xs sm:text-sm">{row.loanId}</td>
                              <td className="py-3 pr-3 text-xs sm:text-sm">{row.recipientName}</td>
                              <td className="py-3 pr-3 font-semibold text-xs sm:text-sm">{formatCurrency(row.amount)}</td>
                              <td className="py-3 pr-3 text-xs sm:text-sm">{formatDateTime(row.date).split(',')[0]}</td>
                              <td className="py-3 pr-3">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeTone(row.status)}`}>{row.status}</span>
                              </td>
                              <td className="py-3 pr-3 text-xs sm:text-sm">{row.paymentMethod}</td>
                              <td className="py-3">
                                <button onClick={() => handleManageDisbursement(row)} className="rounded-full border border-brand-border px-2 sm:px-3 py-1 text-xs font-semibold text-brand-text transition hover:border-brand-accent">
                                  Manage
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              </>
            ) : isReconciliationView ? (
              <>
                {(() => {
                  const reconciliationSnapshot = reconciliationData ?? mockDashboard.reconciliation
                  const summary = reconciliationSnapshot?.summary ?? {}
                  const transactions = reconciliationSnapshot?.transactions ?? []
                  const averageAmount = summary.totalCount > 0 ? summary.totalValue / summary.totalCount : 0
                  const reconciledValue = transactions.filter((t) => t.status === 'Reconciled').reduce((sum, t) => sum + t.amount, 0)
                  const unreconciledValue = transactions.filter((t) => t.status === 'Unreconciled').reduce((sum, t) => sum + t.amount, 0)
                  const pendingValue = transactions.filter((t) => t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0)

                  const reconciliationKpis = [
                    { key: 'totalTransactions', label: 'Total Transactions', helper: `${summary.totalCount ?? 0} transactions`, formatter: (value) => formatCurrency(value), value: summary.totalValue },
                    { key: 'averageAmount', label: 'Average Amount', helper: 'Per transaction', formatter: (value) => formatCurrency(value), value: averageAmount },
                    { key: 'reconciled', label: 'Reconciled', helper: `${summary.reconciledCount ?? 0} transactions`, formatter: (value) => formatCurrency(value), value: reconciledValue },
                    { key: 'unreconciled', label: 'Unreconciled', helper: `${summary.unreconciledCount ?? 0} transactions`, formatter: (value) => formatCurrency(value), value: unreconciledValue, tone: 'danger' },
                    { key: 'pending', label: 'Pending', helper: `${summary.pendingCount ?? 0} transactions`, formatter: (value) => formatCurrency(value), value: pendingValue },
                  ]

                  const statusDistribution = summary.distribution
                    ? summary.distribution.map((item) => ({
                        status: item.status,
                        count: item.count,
                        percentage: summary.totalCount > 0 ? (item.count / summary.totalCount) * 100 : 0,
                        color: item.status === 'Reconciled' ? '#15803d' : item.status === 'Unreconciled' ? '#dc2626' : '#ca8a04',
                      }))
                    : []

                  const reconciliationStatusBadge = (status) => {
                    switch (status) {
                      case 'Reconciled': return 'bg-emerald-50 text-emerald-600'
                      case 'Unreconciled': return 'bg-red-50 text-red-600'
                      case 'Pending': return 'bg-amber-50 text-amber-600'
                      default: return 'bg-slate-50 text-slate-600'
                    }
                  }

                  const filteredTransactions = transactions.filter((t) => {
                    if (filters.descriptionQuery && !t.description.toLowerCase().includes(filters.descriptionQuery.toLowerCase())) return false
                    if (filters.dateFrom && t.transactionDate < filters.dateFrom) return false
                    if (filters.dateTo && t.transactionDate > filters.dateTo) return false
                    if (filters.statusFilter !== 'all' && t.status !== filters.statusFilter) return false
                    return true
                  })

                  const handleSelectAll = (checked) => {
                    if (checked) {
                      setSelectedTransactions(new Set(filteredTransactions.map((t) => t.transactionId)))
                    } else {
                      setSelectedTransactions(new Set())
                    }
                  }

                  const handleSelectTransaction = (transactionId, checked) => {
                    const newSet = new Set(selectedTransactions)
                    if (checked) newSet.add(transactionId)
                    else newSet.delete(transactionId)
                    setSelectedTransactions(newSet)
                  }

                  const allSelected = filteredTransactions.length > 0 && filteredTransactions.every((t) => selectedTransactions.has(t.transactionId))
                  const someSelected = filteredTransactions.some((t) => selectedTransactions.has(t.transactionId))

                  return (
                    <>
                      <section className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
                        {reconciliationKpis.map((item) => {
                          const normalized = normalizeKpi({ value: item.value })
                          return (
                            <KpiCard key={item.key} label={item.label} value={normalized.value} helper={item.helper} formatter={item.formatter} tone={item.tone} />
                          )
                        })}
                      </section>

                      {reconciliationError && (
                        <div className="rounded-2xl border border-brand-border bg-brand-accentMuted/60 px-4 py-3 text-sm text-brand-text">{reconciliationError}</div>
                      )}

                      <section>
                        <ChartCard compact title="Status Distribution" subtitle="Transaction status breakdown">
                          <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="w-40 h-40 sm:w-48 sm:h-48 shrink-0">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie data={statusDistribution} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={0} outerRadius="85%" stroke="none">
                                    {statusDistribution.map((entry) => (
                                      <Cell key={entry.status} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip formatter={(value, name) => [`${value} txns`, name]} contentStyle={{ backgroundColor: '#fff', borderRadius: 12, borderColor: '#dbeafe' }} />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex-1 w-full">
                              <DonutLegend items={statusDistribution.map((item) => ({ label: item.status, value: item.percentage.toFixed(1), color: item.color }))} />
                            </div>
                          </div>
                        </ChartCard>
                      </section>

                      <section className="rounded-2xl border border-brand-border bg-brand-panel p-4 sm:p-5 shadow-glow">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-base sm:text-lg font-semibold text-brand-text">Financial Transactions</p>
                            <p className="text-xs sm:text-sm text-slate-500">Reconcile and verify transaction status</p>
                          </div>
                          {selectedTransactions.size > 0 && (
                            <div className="relative">
                              <button
                                className="rounded-lg bg-brand-accent px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-indigo-500"
                                onClick={(e) => { e.stopPropagation(); setShowBulkActions(!showBulkActions) }}
                              >
                                Bulk Actions ({selectedTransactions.size})
                              </button>
                              {showBulkActions && (
                                <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-brand-border bg-white shadow-lg">
                                  <button onClick={() => handleBulkUpdate('RECONCILED')} className="block w-full px-4 py-2 text-left text-sm text-brand-text hover:bg-slate-50">Mark as Reconciled</button>
                                  <button onClick={() => handleBulkUpdate('UNRECONCILED')} className="block w-full px-4 py-2 text-left text-sm text-brand-text hover:bg-slate-50">Mark as Unreconciled</button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Filters */}
                        <div className="mb-4 flex flex-wrap gap-2 sm:gap-3">
                          <input
                            type="text"
                            placeholder="Search description..."
                            value={filters.descriptionQuery}
                            onChange={(e) => setFilters({ ...filters, descriptionQuery: e.target.value })}
                            className="flex-1 min-w-[140px] rounded-lg border border-brand-border px-3 py-2 text-xs sm:text-sm text-brand-text focus:border-brand-accent focus:outline-none"
                          />
                          <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} className="rounded-lg border border-brand-border px-2 sm:px-3 py-2 text-xs sm:text-sm text-brand-text focus:border-brand-accent focus:outline-none" />
                          <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} className="rounded-lg border border-brand-border px-2 sm:px-3 py-2 text-xs sm:text-sm text-brand-text focus:border-brand-accent focus:outline-none" />
                          <select value={filters.statusFilter} onChange={(e) => setFilters({ ...filters, statusFilter: e.target.value })} className="rounded-lg border border-brand-border px-2 sm:px-3 py-2 text-xs sm:text-sm text-brand-text focus:border-brand-accent focus:outline-none">
                            <option value="all">All Statuses</option>
                            <option value="Reconciled">Reconciled</option>
                            <option value="Unreconciled">Unreconciled</option>
                            <option value="Pending">Pending</option>
                          </select>
                          <button onClick={() => setFilters({ descriptionQuery: '', dateFrom: '', dateTo: '', statusFilter: 'all' })} className="rounded-lg border border-brand-border px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-brand-text transition hover:border-brand-accent">
                            Clear
                          </button>
                        </div>

                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                          <div className="min-w-[500px] px-4 sm:px-0">
                            <table className="w-full divide-y divide-brand-border text-sm">
                              <thead>
                                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-brand-text/60">
                                  <th className="py-3 pr-3">
                                    <input
                                      type="checkbox"
                                      checked={allSelected}
                                      ref={(input) => { if (input) input.indeterminate = someSelected && !allSelected }}
                                      onChange={(e) => handleSelectAll(e.target.checked)}
                                      className="h-4 w-4 rounded border-brand-border text-brand-accent focus:ring-brand-accent"
                                    />
                                  </th>
                                  <th className="py-3 pr-3">ID</th>
                                  <th className="py-3 pr-3">Date</th>
                                  <th className="py-3 pr-3">Description</th>
                                  <th className="py-3 pr-3">Amount</th>
                                  <th className="py-3 pr-3">Status</th>
                                  <th className="py-3">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-brand-border text-brand-text/80">
                                {filteredTransactions.map((row) => (
                                  <tr key={row.transactionId}>
                                    <td className="py-3 pr-3">
                                      <input type="checkbox" checked={selectedTransactions.has(row.transactionId)} onChange={(e) => handleSelectTransaction(row.transactionId, e.target.checked)} className="h-4 w-4 rounded border-brand-border text-brand-accent focus:ring-brand-accent" />
                                    </td>
                                    <td className="py-3 pr-3 font-semibold text-brand-text text-xs sm:text-sm">{row.transactionId}</td>
                                    <td className="py-3 pr-3 text-xs sm:text-sm">{row.transactionDate}</td>
                                    <td className="py-3 pr-3 text-xs sm:text-sm max-w-[120px] sm:max-w-none truncate">{row.description}</td>
                                    <td className="py-3 pr-3 font-semibold text-xs sm:text-sm">{formatCurrency(row.amount)}</td>
                                    <td className="py-3 pr-3">
                                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${reconciliationStatusBadge(row.status)}`}>{row.status}</span>
                                    </td>
                                    <td className="py-3">
                                      <button
                                        onClick={() => {
                                          const currentSelection = new Set(selectedTransactions)
                                          currentSelection.add(row.transactionId)
                                          setSelectedTransactions(currentSelection)
                                          const newStatus = row.status === 'Reconciled' ? 'UNRECONCILED' : 'RECONCILED'
                                          handleBulkUpdate(newStatus)
                                        }}
                                        className="rounded-full border border-brand-border px-2 sm:px-3 py-1 text-xs font-semibold text-brand-text transition hover:border-brand-accent"
                                      >
                                        Toggle
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </section>
                    </>
                  )
                })()}
              </>
            ) : isRepaymentView ? (
              <>
                {(() => {
                  const repaymentSnapshot = repaymentData ?? { totalRecords: 0, repayments: [], kpis: mockDashboard.repayment.kpis }
                  const repayments = repaymentSnapshot.repayments ?? []
                  const kpis = repaymentSnapshot.kpis ?? mockDashboard.repayment.kpis

                  const repaymentKpis = [
                    { key: 'totalDue', label: 'Total Due', helper: 'From 234 active loans', formatter: formatCurrency, value: kpis.totalDue?.value },
                    { key: 'collectedThisMonth', label: 'Collected This Month', helper: 'Current calendar month', formatter: formatCurrency, value: kpis.collectedThisMonth?.value, trend: kpis.collectedThisMonth?.trend },
                    { key: 'overdueAmount', label: 'Overdue Amount', helper: `${kpis.overdueAmount?.overdueCount ?? 0} overdue accounts`, formatter: formatCurrency, value: kpis.overdueAmount?.value, tone: 'danger' },
                    { key: 'collectionRate', label: 'Collection Rate', helper: 'Collected vs target', formatter: (value) => formatPercent(value ?? 0, { digits: 0 }), value: kpis.collectionRate?.value },
                  ]

                  const repaymentStatusBadge = (status) => {
                    switch (status) {
                      case 'Paid': return 'bg-emerald-50 text-emerald-600'
                      case 'Pending': return 'bg-amber-50 text-amber-600'
                      case 'Overdue': return 'bg-red-50 text-red-600'
                      default: return 'bg-slate-50 text-slate-600'
                    }
                  }

                  const filteredRepayments = repayments.filter((r) => {
                    if (repaymentFilters.searchQuery) {
                      const query = repaymentFilters.searchQuery.toLowerCase()
                      if (!r.borrowerName.toLowerCase().includes(query) && !r.loanId.toLowerCase().includes(query) && !r.repaymentId.toLowerCase().includes(query)) return false
                    }
                    if (repaymentFilters.dateFrom && r.dueDate < repaymentFilters.dateFrom) return false
                    if (repaymentFilters.dateTo && r.dueDate > repaymentFilters.dateTo) return false
                    if (repaymentFilters.status !== 'ALL_REPAYMENTS') {
                      if (repaymentFilters.status === 'Pending' && r.status !== 'Pending') return false
                      if (repaymentFilters.status === 'Overdue' && r.status !== 'Overdue') return false
                      if (repaymentFilters.status === 'Paid' && r.status !== 'Paid') return false
                    }
                    return true
                  })

                  return (
                    <>
                      <section className="grid gap-3 sm:gap-4 grid-cols-2 xl:grid-cols-4">
                        {repaymentKpis.map((item) => {
                          const normalized = normalizeKpi({ value: item.value, trend: item.trend })
                          return (
                            <KpiCard key={item.key} label={item.label} value={normalized.value} helper={item.helper} trend={normalized.trend} formatter={item.formatter} tone={item.tone} />
                          )
                        })}
                      </section>

                      {repaymentError && (
                        <div className="rounded-2xl border border-brand-border bg-brand-accentMuted/60 px-4 py-3 text-sm text-brand-text">{repaymentError}</div>
                      )}

                      <section className="rounded-2xl border border-brand-border bg-brand-panel p-4 sm:p-5 shadow-glow">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-base sm:text-lg font-semibold text-brand-text">Repayment List</p>
                            <p className="text-xs sm:text-sm text-slate-500">All scheduled repayment events</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button onClick={() => handleRecordPayment()} className="rounded-lg bg-brand-accent px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition hover:bg-indigo-500">
                              Record Payment
                            </button>
                            <button onClick={handleDownloadReport} className="rounded-lg border border-brand-border px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-brand-text transition hover:border-brand-accent">
                              Download CSV
                            </button>
                          </div>
                        </div>

                        <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
                          <input
                            type="text"
                            placeholder="Search borrower, loan, or repayment ID..."
                            value={repaymentFilters.searchQuery}
                            onChange={(e) => setRepaymentFilters({ ...repaymentFilters, searchQuery: e.target.value })}
                            className="flex-1 min-w-[160px] rounded-lg border border-brand-border px-3 py-2 text-xs sm:text-sm text-brand-text focus:border-brand-accent focus:outline-none"
                          />
                          <input type="date" value={repaymentFilters.dateFrom} onChange={(e) => setRepaymentFilters({ ...repaymentFilters, dateFrom: e.target.value })} className="rounded-lg border border-brand-border px-2 sm:px-3 py-2 text-xs sm:text-sm text-brand-text focus:border-brand-accent focus:outline-none" />
                          <input type="date" value={repaymentFilters.dateTo} onChange={(e) => setRepaymentFilters({ ...repaymentFilters, dateTo: e.target.value })} className="rounded-lg border border-brand-border px-2 sm:px-3 py-2 text-xs sm:text-sm text-brand-text focus:border-brand-accent focus:outline-none" />
                          <select value={repaymentFilters.status} onChange={(e) => setRepaymentFilters({ ...repaymentFilters, status: e.target.value })} className="rounded-lg border border-brand-border px-2 sm:px-3 py-2 text-xs sm:text-sm text-brand-text focus:border-brand-accent focus:outline-none">
                            <option value="ALL_REPAYMENTS">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Overdue">Overdue</option>
                            <option value="Paid">Paid</option>
                          </select>
                          <button onClick={() => setRepaymentFilters({ status: 'ALL_REPAYMENTS', dateFrom: '', dateTo: '', searchQuery: '' })} className="rounded-lg border border-brand-border px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-brand-text transition hover:border-brand-accent">
                            Clear
                          </button>
                        </div>

                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                          <div className="min-w-[640px] px-4 sm:px-0">
                            <table className="w-full divide-y divide-brand-border text-sm">
                              <thead>
                                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-brand-text/60">
                                  <th className="py-3 pr-3">Repayment ID</th>
                                  <th className="py-3 pr-3">Borrower</th>
                                  <th className="py-3 pr-3">Loan ID</th>
                                  <th className="py-3 pr-3">Amount</th>
                                  <th className="py-3 pr-3">Due Date</th>
                                  <th className="py-3 pr-3">Status</th>
                                  <th className="py-3 pr-3">Type</th>
                                  <th className="py-3">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-brand-border text-brand-text/80">
                                {filteredRepayments.map((row) => (
                                  <tr key={row.repaymentId}>
                                    <td className="py-3 pr-3 font-semibold text-brand-text text-xs sm:text-sm">{row.repaymentId}</td>
                                    <td className="py-3 pr-3 text-xs sm:text-sm">{row.borrowerName}</td>
                                    <td className="py-3 pr-3 text-xs sm:text-sm">{row.loanId}</td>
                                    <td className="py-3 pr-3 font-semibold text-xs sm:text-sm">{formatCurrency(row.amountDue)}</td>
                                    <td className="py-3 pr-3 text-xs sm:text-sm">{row.dueDate}</td>
                                    <td className="py-3 pr-3">
                                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${repaymentStatusBadge(row.status)}`}>{row.status}</span>
                                    </td>
                                    <td className="py-3 pr-3 text-xs sm:text-sm">{row.repaymentType}</td>
                                    <td className="py-3">
                                      <div className="flex gap-1.5">
                                        {row.status === 'Pending' || row.status === 'Overdue' ? (
                                          <>
                                            <button onClick={() => handleRecordPayment(row.repaymentId)} className="rounded-full border border-brand-border px-2 sm:px-3 py-1 text-xs font-semibold text-brand-text transition hover:border-brand-accent whitespace-nowrap">
                                              Pay
                                            </button>
                                            <button onClick={() => handleSendReminder(row.repaymentId)} className="rounded-full border border-brand-border px-2 sm:px-3 py-1 text-xs font-semibold text-brand-text transition hover:border-brand-accent whitespace-nowrap hidden sm:inline-block">
                                              Remind
                                            </button>
                                          </>
                                        ) : row.status === 'Paid' ? (
                                          <button onClick={() => alert(`View receipt for ${row.repaymentId}`)} className="rounded-full border border-brand-border px-2 sm:px-3 py-1 text-xs font-semibold text-brand-text transition hover:border-brand-accent whitespace-nowrap">
                                            Receipt
                                          </button>
                                        ) : null}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {filteredRepayments.length === 0 && (
                              <div className="py-8 text-center text-sm text-brand-text/60">No repayments found matching the filters.</div>
                            )}
                          </div>
                        </div>
                      </section>
                    </>
                  )
                })()}
              </>
            ) : null}
          </div>
        </div>
      </main>

      {/* All Modals */}
      <RecordPaymentModal
        isOpen={showRecordPaymentModal}
        onClose={() => { setShowRecordPaymentModal(false); setSelectedRepaymentId(null) }}
        repaymentId={selectedRepaymentId}
        onSuccess={handlePaymentRecorded}
      />
      <NotificationModal isOpen={showNotificationModal} onClose={() => setShowNotificationModal(false)} />

      {/* Tenant Modal */}
      {showTenantModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm" onClick={() => setShowTenantModal(false)}>
          <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-brand-border bg-white shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-brand-border px-5 sm:px-6 py-4">
              <h2 className="text-lg font-semibold text-brand-text">Add Tenant</h2>
              <button onClick={() => setShowTenantModal(false)} className="rounded-full p-1 text-brand-text/60 transition hover:bg-brand-border hover:text-brand-text">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4 px-5 sm:px-6 py-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-brand-text">Name</label>
                <input type="text" value={tenantForm.name} onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })} className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-text focus:border-brand-accent focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-brand-text">Type</label>
                <select value={tenantForm.type} onChange={(e) => setTenantForm({ ...tenantForm, type: e.target.value })} className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-text focus:border-brand-accent focus:outline-none">
                  <option>Bank</option>
                  <option>NBFC</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-brand-text">Contact Email</label>
                <input type="email" value={tenantForm.email} onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })} className="w-full rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-text focus:border-brand-accent focus:outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <input id="tenant-active" type="checkbox" checked={tenantForm.active} onChange={(e) => setTenantForm({ ...tenantForm, active: e.target.checked })} />
                <label htmlFor="tenant-active" className="text-sm text-brand-text">Active</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-brand-border px-5 sm:px-6 py-4">
              <button onClick={() => setShowTenantModal(false)} className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-text">Cancel</button>
              <button onClick={handleAddTenantSubmit} className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500">Save Tenant</button>
            </div>
          </div>
        </div>
      )}

      {/* Reports Modal */}
      {showReportsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm" onClick={() => setShowReportsModal(false)}>
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-brand-border bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-brand-border px-5 sm:px-6 py-4">
              <h2 className="text-lg font-semibold text-brand-text">View Reports</h2>
              <button onClick={() => setShowReportsModal(false)} className="rounded-full p-1 text-brand-text/60 transition hover:bg-brand-border hover:text-brand-text">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-3 px-5 sm:px-6 py-4">
              <p className="text-sm text-slate-600">Choose a report to download</p>
              <button onClick={() => { setShowReportsModal(false); handleGenerateReport() }} className="w-full rounded-lg bg-brand-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500">Finance Summary (HTML)</button>
              <button onClick={() => { setShowReportsModal(false); handleDownloadReport() }} className="w-full rounded-lg border border-brand-border px-4 py-2.5 text-sm font-semibold text-brand-text transition hover:border-brand-accent">Repayment Report (CSV)</button>
              <button onClick={() => { setShowReportsModal(false); handleDownloadDisbursementsReport() }} className="w-full rounded-lg border border-brand-border px-4 py-2.5 text-sm font-semibold text-brand-text transition hover:border-brand-accent">Disbursement Report (CSV)</button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm" onClick={() => setShowSettingsModal(false)}>
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-brand-border bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-brand-border px-5 sm:px-6 py-4">
              <h2 className="text-lg font-semibold text-brand-text">System Settings</h2>
              <button onClick={() => setShowSettingsModal(false)} className="rounded-full p-1 text-brand-text/60 transition hover:bg-brand-border hover:text-brand-text">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4 px-5 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-text">Email Notifications</p>
                  <p className="text-xs text-slate-500">Receive alerts via email</p>
                </div>
                <input type="checkbox" checked={settings.emailNotifications} onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-text">SMS Notifications</p>
                  <p className="text-xs text-slate-500">Receive alerts via SMS</p>
                </div>
                <input type="checkbox" checked={settings.smsNotifications} onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-brand-border px-5 sm:px-6 py-4">
              <button onClick={() => setShowSettingsModal(false)} className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-text">Cancel</button>
              <button onClick={() => handleSaveSettings({})} className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500">Save Settings</button>
            </div>
          </div>
        </div>
      )}

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      {/* Manage Disbursement Modal */}
      {showManageDisbursementModal && selectedDisbursement && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm" onClick={() => setShowManageDisbursementModal(false)}>
          <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-brand-border bg-white shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-brand-border px-5 sm:px-6 py-4">
              <h2 className="text-lg font-semibold text-brand-text">Manage Disbursement</h2>
              <button onClick={() => setShowManageDisbursementModal(false)} className="rounded-full p-1 text-brand-text/60 transition hover:bg-brand-border hover:text-brand-text">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-4 px-5 sm:px-6 py-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div><p className="font-semibold text-brand-text">Disbursement ID</p><p className="text-slate-600">{selectedDisbursement.disbursementId}</p></div>
                <div><p className="font-semibold text-brand-text">Loan ID</p><p className="text-slate-600">{selectedDisbursement.loanId}</p></div>
                <div><p className="font-semibold text-brand-text">Recipient</p><p className="text-slate-600">{selectedDisbursement.recipientName}</p></div>
                <div><p className="font-semibold text-brand-text">Amount</p><p className="text-slate-600">{formatCurrency(selectedDisbursement.amount)}</p></div>
                <div><p className="font-semibold text-brand-text">Status</p><p className="text-slate-600">{selectedDisbursement.status}</p></div>
                <div><p className="font-semibold text-brand-text">Method</p><p className="text-slate-600">{selectedDisbursement.paymentMethod}</p></div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => updateDisbursementStatus('Pending')} className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-text transition hover:border-brand-accent">Mark Pending</button>
                <button onClick={() => updateDisbursementStatus('Paid')} className="rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500">Mark Paid</button>
                <button onClick={() => updateDisbursementStatus('Failed')} className="rounded-lg border border-brand-border px-4 py-2 text-sm font-semibold text-brand-text transition hover:border-brand-accent">Mark Failed</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FinanceDashboard