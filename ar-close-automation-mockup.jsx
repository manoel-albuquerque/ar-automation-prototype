import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Calendar,
  Play,
  History,
  Link2,
  LogOut,
  Loader2,
  FileText,
  DollarSign,
  CreditCard,
  Sparkles,
  Check,
  X,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

// QuickBooks-inspired color palette
const colors = {
  primary: '#2CA01C',      // QuickBooks green
  primaryDark: '#1E7A14',
  primaryLight: '#E8F5E6',
  secondary: '#0077C5',    // QuickBooks blue
  secondaryLight: '#E6F3FA',
  slate: '#393A3D',
  slateLight: '#6B6C72',
  background: '#F4F5F7',
  white: '#FFFFFF',
  border: '#D4D7DC',
  warning: '#FF9800',
  warningLight: '#FFF3E0',
  error: '#D32F2F',
  errorLight: '#FFEBEE',
  purple: '#7B1FA2',
  purpleLight: '#F3E5F5',
};

// Mock data for demonstration
const mockInvoices = [
  { id: 'INV-001', docNum: '1042', customer: 'Acme Corp', date: '2024-01-15', dueDate: '2024-02-14', balance: 4500.00 },
  { id: 'INV-002', docNum: '1043', customer: 'TechStart LLC', date: '2024-01-18', dueDate: '2024-02-17', balance: 2250.00 },
  { id: 'INV-003', docNum: '1044', customer: 'Global Industries', date: '2024-01-20', dueDate: '2024-02-19', balance: 8750.00 },
  { id: 'INV-004', docNum: '1045', customer: 'Acme Corp', date: '2024-01-22', dueDate: '2024-02-21', balance: 1500.00 },
  { id: 'INV-005', docNum: '1046', customer: 'Smith & Co', date: '2024-01-25', dueDate: '2024-02-24', balance: 3200.00 },
];

const mockPayments = [
  { id: 'PMT-001', customer: 'Acme Corp', date: '2024-01-28', total: 6000.00, unapplied: 6000.00, ref: 'CHK-8842', memo: 'Jan invoices' },
  { id: 'PMT-002', customer: 'TechStart LLC', date: '2024-01-29', total: 2250.00, unapplied: 2250.00, ref: 'ACH-1129', memo: '' },
  { id: 'PMT-003', customer: 'Global Industries', date: '2024-01-30', total: 8750.00, unapplied: 8750.00, ref: 'WIRE-445', memo: 'Payment for inv 1044' },
  { id: 'PMT-004', customer: 'Smith & Co', date: '2024-01-30', total: 3000.00, unapplied: 3000.00, ref: 'CHK-2201', memo: 'Partial' },
];

const mockMatches = [
  {
    tier: 1,
    confidence: 'exact',
    paymentId: 'PMT-002',
    paymentAmount: 2250.00,
    invoiceIds: ['INV-002'],
    amountApplied: 2250.00,
    reasoning: "Perfect match: Payment amount of $2,250.00 exactly matches Invoice #1043 balance. Customer names match (TechStart LLC). Payment date (Jan 29) is after invoice date (Jan 18). ACH reference confirms electronic payment.",
    approved: true
  },
  {
    tier: 1,
    confidence: 'exact',
    paymentId: 'PMT-003',
    paymentAmount: 8750.00,
    invoiceIds: ['INV-003'],
    amountApplied: 8750.00,
    reasoning: "Perfect match: Payment amount of $8,750.00 exactly matches Invoice #1044 balance. Customer names match (Global Industries). Memo explicitly references 'inv 1044'. Wire transfer provides reliable payment method.",
    approved: true
  },
  {
    tier: 2,
    confidence: 'high',
    paymentId: 'PMT-001',
    paymentAmount: 6000.00,
    invoiceIds: ['INV-001', 'INV-004'],
    amountApplied: 6000.00,
    reasoning: "Multi-invoice match: Payment of $6,000.00 from Acme Corp matches combined balance of Invoice #1042 ($4,500) + Invoice #1045 ($1,500) = $6,000. Memo mentions 'Jan invoices' supporting batch payment. Customer match confirmed.",
    approved: true
  },
  {
    tier: 3,
    confidence: 'medium',
    paymentId: 'PMT-004',
    paymentAmount: 3000.00,
    invoiceIds: ['INV-005'],
    amountApplied: 3000.00,
    writeOff: 200.00,
    reasoning: "Partial match with small variance: Payment of $3,000 from Smith & Co is $200 less than Invoice #1046 balance of $3,200. Memo indicates 'Partial' payment. Recommend applying $3,000 and flagging $200 remaining balance for follow-up or write-off review.",
    approved: true
  },
];

const mockExecutionResults = [
  { actionType: 'Apply Payment', paymentId: 'PMT-002', invoiceIds: ['INV-002'], qboTxnId: 'TXN-88291', status: 'success' },
  { actionType: 'Apply Payment', paymentId: 'PMT-003', invoiceIds: ['INV-003'], qboTxnId: 'TXN-88292', status: 'success' },
  { actionType: 'Apply Payment', paymentId: 'PMT-001', invoiceIds: ['INV-001', 'INV-004'], qboTxnId: 'TXN-88293', status: 'success' },
  { actionType: 'Apply Payment', paymentId: 'PMT-004', invoiceIds: ['INV-005'], qboTxnId: 'TXN-88294', status: 'success' },
];

const mockRunHistory = [
  { runId: 'run_8a7f3c2d', closeDate: '2024-01-30', status: 'completed', matchCount: 4, totalMatched: 20200.00 },
  { runId: 'run_6b4e1a9f', closeDate: '2024-01-23', status: 'completed', matchCount: 7, totalMatched: 34500.00 },
  { runId: 'run_2c8d5e7a', closeDate: '2024-01-16', status: 'completed', matchCount: 5, totalMatched: 18750.00 },
  { runId: 'run_9f3a2b1c', closeDate: '2024-01-09', status: 'completed', matchCount: 3, totalMatched: 12200.00 },
];

// Components
const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const variants = {
    default: { bg: colors.slateLight, text: colors.white },
    success: { bg: colors.primary, text: colors.white },
    successLight: { bg: colors.primaryLight, text: colors.primaryDark },
    warning: { bg: colors.warning, text: colors.white },
    warningLight: { bg: colors.warningLight, text: '#E65100' },
    error: { bg: colors.error, text: colors.white },
    errorLight: { bg: colors.errorLight, text: colors.error },
    blue: { bg: colors.secondary, text: colors.white },
    blueLight: { bg: colors.secondaryLight, text: colors.secondary },
    purple: { bg: colors.purple, text: colors.white },
    purpleLight: { bg: colors.purpleLight, text: colors.purple },
    orange: { bg: '#FF6D00', text: colors.white },
    orangeLight: { bg: '#FFF3E0', text: '#E65100' },
  };

  const sizes = {
    sm: { padding: '2px 8px', fontSize: '11px' },
    md: { padding: '4px 12px', fontSize: '12px' },
  };

  const style = variants[variant] || variants.default;
  const sizeStyle = sizes[size] || sizes.md;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: sizeStyle.padding,
      borderRadius: '4px',
      fontSize: sizeStyle.fontSize,
      fontWeight: 600,
      backgroundColor: style.bg,
      color: style.text,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }}>
      {children}
    </span>
  );
};

const Card = ({ children, style = {} }) => (
  <div style={{
    backgroundColor: colors.white,
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    ...style
  }}>
    {children}
  </div>
);

const Button = ({ children, variant = 'primary', size = 'md', icon: Icon, disabled, onClick, style = {} }) => {
  const variants = {
    primary: {
      bg: colors.primary,
      hoverBg: colors.primaryDark,
      text: colors.white,
      border: 'none',
    },
    secondary: {
      bg: colors.white,
      hoverBg: colors.background,
      text: colors.slate,
      border: `1px solid ${colors.border}`,
    },
    danger: {
      bg: colors.white,
      hoverBg: colors.errorLight,
      text: colors.error,
      border: `1px solid ${colors.error}`,
    },
    ghost: {
      bg: 'transparent',
      hoverBg: colors.background,
      text: colors.slateLight,
      border: 'none',
    },
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '13px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '16px' },
  };

  const v = variants[variant];
  const s = sizes[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 600,
        borderRadius: '6px',
        backgroundColor: disabled ? colors.border : v.bg,
        color: disabled ? colors.slateLight : v.text,
        border: v.border,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
        ...style
      }}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

const StatCard = ({ icon: Icon, label, value, color = colors.primary }) => (
  <Card style={{ flex: 1, minWidth: '180px' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        backgroundColor: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '13px', color: colors.slateLight, marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '24px', fontWeight: 700, color: colors.slate }}>{value}</div>
      </div>
    </div>
  </Card>
);

const Checkbox = ({ checked, onChange }) => (
  <div
    onClick={onChange}
    style={{
      width: '20px',
      height: '20px',
      borderRadius: '4px',
      border: checked ? 'none' : `2px solid ${colors.border}`,
      backgroundColor: checked ? colors.primary : colors.white,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    }}
  >
    {checked && <Check size={14} color={colors.white} strokeWidth={3} />}
  </div>
);

const ExpandableTable = ({ title, icon: Icon, columns, data, expanded, onToggle }) => (
  <Card style={{ marginTop: '16px' }}>
    <div
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        marginBottom: expanded ? '16px' : 0,
      }}
    >
      {expanded ? <ChevronDown size={20} color={colors.slateLight} /> : <ChevronRight size={20} color={colors.slateLight} />}
      <Icon size={20} color={colors.primary} />
      <span style={{ fontWeight: 600, color: colors.slate }}>{title}</span>
      <Badge variant="successLight" size="sm">{data.length}</Badge>
    </div>

    {expanded && (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
              {columns.map((col, i) => (
                <th key={i} style={{
                  padding: '12px 16px',
                  textAlign: col.align || 'left',
                  fontWeight: 600,
                  color: colors.slateLight,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                {columns.map((col, j) => (
                  <td key={j} style={{
                    padding: '12px 16px',
                    textAlign: col.align || 'left',
                    color: colors.slate,
                  }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </Card>
);

const MatchCard = ({ match, index, onToggle }) => {
  const tierColors = {
    1: { variant: 'blueLight', label: 'Tier 1' },
    2: { variant: 'purpleLight', label: 'Tier 2' },
    3: { variant: 'orangeLight', label: 'Tier 3' },
  };

  const confidenceColors = {
    exact: 'successLight',
    high: 'successLight',
    medium: 'warningLight',
    low: 'errorLight',
  };

  const tier = tierColors[match.tier];

  return (
    <Card style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ paddingTop: '4px' }}>
          <Checkbox checked={match.approved} onChange={() => onToggle(index)} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <Badge variant={tier.variant}>{tier.label}</Badge>
            <Badge variant={confidenceColors[match.confidence]}>{match.confidence}</Badge>
            <span style={{ color: colors.slateLight, fontSize: '13px' }}>•</span>
            <span style={{ fontWeight: 600, color: colors.slate }}>{match.paymentId}</span>
            <span style={{ color: colors.slateLight }}>→</span>
            <span style={{ color: colors.secondary, fontWeight: 500 }}>{match.invoiceIds.join(', ')}</span>
          </div>

          <div style={{ display: 'flex', gap: '32px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '12px', color: colors.slateLight, marginBottom: '2px' }}>Payment Amount</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: colors.slate }}>
                ${match.paymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: colors.slateLight, marginBottom: '2px' }}>Amount Applied</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: colors.primary }}>
                ${match.amountApplied.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            {match.writeOff && (
              <div>
                <div style={{ fontSize: '12px', color: colors.slateLight, marginBottom: '2px' }}>Write-off</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: colors.warning }}>
                  ${match.writeOff.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            )}
          </div>

          {/* AI Reasoning - prominently displayed */}
          <div style={{
            backgroundColor: colors.background,
            borderRadius: '8px',
            padding: '16px',
            borderLeft: `4px solid ${colors.secondary}`,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              color: colors.secondary,
              fontWeight: 600,
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              <Sparkles size={14} />
              AI Analysis
            </div>
            <p style={{
              margin: 0,
              color: colors.slate,
              fontSize: '14px',
              lineHeight: 1.6,
              fontFamily: 'Georgia, serif',
            }}>
              {match.reasoning}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Main App Component
export default function ARCloseAutomation() {
  const [currentView, setCurrentView] = useState('connect'); // connect, progress, review, execution, history
  const [connected, setConnected] = useState(false);
  const [realmId, setRealmId] = useState(null);
  const [closeDate, setCloseDate] = useState('2024-01-30');
  const [runStatus, setRunStatus] = useState('idle'); // idle, pulling_data, matching, ready_for_review
  const [matches, setMatches] = useState(mockMatches);
  const [invoicesExpanded, setInvoicesExpanded] = useState(false);
  const [paymentsExpanded, setPaymentsExpanded] = useState(false);
  const [executionStatus, setExecutionStatus] = useState('idle'); // idle, executing, completed

  const formatCurrency = (amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const totalMatched = matches.filter(m => m.approved).reduce((sum, m) => sum + m.amountApplied, 0);
  const totalWriteOff = matches.filter(m => m.approved && m.writeOff).reduce((sum, m) => sum + (m.writeOff || 0), 0);
  const unmatchedPayments = mockPayments.length - matches.filter(m => m.approved).length;

  const toggleMatch = (index) => {
    setMatches(prev => prev.map((m, i) => i === index ? { ...m, approved: !m.approved } : m));
  };

  // Simulated actions
  const handleConnect = () => {
    setTimeout(() => {
      setConnected(true);
      setRealmId('123456789');
    }, 1000);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setRealmId(null);
    setCurrentView('connect');
  };

  const handleStartRun = () => {
    setCurrentView('progress');
    setRunStatus('pulling_data');
    setTimeout(() => setRunStatus('matching'), 2000);
    setTimeout(() => {
      setRunStatus('ready_for_review');
      setCurrentView('review');
    }, 4000);
  };

  const handleExecute = () => {
    setCurrentView('execution');
    setExecutionStatus('executing');
    setTimeout(() => setExecutionStatus('completed'), 2000);
  };

  const invoiceColumns = [
    { key: 'id', label: 'ID' },
    { key: 'docNum', label: 'Doc #' },
    { key: 'customer', label: 'Customer' },
    { key: 'date', label: 'Date' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'balance', label: 'Balance', align: 'right', render: (v) => formatCurrency(v) },
  ];

  const paymentColumns = [
    { key: 'id', label: 'ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'date', label: 'Date' },
    { key: 'total', label: 'Total', align: 'right', render: (v) => formatCurrency(v) },
    { key: 'unapplied', label: 'Unapplied', align: 'right', render: (v) => formatCurrency(v) },
    { key: 'ref', label: 'Ref #' },
    { key: 'memo', label: 'Memo' },
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: colors.background,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Sidebar */}
      <div style={{
        width: '260px',
        backgroundColor: colors.white,
        borderRight: `1px solid ${colors.border}`,
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 24px 24px', borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <RefreshCw size={22} color={colors.white} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: colors.slate, fontSize: '16px' }}>AR Close</div>
              <div style={{ fontSize: '12px', color: colors.slateLight }}>Automation</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {[
            { id: 'connect', icon: Link2, label: 'Connection' },
            { id: 'review', icon: FileText, label: 'Current Run', disabled: !connected },
            { id: 'history', icon: History, label: 'Run History', disabled: !connected },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => !item.disabled && setCurrentView(item.id)}
              disabled={item.disabled}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                marginBottom: '4px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: currentView === item.id ? colors.primaryLight : 'transparent',
                color: item.disabled ? colors.border : currentView === item.id ? colors.primaryDark : colors.slateLight,
                fontSize: '14px',
                fontWeight: currentView === item.id ? 600 : 400,
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* QuickBooks Status */}
        {connected && (
          <div style={{ padding: '16px 24px', borderTop: `1px solid ${colors.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircle size={16} color={colors.primary} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: colors.primary }}>Connected</span>
            </div>
            <div style={{ fontSize: '12px', color: colors.slateLight }}>Realm: {realmId}</div>
            <button
              onClick={handleDisconnect}
              style={{
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                color: colors.error,
                backgroundColor: 'transparent',
                border: `1px solid ${colors.error}`,
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              <LogOut size={14} />
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        {/* Connect Page */}
        {currentView === 'connect' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: colors.slate, marginBottom: '8px' }}>
              Connect to QuickBooks
            </h1>
            <p style={{ fontSize: '16px', color: colors.slateLight, marginBottom: '32px' }}>
              Link your QuickBooks Online account to start automating AR close
            </p>

            <Card>
              {!connected ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '16px',
                    backgroundColor: colors.primaryLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                  }}>
                    <Link2 size={36} color={colors.primary} />
                  </div>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, color: colors.slate, marginBottom: '12px' }}>
                    Not Connected
                  </h2>
                  <p style={{ fontSize: '14px', color: colors.slateLight, marginBottom: '24px', maxWidth: '360px', margin: '0 auto 24px' }}>
                    Connect your QuickBooks Online account to pull invoices and payments for matching
                  </p>
                  <Button onClick={handleConnect} size="lg" icon={ExternalLink}>
                    Connect to QuickBooks
                  </Button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <CheckCircle size={24} color={colors.primary} />
                    <span style={{ fontSize: '18px', fontWeight: 600, color: colors.primary }}>
                      Connected to QuickBooks
                    </span>
                    <Badge variant="successLight">Realm: {realmId}</Badge>
                  </div>

                  <div style={{
                    padding: '24px',
                    backgroundColor: colors.background,
                    borderRadius: '8px',
                    marginTop: '24px'
                  }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: colors.slate, marginBottom: '16px' }}>
                      Start New Close Run
                    </h3>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: colors.slateLight,
                        marginBottom: '8px'
                      }}>
                        Close Date
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={18} color={colors.slateLight} />
                        <input
                          type="date"
                          value={closeDate}
                          onChange={(e) => setCloseDate(e.target.value)}
                          style={{
                            padding: '10px 14px',
                            fontSize: '14px',
                            border: `1px solid ${colors.border}`,
                            borderRadius: '6px',
                            color: colors.slate,
                            width: '180px',
                          }}
                        />
                      </div>
                    </div>

                    <Button onClick={handleStartRun} icon={Play}>
                      Start Run
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Progress Page */}
        {currentView === 'progress' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: colors.slate, marginBottom: '32px' }}>
              Running Close Process
            </h1>

            <Card>
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <Loader2
                  size={48}
                  color={colors.primary}
                  style={{
                    animation: 'spin 1s linear infinite',
                    marginBottom: '24px'
                  }}
                />

                <div style={{ marginBottom: '32px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, color: colors.slate, marginBottom: '8px' }}>
                    {runStatus === 'pulling_data' && 'Pulling data from QuickBooks...'}
                    {runStatus === 'matching' && 'Running AI matching...'}
                    {runStatus === 'ready_for_review' && 'Ready for review!'}
                  </h2>
                  <p style={{ fontSize: '14px', color: colors.slateLight }}>
                    Close Date: {closeDate}
                  </p>
                </div>

                {/* Progress Steps */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {['pulling_data', 'matching', 'ready_for_review'].map((step, i) => {
                    const statuses = ['pulling_data', 'matching', 'ready_for_review'];
                    const currentIndex = statuses.indexOf(runStatus);
                    const stepIndex = statuses.indexOf(step);
                    const isComplete = stepIndex < currentIndex;
                    const isCurrent = stepIndex === currentIndex;

                    return (
                      <div
                        key={step}
                        style={{
                          width: '100px',
                          height: '4px',
                          borderRadius: '2px',
                          backgroundColor: isComplete || isCurrent ? colors.primary : colors.border,
                          transition: 'background-color 0.3s ease',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </Card>

            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Review Page */}
        {currentView === 'review' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: colors.slate, marginBottom: '4px' }}>
                  Review Match Proposals
                </h1>
                <p style={{ fontSize: '14px', color: colors.slateLight }}>
                  Close Date: {closeDate} • Run ID: run_8a7f3c2d
                </p>
              </div>
              <Badge variant="success" size="md">
                <CheckCircle size={14} />
                Ready for Review
              </Badge>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <StatCard icon={FileText} label="Open Invoices" value={mockInvoices.length} color={colors.secondary} />
              <StatCard icon={CreditCard} label="Unapplied Payments" value={mockPayments.length} color={colors.purple} />
              <StatCard icon={DollarSign} label="Total AR Balance" value={formatCurrency(20200)} color={colors.primary} />
            </div>

            {/* Expandable Data Tables */}
            <ExpandableTable
              title="Open Invoices"
              icon={FileText}
              columns={invoiceColumns}
              data={mockInvoices}
              expanded={invoicesExpanded}
              onToggle={() => setInvoicesExpanded(!invoicesExpanded)}
            />

            <ExpandableTable
              title="Unapplied Payments"
              icon={CreditCard}
              columns={paymentColumns}
              data={mockPayments}
              expanded={paymentsExpanded}
              onToggle={() => setPaymentsExpanded(!paymentsExpanded)}
            />

            {/* Match Proposals */}
            <div style={{ marginTop: '32px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: colors.slate, marginBottom: '16px' }}>
                Match Proposals
              </h2>

              {matches.map((match, index) => (
                <MatchCard key={index} match={match} index={index} onToggle={toggleMatch} />
              ))}
            </div>

            {/* Summary Bar */}
            <Card style={{
              marginTop: '24px',
              position: 'sticky',
              bottom: '20px',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '13px', color: colors.slateLight }}>Total Matched:</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: colors.primary, marginLeft: '8px' }}>
                      {formatCurrency(totalMatched)}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', color: colors.slateLight }}>Write-offs:</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: colors.warning, marginLeft: '8px' }}>
                      {formatCurrency(totalWriteOff)}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', color: colors.slateLight }}>Unmatched:</span>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: colors.slate, marginLeft: '8px' }}>
                      {unmatchedPayments} payments, 0 invoices
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button variant="danger" icon={X}>
                    Reject All
                  </Button>
                  <Button onClick={handleExecute} icon={Check}>
                    Approve & Execute
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Execution Results Page */}
        {currentView === 'execution' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: colors.slate, marginBottom: '32px' }}>
              Execution Results
            </h1>

            {executionStatus === 'executing' ? (
              <Card>
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <Loader2
                    size={48}
                    color={colors.primary}
                    style={{ animation: 'spin 1s linear infinite', marginBottom: '24px' }}
                  />
                  <h2 style={{ fontSize: '20px', fontWeight: 600, color: colors.slate, marginBottom: '8px' }}>
                    Applying matches to QuickBooks...
                  </h2>
                  <p style={{ fontSize: '14px', color: colors.slateLight }}>
                    This may take a few moments
                  </p>
                </div>
              </Card>
            ) : (
              <>
                <Card style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <CheckCircle size={28} color={colors.primary} />
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: 600, color: colors.primary, margin: 0 }}>
                        Execution Complete
                      </h2>
                      <p style={{ fontSize: '14px', color: colors.slateLight, margin: 0 }}>
                        All approved matches have been applied to QuickBooks
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{
                      padding: '16px 24px',
                      backgroundColor: colors.primaryLight,
                      borderRadius: '8px',
                      textAlign: 'center',
                      minWidth: '140px'
                    }}>
                      <div style={{ fontSize: '32px', fontWeight: 700, color: colors.primary }}>4</div>
                      <div style={{ fontSize: '13px', color: colors.primaryDark }}>Actions Completed</div>
                    </div>
                    <div style={{
                      padding: '16px 24px',
                      backgroundColor: colors.primaryLight,
                      borderRadius: '8px',
                      textAlign: 'center',
                      minWidth: '140px'
                    }}>
                      <div style={{ fontSize: '32px', fontWeight: 700, color: colors.primary }}>{formatCurrency(totalMatched)}</div>
                      <div style={{ fontSize: '13px', color: colors.primaryDark }}>Total Applied</div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: colors.slate, marginBottom: '16px' }}>
                    Transaction Log
                  </h3>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: colors.slateLight, fontSize: '12px', textTransform: 'uppercase' }}>Action</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: colors.slateLight, fontSize: '12px', textTransform: 'uppercase' }}>Payment</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: colors.slateLight, fontSize: '12px', textTransform: 'uppercase' }}>Invoices</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: colors.slateLight, fontSize: '12px', textTransform: 'uppercase' }}>QBO Txn ID</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: colors.slateLight, fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockExecutionResults.map((result, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                          <td style={{ padding: '14px 16px', color: colors.slate }}>{result.actionType}</td>
                          <td style={{ padding: '14px 16px', color: colors.secondary, fontWeight: 500 }}>{result.paymentId}</td>
                          <td style={{ padding: '14px 16px', color: colors.slate }}>{result.invoiceIds.join(', ')}</td>
                          <td style={{ padding: '14px 16px', color: colors.slateLight, fontFamily: 'monospace', fontSize: '13px' }}>{result.qboTxnId}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <Badge variant={result.status === 'success' ? 'success' : 'error'}>
                              {result.status === 'success' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                              {result.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>

                <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                  <Button variant="secondary" onClick={() => setCurrentView('connect')}>
                    Back to Dashboard
                  </Button>
                  <Button onClick={() => setCurrentView('history')} icon={History}>
                    View Run History
                  </Button>
                </div>
              </>
            )}

            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Run History Page */}
        {currentView === 'history' && (
          <div style={{ maxWidth: '900px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: colors.slate, marginBottom: '8px' }}>
              Run History
            </h1>
            <p style={{ fontSize: '14px', color: colors.slateLight, marginBottom: '24px' }}>
              View past AR close runs and their results
            </p>

            <Card>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: colors.slateLight, fontSize: '12px', textTransform: 'uppercase' }}>Run ID</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: colors.slateLight, fontSize: '12px', textTransform: 'uppercase' }}>Close Date</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: colors.slateLight, fontSize: '12px', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: colors.slateLight, fontSize: '12px', textTransform: 'uppercase' }}>Matches</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: colors.slateLight, fontSize: '12px', textTransform: 'uppercase' }}>Total Matched</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: colors.slateLight, fontSize: '12px', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockRunHistory.map((run, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td style={{ padding: '14px 16px' }}>
                        <code style={{
                          fontSize: '13px',
                          color: colors.secondary,
                          backgroundColor: colors.secondaryLight,
                          padding: '4px 8px',
                          borderRadius: '4px',
                        }}>
                          {run.runId.slice(0, 12)}...
                        </code>
                      </td>
                      <td style={{ padding: '14px 16px', color: colors.slate }}>{run.closeDate}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <Badge variant="success">
                          <CheckCircle size={12} />
                          {run.status}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', color: colors.slate, fontWeight: 500 }}>
                        {run.matchCount}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', color: colors.primary, fontWeight: 600 }}>
                        {formatCurrency(run.totalMatched)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
