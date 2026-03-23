import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrderAPI, getSavedAddressesAPI, saveAddressAPI } from '../../api';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const { items, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [payMethod, setPayMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: 'Surat',
    state: 'Gujarat',
    pincode: '',
  });

  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [upi, setUpi] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [addrErrors, setAddrErrors] = useState({});

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [saveAddr, setSaveAddr] = useState(false);
  const [addrLabel, setAddrLabel] = useState('Home');

  // Load saved addresses on mount - silent fail if route not ready
  React.useEffect(() => {
    if (user) {
      getSavedAddressesAPI()
        .then(res => {
          const addrs = res.data.data || [];
          setSavedAddresses(addrs);
          const def = addrs.find(a => a.isDefault);
          if (def) {
            setAddress({ fullName:def.fullName, phone:def.phone, street:def.street, city:def.city, state:def.state, pincode:def.pincode });
          }
        })
        .catch(() => setSavedAddresses([])); // silent - route may not exist yet
    }
  }, [user]);

  const CURRENCIES = { INR: { symbol:'₹', rate:1 }, USD: { symbol:'$', rate:0.012 }, EUR: { symbol:'€', rate:0.011 } };
  const currInfo = CURRENCIES[currency];
  const displayAmount = (amt) => `${currInfo.symbol}${(amt * currInfo.rate).toFixed(currency==='INR'?0:2)}`;

  // Use totalPrice directly from CartContext (already calculated correctly)
  const grandTotal = totalPrice || 0;

  const formatCard = (val) => val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  const formatExpiry = (val) => val.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);

  const validateAddress = () => {
    const e = {};
    if (!address.fullName.trim()) e.fullName = 'Name is required';
    if (!address.phone || !/^[+]?[\d\s\-()]{8,15}$/.test(address.phone)) e.phone = 'Enter valid phone with country code';
    if (!address.street.trim()) e.street = 'Street address is required';
    if (!address.pincode || !/^\d{6}$/.test(address.pincode)) e.pincode = 'Enter valid 6-digit PIN code';
    setAddrErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddressNext = (e) => {
    e.preventDefault();
    if (!validateAddress()) { toast.error('Please fix the errors'); return; }
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      // Save total BEFORE clearing cart
      const finalTotal = grandTotal;
      const orderItems = items.map(b => ({
        book: b._id,
        title: b.title,
        author: b.author,
        coverImage: b.coverImage || '',
        price: Number(b.price) || 0,
        quantity: b.quantity || 1,
      }));

      // Simulate payment processing delay
      await new Promise(r => setTimeout(r, 2000));

      const orderData = {
        items: orderItems,
        totalAmount: finalTotal,
        paymentMethod: payMethod,
        deliveryAddress: address,
      };

      const res = await createOrderAPI(orderData);
      // Save address if requested (silent fail)
      if (saveAddr) {
        try { await saveAddressAPI({ ...address, label: addrLabel, isDefault: savedAddresses.length === 0 }); }
        catch (e) { console.log('Address save skipped:', e.message); }
      }
      clearCart(); // clear AFTER order created
      setPlacedOrder({ ...res.data.data, totalAmount: finalTotal });
      setStep(3);
      window.scrollTo(0, 0);
      toast.success('Order placed successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="checkout-page">
        <Header />
        <div style={{ minHeight:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
          <div style={{ fontSize:64 }}>🛒</div>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:32, fontWeight:300, color:'var(--text-primary)' }}>Cart is Empty</h2>
          <Link to="/collection" className="chk-btn-primary">Browse Collection</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Header />

      <section className="chk-hero">
        <div className="chk-hero__bg" />
        <div className="container chk-hero__inner">
          <p className="chk-tag"><span className="chk-tag-line" />Checkout</p>
          <h1 className="chk-title">
            {step === 1 ? 'Delivery Details' : step === 2 ? 'Payment' : 'Order Confirmed! 🎉'}
          </h1>
        </div>
      </section>

      {step < 3 && (
        <div className="chk-progress">
          <div className="container">
            <div className="chk-steps">
              {['Cart', 'Address', 'Payment', 'Done'].map((s, i) => (
                <div key={i} className={`chk-step ${i+1 <= step+1 ? 'active' : ''} ${i+1 < step ? 'done' : ''}`}>
                  <div className="chk-step__dot">{i+1 < step ? '✓' : i+1}</div>
                  <span className="chk-step__label">{s}</span>
                  {i < 3 && <div className="chk-step__line" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="chk-body">
        <div className="container">

          {/* STEP 1 — ADDRESS */}
          {step === 1 && (
            <div className="chk-grid">
              <div className="chk-main">
                <div className="chk-card">
                  <h2 className="chk-card__title">📍 Delivery Address</h2>

                  {/* Saved Addresses */}
                  {savedAddresses.length > 0 && (
                    <div style={{marginBottom:20}}>
                      <div style={{fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text-secondary)',marginBottom:10}}>Saved Addresses</div>
                      <div style={{display:'flex',flexDirection:'column',gap:8}}>
                        {savedAddresses.map((addr, i) => (
                          <div key={i}
                            onClick={() => setAddress({ fullName:addr.fullName, phone:addr.phone, street:addr.street, city:addr.city, state:addr.state, pincode:addr.pincode })}
                            style={{
                              padding:'12px 16px', borderRadius:8, cursor:'pointer',
                              background: address.street===addr.street ? 'rgba(201,168,76,0.1)' : 'var(--bg-card2)',
                              border: address.street===addr.street ? '1px solid rgba(201,168,76,0.4)' : '1px solid var(--border-color2)',
                              transition:'all 0.2s'
                            }}
                          >
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                              <span style={{fontSize:12,fontWeight:600,color:'var(--gold)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{addr.label} {addr.isDefault ? '⭐' : ''}</span>
                              {address.street===addr.street && <span style={{fontSize:11,color:'var(--gold)'}}>✓ Selected</span>}
                            </div>
                            <div style={{fontSize:13,color:'var(--text-primary)',marginTop:2}}>{addr.fullName} • {addr.phone}</div>
                            <div style={{fontSize:12,color:'var(--text-secondary)'}}>{addr.street}, {addr.city} — {addr.pincode}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{fontSize:12,color:'var(--text-muted)',marginTop:8}}>↓ Or fill new address below</div>
                    </div>
                  )}

                  <form onSubmit={handleAddressNext} className="chk-form">
                    <div className="chk-form-row">
                      <div className="chk-form-group">
                        <label>Full Name *</label>
                        <input value={address.fullName} onChange={e=>setAddress(p=>({...p,fullName:e.target.value}))} required placeholder="Your full name"/>
                      </div>
                      <div className="chk-form-group">
                        <label>Phone *</label>
                        <input value={address.phone} onChange={e=>setAddress(p=>({...p,phone:e.target.value}))} required placeholder="+91 98765 43210"/>
                      </div>
                    </div>
                    <div className="chk-form-group">
                      <label>Street Address *</label>
                      <input value={address.street} onChange={e=>setAddress(p=>({...p,street:e.target.value}))} required placeholder="House no., Street, Area"/>
                    </div>
                    <div className="chk-form-row">
                      <div className="chk-form-group">
                        <label>City *</label>
                        <input value={address.city} onChange={e=>setAddress(p=>({...p,city:e.target.value}))} required/>
                      </div>
                      <div className="chk-form-group">
                        <label>State *</label>
                        <input value={address.state} onChange={e=>setAddress(p=>({...p,state:e.target.value}))} required/>
                      </div>
                      <div className="chk-form-group">
                        <label>PIN Code *</label>
                        <input value={address.pincode} onChange={e=>setAddress(p=>({...p,pincode:e.target.value.replace(/\D/,'').slice(0,6)}))} required placeholder="395010" maxLength={6}/>
                      </div>
                    </div>
                    {/* Save address option */}
                    <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:'var(--bg-card2)',borderRadius:8}}>
                      <input type="checkbox" id="saveAddr" checked={saveAddr} onChange={e=>setSaveAddr(e.target.checked)} style={{accentColor:'var(--gold)',width:16,height:16}}/>
                      <label htmlFor="saveAddr" style={{fontSize:13,color:'var(--text-secondary)',cursor:'pointer',flex:1}}>
                        💾 Save this address for future orders
                      </label>
                      {saveAddr && (
                        <input value={addrLabel} onChange={e=>setAddrLabel(e.target.value)} placeholder="Label (Home/Work)" style={{padding:'6px 10px',background:'var(--bg-card)',border:'1px solid var(--border-color2)',borderRadius:6,fontSize:12,color:'var(--text-primary)',width:140,outline:'none',fontFamily:'Jost,sans-serif'}}/>
                      )}
                    </div>
                    <button type="submit" className="chk-btn-primary">Continue to Payment →</button>
                  </form>
                </div>
              </div>
              <OrderSummary items={items} grandTotal={grandTotal}/>
            </div>
          )}

          {/* STEP 2 — PAYMENT */}
          {step === 2 && (
            <div className="chk-grid">
              <div className="chk-main">
                <div className="chk-card">
                  <h2 className="chk-card__title">💳 Payment Method</h2>
                  <div className="pay-tabs">
                    {[
                      { id:'card', icon:'💳', label:'Credit / Debit Card' },
                      { id:'upi',  icon:'📱', label:'UPI (GPay/PhonePe/Paytm)' },
                      { id:'cod',  icon:'💵', label:'Cash on Delivery / Visit' },
                    ].map(m => (
                      <button key={m.id} className={`pay-tab ${payMethod===m.id?'active':''}`} onClick={()=>setPayMethod(m.id)} type="button">
                        <span className="pay-tab__icon">{m.icon}</span>
                        <span className="pay-tab__label">{m.label}</span>
                        {payMethod===m.id && <span className="pay-tab__check">✓</span>}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handlePayment} className="chk-form" style={{marginTop:24}}>
                    {payMethod === 'card' && (
                      <div className="pay-card-form">
                        <div className="card-preview">
                          <div className="card-preview__chip">◼</div>
                          <div className="card-preview__number">{card.number || '•••• •••• •••• ••••'}</div>
                          <div className="card-preview__bottom">
                            <div>
                              <div className="card-preview__label">Card Holder</div>
                              <div className="card-preview__value">{card.name || 'YOUR NAME'}</div>
                            </div>
                            <div>
                              <div className="card-preview__label">Expires</div>
                              <div className="card-preview__value">{card.expiry || 'MM/YY'}</div>
                            </div>
                          </div>
                        </div>
                        <div className="chk-form-group">
                          <label>Card Number *</label>
                          <input value={card.number} onChange={e=>setCard(p=>({...p,number:formatCard(e.target.value)}))} placeholder="1234 5678 9012 3456" required maxLength={19}/>
                        </div>
                        <div className="chk-form-group">
                          <label>Cardholder Name *</label>
                          <input value={card.name} onChange={e=>setCard(p=>({...p,name:e.target.value.toUpperCase()}))} placeholder="AS ON CARD" required/>
                        </div>
                        <div className="chk-form-row">
                          <div className="chk-form-group">
                            <label>Expiry *</label>
                            <input value={card.expiry} onChange={e=>setCard(p=>({...p,expiry:formatExpiry(e.target.value)}))} placeholder="MM/YY" required maxLength={5}/>
                          </div>
                          <div className="chk-form-group">
                            <label>CVV *</label>
                            <input value={card.cvv} onChange={e=>setCard(p=>({...p,cvv:e.target.value.replace(/\D/,'').slice(0,4)}))} placeholder="•••" type="password" required maxLength={4}/>
                          </div>
                        </div>
                        <div className="card-logos">
                          <span>VISA</span><span>Mastercard</span><span>RuPay</span><span>Amex</span>
                        </div>
                      </div>
                    )}

                    {payMethod === 'upi' && (
                      <div>
                        <div className="upi-logos">
                          {['GPay','PhonePe','Paytm','BHIM'].map(u=>(
                            <div key={u} className="upi-logo">{u}</div>
                          ))}
                        </div>
                        <div className="chk-form-group" style={{marginTop:16}}>
                          <label>UPI ID *</label>
                          <input value={upi} onChange={e=>setUpi(e.target.value)} placeholder="yourname@upi" required/>
                        </div>
                        <div className="upi-note">💡 A payment request will be sent to your UPI app</div>
                      </div>
                    )}

                    {payMethod === 'cod' && (
                      <div className="cash-info">
                        <div className="cash-info__icon">💵</div>
                        <h3>Pay at Library</h3>
                        <p>Visit Luxe Library and pay ₹{grandTotal} at the front desk when collecting your books.</p>
                        <div className="cash-info__details">
                          <div><span>📍</span> Kapodara, Surat — 395010</div>
                          <div><span>📞</span> +91 96246 07410</div>
                          <div><span>🕐</span> Mon–Sat: 9AM – 8PM</div>
                        </div>
                      </div>
                    )}

                    {/* Currency Selector */}
                  <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:'var(--bg-card2)',borderRadius:8,marginBottom:8}}>
                    <span style={{fontSize:13,color:'var(--text-secondary)'}}>💱 Pay in:</span>
                    {Object.keys(CURRENCIES).map(c=>(
                      <button key={c} type="button" onClick={()=>setCurrency(c)} style={{padding:'5px 14px',borderRadius:20,border:'none',cursor:'pointer',fontSize:12,fontWeight:600,background:currency===c?'var(--gold)':'var(--bg-card3)',color:currency===c?'#000':'var(--text-secondary)'}}>
                        {CURRENCIES[c].symbol} {c}
                      </button>
                    ))}
                    <span style={{marginLeft:'auto',fontSize:14,fontWeight:700,color:'var(--gold)'}}>
                      {displayAmount(grandTotal)}
                    </span>
                  </div>
                  <div className="chk-secure">🔒 100% Secure — SSL Encrypted</div>

                    <div style={{display:'flex',gap:12,marginTop:8}}>
                      <button type="button" className="chk-btn-ghost" onClick={()=>setStep(1)}>← Back</button>
                      <button type="submit" className="chk-btn-primary" disabled={processing} style={{flex:1}}>
                        {processing
                          ? <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}><span className="chk-spinner"/>Processing...</span>
                          : `Pay ₹${grandTotal} →`}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <OrderSummary items={items} grandTotal={grandTotal} showAddress address={address}/>
            </div>
          )}

          {/* STEP 3 — SUCCESS */}
          {step === 3 && placedOrder && (
            <div className="chk-success">
              <div className="chk-success__circle">
                <span className="chk-success__check">✓</span>
              </div>
              <h2 className="chk-success__title">Order Placed!</h2>
              <p className="chk-success__subtitle">Your order has been placed. Admin will confirm it shortly. Visit library to collect your books.</p>
              <div className="chk-success__card">
                <div className="chk-success__row"><span>Order No.</span><strong style={{color:'var(--gold)'}}>{placedOrder.orderNumber}</strong></div>
                <div className="chk-success__row"><span>Member</span><strong>{address.fullName}</strong></div>
                <div className="chk-success__row"><span>Amount</span><strong>₹{placedOrder?.totalAmount || 0}</strong></div>
                <div className="chk-success__row"><span>Payment</span><strong style={{textTransform:'capitalize'}}>{payMethod}</strong></div>
                <div className="chk-success__row"><span>Status</span><strong style={{color:'var(--gold)'}}>⏳ Placed — Awaiting Confirmation</strong></div>
              </div>
              <div className="chk-success__actions">
                <Link to="/dashboard" className="chk-btn-primary">View My Orders</Link>
                <Link to="/collection" className="chk-btn-ghost">Browse More</Link>
              </div>
              <div className="chk-success__visit">
                <span>📍</span>
                <span>Atmanand Saraswati Science College, Kapodara, Surat — 395010 | 📞 +91 96246 07410</span>
              </div>
            </div>
          )}

        </div>
      </section>
      <Footer />
    </div>
  );
}

function OrderSummary({ items, grandTotal, showAddress, address }) {
  return (
    <div className="chk-summary">
      <div className="chk-summary__box">
        <h3 className="chk-summary__title">Order Summary</h3>
        <div className="chk-summary__books">
          {items.map(b => (
            <div key={b._id} className="chk-summary__book">
              <div className="chk-summary__book-cover">
                {b.coverImage ? <img src={b.coverImage} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span>📖</span>}
              </div>
              <div className="chk-summary__book-info">
                <div className="chk-summary__book-title">{b.title}</div>
                <div className="chk-summary__book-author">by {b.author}</div>
                <div style={{fontSize:12,color:'var(--gold)',fontWeight:600}}>₹{b.price || 0}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="chk-summary__divider"/>
        <div className="chk-summary__row"><span>Books</span><span>{items.length}</span></div>
        <div className="chk-summary__row chk-summary__total"><span>Total</span><span>₹{grandTotal}</span></div>
        {showAddress && address?.street && (
          <>
            <div className="chk-summary__divider"/>
            <div className="chk-summary__address">
              <div className="chk-summary__addr-title">📍 Deliver To</div>
              <div className="chk-summary__addr-text">{address.fullName}<br/>{address.street}<br/>{address.city}, {address.state} — {address.pincode}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}