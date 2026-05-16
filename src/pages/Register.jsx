import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUserPlus, FiUser, FiLock } from 'react-icons/fi';

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Mật khẩu không khớp!');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register({
        username: form.username,
        password: form.password,
        role: 'customer',
      });
      if (res.data.success) {
        login(res.data.data);
        toast.success('Đăng ký thành công!');
        navigate('/');
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon"><FiUserPlus /></div>
          <h1>Đăng ký</h1>
          <p>Tạo tài khoản mới để mua sắm</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label><FiUser /> Tên đăng nhập</label>
            <input
              type="text"
              placeholder="Nhập tên đăng nhập (tối thiểu 3 ký tự)"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              minLength={3}
              required
            />
          </div>
          <div className="form-group">
            <label><FiLock /> Mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={6}
              required
            />
          </div>
          <div className="form-group">
            <label><FiLock /> Xác nhận mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>
        <p className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
