import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiShoppingCart, FiPackage, FiLogOut, FiUser, FiGrid, FiHome } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🛍️</span>
          <span className="brand-text">ShopDB</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">
            <FiHome /> <span>Trang chủ</span>
          </Link>

          {user && (
            <>
              <Link to="/cart" className="nav-link">
                <FiShoppingCart /> <span>Giỏ hàng</span>
              </Link>
              <Link to="/orders" className="nav-link">
                <FiPackage /> <span>Đơn hàng</span>
              </Link>
            </>
          )}

          {user && isAdmin() && (
            <Link to="/admin/products" className="nav-link nav-admin">
              <FiGrid /> <span>Quản lý</span>
            </Link>
          )}
        </div>

        <div className="navbar-auth">
          {user ? (
            <div className="user-menu">
              <span className="user-greeting">
                <FiUser />
                <span>{user.username}</span>
                {isAdmin() && <span className="role-badge">Admin</span>}
              </span>
              <button onClick={handleLogout} className="btn-logout">
                <FiLogOut /> Đăng xuất
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost">Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
