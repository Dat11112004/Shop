import { useState, useEffect } from 'react';
import { productAPI } from '../api/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiPackage, FiX } from 'react-icons/fi';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', imageUrl: '' });

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
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setForm({
        name: product.name,
        description: product.description || '',
        price: product.price,
        imageUrl: product.imageUrl || '',
      });
    } else {
      setEditingProduct(null);
      setForm({ name: '', description: '', price: '', imageUrl: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const res = await productAPI.update(editingProduct.id, form);
        if (res.data.success) {
          toast.success('Cập nhật thành công!');
          loadProducts();
          setIsModalOpen(false);
        }
      } else {
        const res = await productAPI.create(form);
        if (res.data.success) {
          toast.success('Thêm sản phẩm thành công!');
          loadProducts();
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      toast.error('Lỗi lưu sản phẩm');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const res = await productAPI.delete(id);
      if (res.data.success) {
        toast.success('Đã xóa sản phẩm');
        loadProducts();
      }
    } catch (err) {
      toast.error('Lỗi xóa sản phẩm');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><FiPackage /> Quản lý sản phẩm</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <FiPlus /> Thêm sản phẩm
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="admin-product-img" />
                  ) : (
                    <div className="admin-product-placeholder"><FiImage /></div>
                  )}
                </td>
                <td>
                  <div className="admin-product-name">{p.name}</div>
                  <div className="admin-product-desc">{p.description}</div>
                </td>
                <td className="admin-product-price">{formatPrice(p.price)}</td>
                <td>
                  <div className="admin-actions">
                    <button className="btn-icon btn-edit" onClick={() => openModal(p)}>
                      <FiEdit2 />
                    </button>
                    <button className="btn-icon btn-danger" onClick={() => deleteProduct(p.id)}>
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Tên sản phẩm</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Giá (VND)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group">
                <label>URL Hình ảnh</label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu sản phẩm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
