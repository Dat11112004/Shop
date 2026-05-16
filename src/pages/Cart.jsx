import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, orderAPI } from '../api/api';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await cartAPI.get();
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      toast.error('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateQty = async (id, newQty) => {
    if (newQty < 1) return;
    try {
      await cartAPI.update(id, { quantity: newQty });
      setItems(items.map((i) => (i.id === id ? { ...i, quantity: newQty, subTotal: i.productPrice * newQty } : i)));
    } catch (err) {
      toast.error('Lỗi cập nhật số lượng');
    }
  };

  const removeItem = async (id) => {
    try {
      await cartAPI.remove(id);
      setItems(items.filter((i) => i.id !== id));
      toast.success('Đã xóa khỏi giỏ hàng');
    } catch (err) {
      toast.error('Lỗi xóa sản phẩm');
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      setItems([]);
      toast.success('Đã xóa toàn bộ giỏ hàng');
    } catch (err) {
      toast.error('Lỗi xóa giỏ hàng');
    }
  };

  const placeOrder = async () => {
    if (items.length === 0) return;
    setOrdering(true);
    try {
      const res = await orderAPI.create();
      if (res.data.success) {
        toast.success('Đặt hàng thành công!');
        navigate(`/orders`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi đặt hàng');
    } finally {
      setOrdering(false);
    }
  };

  const total = items.reduce((sum, i) => sum + i.subTotal, 0);

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Đang tải giỏ hàng...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><FiShoppingCart /> Giỏ hàng ({items.length})</h1>
        {items.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={clearCart}>
            <FiTrash2 /> Xóa tất cả
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <FiShoppingCart className="empty-icon" />
          <h2>Giỏ hàng trống</h2>
          <p>Hãy thêm sản phẩm vào giỏ hàng</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            <FiShoppingBag /> Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <h3>{item.productName}</h3>
                  <p className="cart-item-price">{formatPrice(item.productPrice)}</p>
                </div>
                <div className="cart-item-actions">
                  <div className="qty-control">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                      <FiMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)}>
                      <FiPlus />
                    </button>
                  </div>
                  <span className="cart-item-subtotal">{formatPrice(item.subTotal)}</span>
                  <button className="btn-icon btn-danger" onClick={() => removeItem(item.id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h2>Tóm tắt đơn hàng</h2>
            <div className="summary-row">
              <span>Số lượng sản phẩm</span>
              <span>{items.length}</span>
            </div>
            <div className="summary-row">
              <span>Tổng số lượng</span>
              <span>{items.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Tổng cộng</span>
              <span>{formatPrice(total)}</span>
            </div>
            <button className="btn btn-primary btn-full" onClick={placeOrder} disabled={ordering}>
              {ordering ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
