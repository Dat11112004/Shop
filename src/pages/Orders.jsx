import { useState, useEffect } from 'react';
import { orderAPI, paymentAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiPackage, FiCreditCard, FiCheckCircle, FiClock, FiTruck, FiXCircle } from 'react-icons/fi';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const res = isAdmin() ? await orderAPI.getAll() : await orderAPI.getMy();
      if (res.data.success) setOrders(res.data.data);
    } catch { toast.error('Không thể tải đơn hàng'); }
    finally { setLoading(false); }
  };

  const handlePayment = async (orderId) => {
    try {
      let payRes;
      try { payRes = await paymentAPI.create(orderId); }
      catch { payRes = await paymentAPI.getByOrder(orderId); }
      if (payRes.data.success) {
        const pid = payRes.data.data.id;
        if (payRes.data.data.status === 'unpaid') {
          await paymentAPI.markPaid(pid);
          toast.success('Thanh toán thành công!');
        } else { toast.error('Đã thanh toán rồi'); }
        loadOrders();
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi thanh toán'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await orderAPI.updateStatus(id, status);
      toast.success('Đã cập nhật trạng thái');
      loadOrders();
    } catch { toast.error('Lỗi cập nhật'); }
  };

  const sc = {
    pending: { icon: <FiClock />, label: 'Chờ xử lý', cls: 'status-pending' },
    processing: { icon: <FiPackage />, label: 'Đang xử lý', cls: 'status-processing' },
    shipped: { icon: <FiTruck />, label: 'Đang giao', cls: 'status-shipped' },
    delivered: { icon: <FiCheckCircle />, label: 'Đã giao', cls: 'status-delivered' },
    cancelled: { icon: <FiXCircle />, label: 'Đã hủy', cls: 'status-cancelled' },
  };

  const fmt = (p) => new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(p);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><FiPackage /> {isAdmin() ? 'Tất cả đơn hàng' : 'Đơn hàng của tôi'}</h1>
      </div>
      {orders.length === 0 ? (
        <div className="empty-state"><FiPackage className="empty-icon" /><h2>Chưa có đơn hàng</h2></div>
      ) : (
        <div className="orders-list">
          {orders.map((o) => {
            const s = sc[o.status] || sc.pending;
            return (
              <div key={o.id} className="order-card">
                <div className="order-header">
                  <div><h3>Đơn #{o.id}</h3>
                    <span className="order-date">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <span className={`status-badge ${s.cls}`}>{s.icon} {s.label}</span>
                </div>
                <div className="order-items">
                  {o.items.map((i) => (
                    <div key={i.id} className="order-item-row">
                      <span>{i.productName || `SP #${i.productId}`}</span>
                      <span>x{i.quantity}</span>
                      <span>{fmt(i.price * i.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-footer">
                  <span className="order-total">Tổng: {fmt(o.total)}</span>
                  <div className="order-actions">
                    {o.status === 'pending' && (
                      <button className="btn btn-primary btn-sm" onClick={() => handlePayment(o.id)}>
                        <FiCreditCard /> Thanh toán
                      </button>
                    )}
                    {isAdmin() && !['delivered','cancelled'].includes(o.status) && (
                      <select className="status-select" value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="shipped">Đang giao</option>
                        <option value="delivered">Đã giao</option>
                        <option value="cancelled">Hủy</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
