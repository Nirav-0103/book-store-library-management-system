import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import './BookModal.css';

export default function BookModal({ book, onClose }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [mainImg, setMainImg] = useState(book.coverImage || '');
  const { addToCart, removeFromCart, isInCart } = useCart();
  const inCart = isInCart(book._id);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleCart = () => {
    if (inCart) {
      removeFromCart(book._id);
      toast('Removed from cart', { icon: '🗑️' });
    } else {
      if (book.availableCopies <= 0) {
        toast.error('This book is currently unavailable');
        return;
      }
      // Explicitly pass all needed fields including price
      const bookToAdd = {
        _id: book._id,
        title: book.title,
        author: book.author,
        category: book.category,
        price: Number(book.price) || 0,
        coverImage: book.coverImage || '',
        availableCopies: book.availableCopies,
        totalCopies: book.totalCopies,
        isbn: book.isbn,
        publisher: book.publisher || '',
        publishedYear: book.publishedYear || '',
        language: book.language || '',
        pages: book.pages || '',
        description: book.description || '',
      };
      console.log('Adding to cart with price:', bookToAdd.price); // debug
      addToCart(bookToAdd);
      toast.success(`Added to cart! ₹${bookToAdd.price > 0 ? bookToAdd.price : 'Free'} 🛒`);
    }
  };

  return (
    <div className="bmodal-overlay" onClick={onClose}>
      <div className="bmodal" onClick={e => e.stopPropagation()}>
        <button className="bmodal__close" onClick={onClose}>✕</button>

        <div className="bmodal__inner">
          {/* Left — Cover */}
          <div className="bmodal__left">
            <div className="bmodal__cover">
              {(mainImg || book.coverImage)
                ? <img src={mainImg || book.coverImage} alt={book.title} className="bmodal__cover-img" />
                : (
                  <div className="bmodal__cover-placeholder">
                    <span className="bmodal__cover-emoji">📖</span>
                    <span className="bmodal__cover-ctitle">{book.title}</span>
                    <span className="bmodal__cover-cauthor">{book.author}</span>
                  </div>
                )
              }
            </div>

            {/* Extra Images Gallery */}
            {book.extraImages && book.extraImages.length > 0 && (
              <div className="bmodal__gallery">
                {book.extraImages.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${book.title} ${i+1}`}
                    className="bmodal__gallery-img"
                    onClick={() => setMainImg(img)}
                  />
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="bmodal__actions">
              <button
                className={`bmodal__cart-btn ${inCart ? 'in-cart' : ''} ${book.availableCopies <= 0 ? 'unavailable' : ''}`}
                onClick={handleCart}
                disabled={book.availableCopies <= 0 && !inCart}
              >
                {inCart
                  ? '✅ In Cart — Click to Remove'
                  : book.availableCopies <= 0
                    ? '❌ Unavailable'
                    : `🛒 Add to Cart${book.price > 0 ? ` — ₹${book.price}` : ' — Free'}`}
              </button>

              <button
                className={`bmodal__wishlist ${wishlisted ? 'wishlisted' : ''}`}
                onClick={() => {
                  setWishlisted(w => !w);
                  toast(wishlisted ? 'Removed from wishlist' : '❤️ Added to wishlist!');
                }}
              >
                {wishlisted ? '❤️ Wishlisted' : '🤍 Wishlist'}
              </button>
            </div>
          </div>

          {/* Right — Details */}
          <div className="bmodal__right">
            <div className="bmodal__category">{book.category}</div>
            <h2 className="bmodal__title">{book.title}</h2>
            <p className="bmodal__author">by <strong>{book.author}</strong></p>

            {/* Price display */}
            {book.price > 0 && (
              <div style={{
                display:'inline-block',
                padding:'6px 16px', marginBottom:12,
                background:'rgba(201,168,76,0.12)',
                border:'1px solid rgba(201,168,76,0.3)',
                borderRadius:20, fontSize:16, fontWeight:700,
                color:'var(--gold)'
              }}>
                ₹{book.price}
              </div>
            )}

            {/* Availability */}
            <div className={`bmodal__avail-bar ${book.availableCopies > 0 ? 'avail-bar--yes' : 'avail-bar--no'}`}>
              {book.availableCopies > 0
                ? `✅ ${book.availableCopies} cop${book.availableCopies === 1 ? 'y' : 'ies'} available`
                : '❌ Currently unavailable'}
            </div>

            {book.description && (
              <p className="bmodal__desc">{book.description}</p>
            )}

            <div className="bmodal__details">
              {book.publisher && (
                <div className="bmodal__detail">
                  <span className="bmodal__detail-label">Publisher</span>
                  <span className="bmodal__detail-value">{book.publisher}</span>
                </div>
              )}
              {book.publishedYear && (
                <div className="bmodal__detail">
                  <span className="bmodal__detail-label">Year</span>
                  <span className="bmodal__detail-value">{book.publishedYear}</span>
                </div>
              )}
              {book.language && (
                <div className="bmodal__detail">
                  <span className="bmodal__detail-label">Language</span>
                  <span className="bmodal__detail-value">{book.language}</span>
                </div>
              )}
              {book.pages && (
                <div className="bmodal__detail">
                  <span className="bmodal__detail-label">Pages</span>
                  <span className="bmodal__detail-value">{book.pages}</span>
                </div>
              )}
              <div className="bmodal__detail">
                <span className="bmodal__detail-label">ISBN</span>
                <span className="bmodal__detail-value" style={{ fontFamily: 'monospace', fontSize:11 }}>{book.isbn}</span>
              </div>
              <div className="bmodal__detail">
                <span className="bmodal__detail-label">Copies</span>
                <span className="bmodal__detail-value">{book.availableCopies} / {book.totalCopies}</span>
              </div>
            </div>

            <div className="bmodal__note">
              <span>ℹ️</span>
              <span>Go to Library and check book condtion before , if you  purchase book offline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}