import { useState, useEffect } from 'react';
import { productAPI, cartAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiSearch, FiPackage } from 'react-icons/fi';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await productAPI.getAll();
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      toast.error('Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }
    try {
      const res = await cartAPI.add({ productId, quantity: 1 });
      if (res.data.success) {
        toast.success('Đã thêm vào giỏ hàng!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi thêm vào giỏ hàng');
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><FiPackage /> Sản phẩm</h1>
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <FiPackage className="empty-icon" />
          <h2>Không tìm thấy sản phẩm</h2>
          <p>Hãy thử tìm kiếm với từ khóa khác</p>
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} />
                ) : (
                  <div className="product-placeholder">
                    <FiPackage />
                  </div>
                )}
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">
                  {product.description || 'Chưa có mô tả'}
                </p>
                <div className="product-footer">
                  <span className="product-price">{formatPrice(product.price)}</span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => addToCart(product.id)}
                  >
                    <FiShoppingCart /> Thêm
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
