import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import BookModal from '../collection/BookModal';
import { getBooksAPI, updateProfileAPI, changePasswordAPI, getMyOrdersAPI, cancelOrderRequestAPI } from '../../api';
import './UserDashboard.css';

const ORDER_STATUS_COLOR = {
  placed:'#5a9ce0', confirmed:'#c9a84c', processing:'#c9a84c',
  ready:'#5acea0', completed:'#5acea0', cancel_requested:'#e05a5a', cancelled:'#e05a5a'
};
const ORDER_STATUS_ICON = {
  placed:'📋', confirmed:'✅', processing:'⚙️',
  ready:'📦', completed:'🎉', cancel_requested:'⚠️', cancelled:'❌'
};

export default function UserDashboard() {
  const { user, updateUser } = useAuth();
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedBook, setSelectedBook] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: user?.name||'', phone: user?.phone||'' });
  const [passForm, setPassForm] = useState({ oldPassword:'', newPassword:'' });
  const [saving, setSaving] = useState(false);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => { if (activeTab==='catalog') loadBooks(); }, [search, activeTab]);
  useEffect(() => { if (activeTab==='orders') loadOrders(); }, [activeTab]);

  const loadBooks = async () => {
    try { const res = await getBooksAPI({ search }); setBooks(res.data.data); }
    catch { toast.error('Failed to load books'); }
  };

  const loadOrders = async () => {
    try { 
      const res = await getMyOrdersAPI(); 
      setOrders(res.data.data || []); 
    }
    catch (err) { 
      // Silently handle - user may not have orders yet
      console.log('Orders:', err.message);
      setOrders([]);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateProfileAPI(profileForm);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setSaving(false); }
  };

  const handlePassChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword.length < 6) return toast.error('Min 6 characters');
    try {
      setSaving(true);
      await changePasswordAPI(passForm);
      toast.success('Password changed!');
      setPassForm({ oldPassword:'', newPassword:'' });
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setSaving(false); }
  };

  const handleCancelRequest = async () => {
    if (!cancelReason.trim()) return toast.error('Please provide a reason');
    try {
      await cancelOrderRequestAPI(cancelModal._id, cancelReason);
      toast.success('Cancel request sent!');
      setCancelModal(null); setCancelReason('');
      loadOrders();
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  const TABS = [
    { key:'catalog', label:'Book Catalog', icon:'📚' },
    { key:'orders',  label:'My Orders',    icon:'🛒' },
    { key:'profile', label:'My Profile',   icon:'👤' },
    { key:'security',label:'Security',     icon:'🔒' },
  ];

  return (
    <div className="udash">
      <Header />
      <div className="udash__hero">
        <div className="udash__hero-bg" />
        <div className="container udash__hero-inner">
          <div className="udash__welcome">
            <div className="udash__avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
            <div>
              <p className="udash__greeting">Welcome back,</p>
              <h1 className="udash__name">{user?.name}</h1>
              <span className="udash__membership">
                {user?.membershipId && <>Member ID: <strong>{user.membershipId}</strong></>}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container udash__body">
        <div className="udash__tabs">
          {TABS.map(t => (
            <button key={t.key} className={`udash__tab ${activeTab===t.key?'active':''}`} onClick={()=>setActiveTab(t.key)}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* CATALOG */}
        {activeTab === 'catalog' && (
          <div className="udash__section page-enter">
            <div className="udash__section-header">
              <h2 className="udash__section-title">Our Collection</h2>
              <input className="udash__search" placeholder="Search books..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <div className="udash__books-grid">
              {books.length === 0
                ? <div className="udash__empty"><p>📚 No books found</p></div>
                : books.map(book => (
                  <div key={book._id} className="udash__book-card" onClick={() => setSelectedBook(book)}>
                    {/* Fixed height cover */}
                    <div className="udash__book-cover">
                      {book.coverImage
                        ? <img
                            src={book.coverImage}
                            alt={book.title}
                            style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}
                            onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML = '<span style="font-size:40px">📖</span>'; }}
                          />
                        : <span className="udash__book-emoji">📖</span>
                      }
                      <div className="udash__book-overlay">View Details →</div>
                    </div>
                    <div className="udash__book-info">
                      <h3 className="udash__book-title">{book.title}</h3>
                      <p className="udash__book-author">by {book.author}</p>
                      <div className="udash__book-meta">
                        <span className="udash__badge udash__badge--blue">{book.category}</span>
                        <span className={`udash__badge ${book.availableCopies>0?'udash__badge--green':'udash__badge--red'}`}>
                          {book.availableCopies>0?`${book.availableCopies} Avail`:'Unavail'}
                        </span>
                      </div>
                      {book.price > 0 && (
                        <p style={{fontSize:13,color:'var(--gold)',fontWeight:600,marginTop:4}}>₹{book.price}</p>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* MY ORDERS */}
        {activeTab === 'orders' && (
          <div className="udash__section page-enter">
            <div className="udash__section-header">
              <h2 className="udash__section-title">My Orders</h2>
              <Link to="/collection" className="udash__btn" style={{textDecoration:'none',padding:'8px 20px',fontSize:12}}>+ New Order</Link>
            </div>
            {orders.length === 0 ? (
              <div className="udash__empty">
                <p>🛒 No orders yet</p>
                <Link to="/collection" style={{color:'var(--gold)',fontSize:14,marginTop:12,display:'block'}}>Browse Collection →</Link>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                {orders.map(order => (
                  <div key={order._id} style={{background:'var(--bg-card)',border:'1px solid var(--border-color2)',borderRadius:12,padding:24}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12,marginBottom:16}}>
                      <div>
                        <div style={{fontSize:12,fontFamily:'monospace',color:'var(--gold)',fontWeight:600,marginBottom:4}}>{order.orderNumber}</div>
                        <div style={{fontSize:12,color:'var(--text-muted)'}}>{new Date(order.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <span style={{
                          padding:'4px 14px',borderRadius:20,fontSize:12,fontWeight:600,
                          background:`${ORDER_STATUS_COLOR[order.orderStatus]}20`,
                          color:ORDER_STATUS_COLOR[order.orderStatus],
                          border:`1px solid ${ORDER_STATUS_COLOR[order.orderStatus]}40`
                        }}>
                          {ORDER_STATUS_ICON[order.orderStatus]} {order.orderStatus.replace('_',' ')}
                        </span>
                        <strong style={{color:'var(--gold)',fontSize:16}}>₹{order.totalAmount}</strong>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:16}}>
                      {order.items.map((item,i) => (
                        <div key={i} style={{display:'flex',alignItems:'center',gap:8,background:'var(--bg-card2)',borderRadius:8,padding:'8px 12px'}}>
                          <div style={{width:28,height:36,borderRadius:3,overflow:'hidden',background:'linear-gradient(135deg,#1a1a3a,#2a2a6a)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>
                            {item.coverImage?<img src={item.coverImage} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'📖'}
                          </div>
                          <div>
                            <div style={{fontSize:13,fontWeight:500,color:'var(--text-primary)'}}>{item.title}</div>
                            <div style={{fontSize:11,color:'var(--text-muted)'}}>₹{item.price} × {item.quantity||1}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap'}}>
                      <span style={{fontSize:12,color:'var(--text-muted)'}}>Payment: <strong style={{color:'var(--text-secondary)',textTransform:'capitalize'}}>{order.paymentMethod}</strong></span>
                      {['placed','confirmed'].includes(order.orderStatus) && (
                        <button onClick={()=>{setCancelModal(order);setCancelReason('');}} style={{marginLeft:'auto',padding:'6px 14px',background:'rgba(224,90,90,0.1)',border:'1px solid rgba(224,90,90,0.25)',color:'var(--red)',fontSize:12,fontWeight:500,borderRadius:6,cursor:'pointer'}}>
                          Request Cancel
                        </button>
                      )}
                      {order.orderStatus==='cancel_requested' && (
                        <span style={{marginLeft:'auto',fontSize:12,color:'var(--red)'}}>⏳ Cancel pending admin review</span>
                      )}
                    </div>
                    {order.adminNote && (
                      <div style={{marginTop:12,padding:'10px 14px',background:'rgba(201,168,76,0.08)',borderRadius:8,fontSize:12,color:'var(--text-secondary)'}}>💬 Admin: {order.adminNote}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE */}
        {activeTab === 'profile' && (
          <div className="udash__section page-enter">
            <h2 className="udash__section-title">My Profile</h2>
            <div className="udash__form-card">
              <form onSubmit={handleProfileSave} className="udash__form">
                <div className="udash__form-row">
                  <div className="udash__form-group">
                    <label className="udash__label">Full Name</label>
                    <input className="udash__input" value={profileForm.name} onChange={e=>setProfileForm(p=>({...p,name:e.target.value}))} required/>
                  </div>
                  <div className="udash__form-group">
                    <label className="udash__label">Phone</label>
                    <input className="udash__input" value={profileForm.phone} onChange={e=>setProfileForm(p=>({...p,phone:e.target.value}))} placeholder="+91 98765 43210"/>
                  </div>
                </div>
                <div className="udash__form-group">
                  <label className="udash__label">Email (cannot change)</label>
                  <input className="udash__input" value={user?.email} disabled style={{opacity:0.5,cursor:'not-allowed'}}/>
                </div>
                <button type="submit" className="udash__btn" disabled={saving}>{saving?'Saving...':'Save Changes'}</button>
              </form>
            </div>
          </div>
        )}

        {/* SECURITY */}
        {activeTab === 'security' && (
          <div className="udash__section page-enter">
            <h2 className="udash__section-title">Change Password</h2>
            <div className="udash__form-card" style={{maxWidth:460}}>
              <form onSubmit={handlePassChange} className="udash__form">
                <div className="udash__form-group">
                  <label className="udash__label">Current Password</label>
                  <input className="udash__input" type="password" value={passForm.oldPassword} onChange={e=>setPassForm(p=>({...p,oldPassword:e.target.value}))} required placeholder="••••••••"/>
                </div>
                <div className="udash__form-group">
                  <label className="udash__label">New Password</label>
                  <input className="udash__input" type="password" value={passForm.newPassword} onChange={e=>setPassForm(p=>({...p,newPassword:e.target.value}))} required placeholder="Min. 6 characters"/>
                </div>
                <button type="submit" className="udash__btn" disabled={saving}>{saving?'Changing...':'Change Password'}</button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Book Detail Modal */}
      {selectedBook && <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />}

      {/* Cancel Modal */}
      {cancelModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20,backdropFilter:'blur(5px)'}} onClick={()=>setCancelModal(null)}>
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border-color)',borderRadius:12,padding:32,width:'100%',maxWidth:440}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontFamily:'Cormorant Garamond,serif',fontSize:24,fontWeight:300,color:'var(--text-primary)',marginBottom:8}}>Cancel Order?</h3>
            <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:20}}>Order <strong style={{color:'var(--gold)'}}>{cancelModal.orderNumber}</strong> — Admin approval required.</p>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text-secondary)',display:'block',marginBottom:8}}>Reason *</label>
              <textarea value={cancelReason} onChange={e=>setCancelReason(e.target.value)} placeholder="Why cancel?" rows={3} style={{width:'100%',background:'var(--bg-card2)',border:'1px solid var(--border-color2)',color:'var(--text-primary)',padding:'10px 12px',borderRadius:6,fontSize:13,fontFamily:'Jost,sans-serif',resize:'vertical',outline:'none'}}/>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setCancelModal(null)} style={{flex:1,padding:'11px',background:'var(--bg-card2)',border:'1px solid var(--border-color2)',borderRadius:6,color:'var(--text-secondary)',cursor:'pointer',fontSize:13}}>Keep Order</button>
              <button onClick={handleCancelRequest} style={{flex:1,padding:'11px',background:'rgba(224,90,90,0.1)',border:'1px solid rgba(224,90,90,0.3)',borderRadius:6,color:'var(--red)',cursor:'pointer',fontSize:13,fontWeight:600}}>Request Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}