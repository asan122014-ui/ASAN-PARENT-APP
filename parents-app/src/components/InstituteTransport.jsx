import { createElement, useState } from 'react';
import { ArrowRight, Bell, Building2, BusFront, ChevronRight, Clock3, GraduationCap, MapPin, Phone, ReceiptText, RefreshCw, Route, UsersRound } from 'lucide-react';
import useInstituteTransport from '../hooks/useInstituteTransport';
import { API } from '../api/api';
import './InstituteTransport.css';

const money = value => value == null ? 'To be confirmed' : `₹${Number(value).toLocaleString('en-IN')}`;
function transportTime(value) {
  if (!value) return 'To be confirmed';
  const match = String(value).match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return value;
  const hour = Number(match[1]);
  return `${hour % 12 || 12}:${match[2]} ${hour >= 12 ? 'PM' : 'AM'}`;
}
function StudentCard({ child, driver, detailed, navigate }) {
  const [checking, setChecking] = useState(false);
  const [trackingMessage, setTrackingMessage] = useState('');
  const access = child.trackingAccess;
  const liveRide = async () => {
    if (checking || !access?.canTrack) return;
    setChecking(true); setTrackingMessage('');
    try {
      const response = await API.get('/institute-app/parent');
      const latest = response.data?.children?.find(item => item._id === child._id);
      if (!latest?.trackingAccess?.canTrack || latest.driverId !== driver.driverId) { setTrackingMessage('Live tracking opens after payment is confirmed and your child’s trip starts. Refresh to see the latest details.'); return; }
      localStorage.setItem('selectedTrackingDriverId', driver.driverId);
      localStorage.setItem('selectedTrackingChildId', child._id);
      navigate('tracking');
    } catch { setTrackingMessage('Unable to confirm the live trip. Please refresh and try again.'); }
    finally { setChecking(false); }
  };
  return <article className="ip-student">
    <div className="ip-student-heading"><span className="ip-avatar"><GraduationCap size={25} /></span><div className="ip-student-name"><h3>{child.name}</h3><p>{child.grade ? `Class ${child.grade}` : 'Institute student'}{child.school ? ` · ${child.school}` : ''}</p></div></div>
    <div className={`ip-route ${child.assignedRouteName ? 'ip-route-assigned' : ''}`}><Route size={17} /><span>{child.assignedRouteName || 'Route assignment pending'}</span><span className="ip-status-dot" /></div>
    <div className="ip-times"><div><span><Clock3 size={15} /> Pickup</span><strong>{transportTime(child.pickupTime)}</strong></div><div><span><Clock3 size={15} /> School return</span><strong>{transportTime(child.eveningPickup)}</strong></div></div>
    <div className="ip-location"><MapPin size={18} /><div><span>{child.pickupMode === 'route_stops' ? 'Assigned pickup point' : 'Home pickup'}</span><p>{child.pickupStopName || child.pickupLocation || 'Your institute will confirm the pickup location.'}</p></div></div>
    {detailed && <div className="ip-fee"><div><span>Monthly transport fee</span><strong>{money(child.monthlyTransportFee)}</strong></div><p>{child.monthlyTransportFee == null ? 'Your institute will confirm the fee with the route.' : 'View invoices and payment status in Billing.'}</p>{child.monthlyTransportFee != null && <button onClick={() => navigate('billing')}>View billing <ArrowRight size={16} /></button>}</div>}
    <div className="ip-driver"><span className="ip-driver-icon"><BusFront size={20} /></span><div><strong>{driver?.name || 'Driver not assigned yet'}</strong><p>{driver ? [driver.driverId, driver.vehicleNumber].filter(Boolean).join(' · ') : 'Your institute will update your assignment here.'}</p></div>{driver?.phone && <a href={`tel:${driver.phone}`} aria-label={`Call ${driver.name}`} className="ip-call"><Phone size={18} /></a>}</div>
    {driver && (access?.canTrack ? <button className="ip-track" disabled={checking} onClick={liveRide}>{checking ? 'Checking live trip…' : 'View live ride'} <ArrowRight size={18} /></button> : <div className="ip-tracking-wait"><Clock3 size={17}/><p>{access?.reason === 'payment_required' ? 'Complete this month’s payment to enable live tracking when the trip starts.' : 'Live tracking will appear when your child’s paid trip starts.'}</p>{access?.reason === 'payment_required' && <button onClick={()=>navigate('billing')}>View payment <ArrowRight size={15}/></button>}</div>)}
    {trackingMessage && <p className="ip-error" role="status">{trackingMessage}</p>}
  </article>;
}
export function InstituteTransportView({ data, error, loading, updatedAt, refresh, setTab, view = 'home' }) {
  const childrenView = view === 'children';
  const children = data?.children || [];
  const assigned = new Set(children.map(child => child.assignedRouteName).filter(Boolean)).size;
  const navigate = tab => setTab ? setTab(tab) : window.location.assign(`/app?tab=${tab}`);
  return <main className="institute-parent"><div className="ip-screen">
    <header className="ip-header"><div className="ip-brand"><Building2 size={22} /><div><span>ASAN RIDES</span><p>Institute transport</p></div></div><div className="ip-header-actions"><button aria-label="Refresh transport" disabled={loading} onClick={refresh}><RefreshCw size={19} className={loading ? 'ip-spinning' : ''} /></button><button aria-label="Notifications" onClick={() => navigate('notifications')}><Bell size={21} /></button></div></header>
    <section className="ip-hero"><div className="ip-eyebrow">{childrenView ? 'YOUR FAMILY' : 'SCHOOL DAYS, SIMPLIFIED'}</div><h1>{childrenView ? 'Your children.' : <>Their journey.<br />Your peace of mind.</>}</h1><p className="ip-hero-copy">{childrenView ? 'Pickup plans and transport details, all in one place.' : 'Stay connected to your child’s everyday school journey.'}</p><div className="ip-institute"><Building2 size={17} /><span>{data?.instituteName || 'Your institute'}</span></div><div className="ip-hero-bottom"><span><UsersRound size={17} />{data ? `${children.length} ${children.length === 1 ? 'child' : 'children'} enrolled` : 'Loading family details'}</span>{data && <span><span className={`ip-dot ${assigned ? 'ip-dot-green' : ''}`} />{assigned ? `${assigned} ${assigned === 1 ? 'route assigned' : 'routes assigned'}` : 'Setup in progress'}</span>}</div></section>
    {!childrenView && <nav className="ip-shortcuts" aria-label="Transport shortcuts">{[{label:'Children',tab:'children',Icon:UsersRound},{label:'Billing',tab:'billing',Icon:ReceiptText},{label:'Ride history',tab:'trips',Icon:Clock3}].map(({label,tab,Icon}) => <button key={tab} onClick={() => navigate(tab)}><span>{createElement(Icon,{size:22})}</span>{label}<ChevronRight size={15} /></button>)}</nav>}
    {error && <div role="alert" className="ip-error"><p>{error}</p><button disabled={loading} onClick={refresh}>Try again</button></div>}
    {!data && !error && <div role="status" className="ip-loading">Loading your family’s transport details…</div>}
    {data && <section className="ip-children" aria-label={childrenView ? 'Enrolled children' : 'Family transport'}><div className="ip-section-title"><div><p>{childrenView ? 'STUDENT DETAILS' : 'FAMILY TRANSPORT'}</p><h2>{childrenView ? 'Made for their school day' : 'Ready for the school day'}</h2></div><span>{children.length.toString().padStart(2,'0')}</span></div>
      {children.length ? children.map(child => <StudentCard key={child._id} child={child} driver={(data.drivers || []).find(driver => driver.driverId === child.driverId)} detailed={childrenView} navigate={navigate} />) : <div className="ip-empty"><span><GraduationCap size={32} /></span><h3>A new journey starts here</h3><p>Your institute will add your children and their transport details. They’ll appear here as soon as enrollment is complete.</p></div>}
    </section>}
    <aside className="ip-managed-note"><Building2 size={20} /><div><strong>Managed by your institute</strong><p>Need to change a pickup, route or student detail? Contact your transport coordinator.</p></div></aside>
    {updatedAt && <p className="ip-updated" role="status">Last updated {updatedAt.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</p>}
  </div></main>;
}
export default function InstituteTransport({ setTab, view = 'home' }) {
  const transport = useInstituteTransport(API, '/institute-app/parent');
  return <InstituteTransportView {...transport} setTab={setTab} view={view} />;
}
