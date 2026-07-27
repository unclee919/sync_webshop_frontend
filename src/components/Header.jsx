import { Link } from 'react-router-dom'
import { useTheme } from '../theme/ThemeProvider'
import { useCart } from '../context/CartContext'

export default function Header() {
  const theme = useTheme()
  const { items } = useCart()
  const count = items.reduce((n, i) => n + i.qty, 0)

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        borderBottom: `1px solid ${theme.colors.secondary}`,
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {theme.logo && <img src={theme.logo} alt="" style={{ height: 32 }} />}
      </Link>
      <nav style={{ display: 'flex', gap: '1.5rem' }}>
        <Link to="/products">Products</Link>
        <Link to="/dashboard">My Orders</Link>
        <Link to="/cart">Cart ({count})</Link>
      </nav>
    </header>
  )
}
