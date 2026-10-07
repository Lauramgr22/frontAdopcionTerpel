import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, CheckCircle2, CircleDollarSign, ClipboardCheck, Clock3, FilePlus2, History, LayoutDashboard, LogOut, Menu, ReceiptText, ShieldCheck, UsersRound, WalletCards, X } from 'lucide-react'
import { api } from './api'

const AuthContext = createContext(null)
const roleNames = { admin: 'Administrador', operator: 'Operador', client: 'Cliente' }
const statusNames = { pending: 'Pendiente', processing: 'En proceso', approved: 'Aprobado', rejected: 'Rechazado', cancelled: 'Cancelado' }

const navigation = {
  admin: [
    { path: '/admin/resumen', label: 'Resumen', icon: LayoutDashboard },
    { path: '/admin/pagos', label: 'Pagos', icon: WalletCards },
    { path: '/admin/control', label: 'Control', icon: ShieldCheck },
  ],
  operator: [
    { path: '/operador/bandeja', label: 'Bandeja', icon: ReceiptText },
    { path: '/operador/registrar', label: 'Registrar', icon: FilePlus2 },
    { path: '/operador/revision', label: 'Revisión', icon: ClipboardCheck },
  ],
  client: [
    { path: '/cliente/inicio', label: 'Inicio', icon: LayoutDashboard },
    { path: '/cliente/nuevo', label: 'Nuevo pago', icon: CircleDollarSign },
    { path: '/cliente/historial', label: 'Historial', icon: History },
  ],
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pagoclaro_user')) } catch { return null }
  })
  const login = async (credentials) => {
    const session = await api.login(credentials)
    localStorage.setItem('pagoclaro_token', session.access_token)
    localStorage.setItem('pagoclaro_user', JSON.stringify(session.user))
    setUser(session.user)
    return session.user
  }
  const logout = () => {
    localStorage.removeItem('pagoclaro_token')
    localStorage.removeItem('pagoclaro_user')
    setUser(null)
  }
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

const useAuth = () => useContext(AuthContext)

function roleHome(role) {
  return navigation[role]?.[0]?.path || '/login'
}

function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: 'cliente@pagoclaro.co', password: 'Cliente123!' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  if (user) return <Navigate to={roleHome(user.role)} replace />

  const accounts = [
    ['Administrador', 'admin@pagoclaro.co', 'Admin123!'],
    ['Operador', 'operador@pagoclaro.co', 'Operador123!'],
    ['Cliente', 'cliente@pagoclaro.co', 'Cliente123!'],
  ]
  const submit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true)
    try { const loggedUser = await login(form); navigate(roleHome(loggedUser.role)) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return <main className="login-shell">
    <section className="login-brand">
      <div className="brand-mark"><WalletCards size={27} /></div>
      <div className="brand-name">PagoClaro</div>
      <div className="brand-message">
        <span className="eyebrow">Pagos sin fricción</span>
        <h1>Cada pago,<br />bajo control.</h1>
        <p>Solicita, verifica y aprueba pagos en un flujo sencillo, trazable y seguro.</p>
      </div>
      <div className="trust-line"><ShieldCheck size={18} /> Entorno local protegido</div>
    </section>
    <section className="login-panel">
      <div className="login-card">
        <span className="eyebrow dark">Acceso al portal</span>
        <h2>Bienvenido de nuevo</h2>
        <p className="muted">Ingresa con una cuenta de demostración.</p>
        <form onSubmit={submit}>
          <label>Correo electrónico<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
          <label>Contraseña<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
          {error && <div className="alert error">{error}</div>}
          <button className="primary wide" disabled={loading}>{loading ? 'Ingresando…' : 'Ingresar al portal'}</button>
        </form>
        <div className="demo-accounts">
          <span>Cuentas rápidas</span>
          <div>{accounts.map(([name, email, password]) => <button key={email} onClick={() => setForm({ email, password })}>{name}</button>)}</div>
        </div>
      </div>
    </section>
  </main>
}

function ProtectedLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  if (!user) return <Navigate to="/login" replace />
  const items = navigation[user.role]
  if (!location.pathname.startsWith(`/${user.role === 'operator' ? 'operador' : user.role === 'client' ? 'cliente' : 'admin'}`)) return <Navigate to={roleHome(user.role)} replace />

  return <div className="app-shell">
    <header className="mobile-header"><button className="icon-button" onClick={() => setMobileOpen(true)} aria-label="Abrir menú"><Menu /></button><Logo /></header>
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-top"><Logo /><button className="icon-button close-menu" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú"><X /></button></div>
      <div className="role-chip">{roleNames[user.role]}</div>
      <nav>{items.map(({ path, label, icon: Icon }) => <a key={path} href={path} className={location.pathname === path ? 'active' : ''} onClick={(event) => { event.preventDefault(); history.pushState({}, '', path); window.dispatchEvent(new PopStateEvent('popstate')); setMobileOpen(false) }}><Icon size={19} />{label}</a>)}</nav>
      <div className="sidebar-footer">
        <div className="user-avatar">{user.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
        <div><strong>{user.name}</strong><small>{user.email}</small></div>
        <button className="icon-button" onClick={logout} title="Cerrar sesión"><LogOut size={18} /></button>
      </div>
    </aside>
    {mobileOpen && <button className="backdrop" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú" />}
    <section className="content"><Outlet /></section>
  </div>
}

function Logo() {
  return <div className="logo"><span><WalletCards size={21} /></span><strong>PagoClaro</strong></div>
}

function usePortalData(fetchPayments = false, status = '') {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const load = async () => {
    setLoading(true); setError('')
    try { setData(await (fetchPayments ? api.payments(status) : api.dashboard())) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [fetchPayments, status])
  return { data, error, loading, reload: load }
}

function PageHeader({ eyebrow, title, description, action }) {
  return <header className="page-header"><div><span className="eyebrow dark">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</header>
}

function Dashboard({ mode }) {
  const { user } = useAuth()
  const { data, error, loading } = usePortalData()
  const copy = mode === 'admin'
    ? ['Visión general', 'Control financiero', 'Consulta el pulso de toda la operación.']
    : ['Tu espacio', `Hola, ${user.name.split(' ')[0]}`, 'Revisa tus pagos y continúa donde quedaste.']
  if (loading) return <Loading />
  if (error) return <ErrorState message={error} />
  const cards = [
    ['Pagos totales', data.total_payments, ReceiptText],
    ['Por gestionar', data.pending_payments, Clock3],
    ['Aprobados', data.approved_payments, CheckCircle2],
    ['Valor aprobado', money(data.total_approved_amount), BarChart3],
  ]
  return <>
    <PageHeader eyebrow={copy[0]} title={copy[1]} description={copy[2]} />
    <div className="metric-grid">{cards.map(([label, value, Icon]) => <article className="metric-card" key={label}><div className="metric-icon"><Icon size={21} /></div><span>{label}</span><strong>{value}</strong></article>)}</div>
    <section className="panel"><div className="panel-heading"><div><h2>Actividad reciente</h2><p>Últimos movimientos registrados</p></div></div><PaymentsTable payments={data.recent_payments} compact /></section>
  </>
}

function PaymentsPage({ title = 'Pagos', description = 'Consulta y gestiona las solicitudes registradas.', status = '', canUpdate = false }) {
  const { data, error, loading, reload } = usePortalData(true, status)
  const [filter, setFilter] = useState('')
  const filtered = useMemo(() => (data || []).filter((payment) => `${payment.reference} ${payment.concept} ${payment.owner.name}`.toLowerCase().includes(filter.toLowerCase())), [data, filter])
  if (loading) return <Loading />
  if (error) return <ErrorState message={error} />
  return <>
    <PageHeader eyebrow="Operación" title={title} description={description} />
    <section className="panel"><div className="toolbar"><div className="search"><input aria-label="Buscar pagos" placeholder="Buscar por referencia, concepto o cliente" value={filter} onChange={(e) => setFilter(e.target.value)} /></div><span>{filtered.length} registros</span></div><PaymentsTable payments={filtered} canUpdate={canUpdate} onUpdated={reload} /></section>
  </>
}

function PaymentsTable({ payments, compact = false, canUpdate = false, onUpdated }) {
  const { user } = useAuth()
  const [busy, setBusy] = useState(null)
  const update = async (id, status) => {
    setBusy(id)
    try { await api.updatePayment(id, { status, note: `Actualizado desde el portal: ${statusNames[status]}` }); onUpdated?.() }
    finally { setBusy(null) }
  }
  if (!payments?.length) return <EmptyState />
  return <div className="table-wrap"><table><thead><tr><th>Referencia</th><th>Concepto</th>{!compact && <th>Cliente</th>}<th>Valor</th><th>Estado</th>{canUpdate && <th>Acción</th>}</tr></thead><tbody>{payments.map((payment) => {
    const allowedStatuses = user.role === 'admin' ? Object.keys(statusNames) : ['processing', 'approved', 'rejected']
    const visibleStatuses = allowedStatuses.includes(payment.status) ? allowedStatuses : [payment.status, ...allowedStatuses]
    return <tr key={payment.id}><td><strong>{payment.reference}</strong><small>{formatDate(payment.created_at)}</small></td><td>{payment.concept}<small>{payment.recipient}</small></td>{!compact && <td>{payment.owner.name}<small>{payment.owner.email}</small></td>}<td className="amount">{money(payment.amount, payment.currency)}</td><td><span className={`status ${payment.status}`}>{statusNames[payment.status]}</span></td>{canUpdate && <td><select aria-label={`Cambiar estado de ${payment.reference}`} disabled={busy === payment.id} value={payment.status} onChange={(e) => update(payment.id, e.target.value)}>{visibleStatuses.map((status) => <option key={status} value={status} disabled={!allowedStatuses.includes(status)}>{statusNames[status]}</option>)}</select></td>}</tr>
  })}</tbody></table></div>
}

function NewPayment() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ concept: '', recipient: '', amount: '', currency: 'COP', client_email: user.role === 'client' ? '' : 'cliente@pagoclaro.co' })
  const [state, setState] = useState({ loading: false, error: '' })
  const submit = async (event) => {
    event.preventDefault(); setState({ loading: true, error: '' })
    try {
      await api.createPayment({ ...form, amount: Number(form.amount), client_email: form.client_email || null })
      navigate(user.role === 'client' ? '/cliente/historial' : '/operador/bandeja', { state: { message: 'Pago registrado correctamente' } })
    } catch (err) { setState({ loading: false, error: err.message }) }
  }
  return <>
    <PageHeader eyebrow="Nueva solicitud" title="Registrar un pago" description="Completa la información para iniciar la validación." />
    <section className="form-layout"><form className="panel payment-form" onSubmit={submit}>
      <div className="form-section"><span>01</span><div><h2>Información del pago</h2><p>Describe claramente el motivo y el destinatario.</p></div></div>
      <label>Concepto<input value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value })} placeholder="Ej. Cuota de adopción" minLength="3" required /></label>
      <label>Destinatario<input value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} placeholder="Nombre de la entidad o persona" minLength="3" required /></label>
      {user.role !== 'client' && <label>Correo del cliente<input type="email" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} required /></label>}
      <div className="field-row"><label>Valor<input type="number" min="1" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" required /></label><label>Moneda<select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}><option>COP</option><option>USD</option><option>EUR</option></select></label></div>
      {state.error && <div className="alert error">{state.error}</div>}
      <div className="form-actions"><button type="button" className="secondary" onClick={() => navigate(-1)}>Cancelar</button><button className="primary" disabled={state.loading}>{state.loading ? 'Registrando…' : 'Registrar pago'}</button></div>
    </form><aside className="help-card"><ShieldCheck size={26} /><h3>Proceso seguro</h3><p>La solicitud quedará pendiente hasta que un operador valide la información.</p><ul><li>Información cifrada en tránsito</li><li>Trazabilidad por usuario</li><li>Control de estados por rol</li></ul></aside></section>
  </>
}

function ControlPage() {
  const { data, error, loading } = usePortalData(true)
  if (loading) return <Loading />
  if (error) return <ErrorState message={error} />
  const counts = data.reduce((acc, item) => ({ ...acc, [item.status]: (acc[item.status] || 0) + 1 }), {})
  return <><PageHeader eyebrow="Gobierno" title="Centro de control" description="Supervisa estados, permisos y salud operativa." /><div className="control-grid"><section className="panel"><h2>Distribución por estado</h2><div className="status-stack">{Object.keys(statusNames).map((key) => <div key={key}><span><i className={`dot ${key}`} />{statusNames[key]}</span><strong>{counts[key] || 0}</strong></div>)}</div></section><section className="panel"><h2>Roles activos</h2><div className="role-list"><div><UsersRound /><span><strong>Administrador</strong><small>Visibilidad total y control de estados</small></span></div><div><ClipboardCheck /><span><strong>Operador</strong><small>Registro, revisión y aprobación</small></span></div><div><CircleDollarSign /><span><strong>Cliente</strong><small>Solicitudes e historial propio</small></span></div></div></section></div></>
}

function Loading() { return <div className="loading"><span /><p>Cargando información…</p></div> }
function ErrorState({ message }) { return <div className="state-card"><X /><h2>No pudimos cargar esta vista</h2><p>{message}</p></div> }
function EmptyState() { return <div className="empty"><ReceiptText /><h3>No hay pagos para mostrar</h3><p>Los registros aparecerán aquí cuando sean creados.</p></div> }
function money(value, currency = 'COP') { return new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: currency === 'COP' ? 0 : 2 }).format(Number(value)) }
function formatDate(value) { return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(value)) }

export default function App() {
  return <AuthProvider><Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<ProtectedLayout />}>
      <Route path="/admin/resumen" element={<Dashboard mode="admin" />} />
      <Route path="/admin/pagos" element={<PaymentsPage title="Gestión de pagos" canUpdate />} />
      <Route path="/admin/control" element={<ControlPage />} />
      <Route path="/operador/bandeja" element={<PaymentsPage title="Bandeja operativa" description="Prioriza y procesa las solicitudes recibidas." canUpdate />} />
      <Route path="/operador/registrar" element={<NewPayment />} />
      <Route path="/operador/revision" element={<PaymentsPage title="Pagos por revisar" description="Solicitudes pendientes que requieren una decisión." status="pending" canUpdate />} />
      <Route path="/cliente/inicio" element={<Dashboard mode="client" />} />
      <Route path="/cliente/nuevo" element={<NewPayment />} />
      <Route path="/cliente/historial" element={<PaymentsPage title="Mi historial" description="Consulta el estado y detalle de tus solicitudes." />} />
    </Route>
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes></AuthProvider>
}

