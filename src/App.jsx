import { useEffect, useState } from 'react'
import { CartProvider, useCart } from './contexts/CartContext'

function Navbar({ onOpenCart }) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-semibold tracking-tight">Aesthetic Menswear</a>
        <nav className="flex items-center gap-4">
          <a href="#tops" className="text-sm text-gray-600 hover:text-gray-900">Tops</a>
          <a href="#outerwear" className="text-sm text-gray-600 hover:text-gray-900">Outerwear</a>
          <a href="#bottoms" className="text-sm text-gray-600 hover:text-gray-900">Bottoms</a>
          <a href="#footwear" className="text-sm text-gray-600 hover:text-gray-900">Footwear</a>
          <button onClick={onOpenCart} className="ml-2 rounded-full bg-gray-900 text-white px-4 py-2 text-sm">Cart</button>
        </nav>
      </div>
    </header>
  )
}

function ProductCard({ product, onAdd }) {
  const [size, setSize] = useState(product.sizes?.[0] || null)
  const [color, setColor] = useState(product.colors?.[0] || null)
  return (
    <div className="group rounded-xl bg-white border shadow-sm overflow-hidden flex flex-col">
      <div className="aspect-[4/3] overflow-hidden">
        <img src={product.images?.[0]} alt={product.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-medium text-gray-900">{product.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
        <div className="mt-3 flex items-center gap-2">
          {product.sizes?.slice(0,4).map(s => (
            <button key={s} onClick={() => setSize(s)} className={`px-2 py-1 text-xs rounded border ${size===s? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}>{s}</button>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          {product.colors?.slice(0,4).map(c => (
            <button key={c} onClick={() => setColor(c)} className={`px-2 py-1 text-xs rounded border ${color===c? 'bg-gray-900 text-white' : 'bg-white text-gray-700'}`}>{c}</button>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-semibold">${product.price.toFixed(2)}</span>
          <button onClick={() => onAdd(product, { size, color })} className="rounded-md bg-gray-900 text-white px-3 py-2 text-sm">Add to cart</button>
        </div>
      </div>
    </div>
  )
}

function CartDrawer({ open, onClose }) {
  const { items, removeItem, updateQty, total, clear } = useCart()
  return (
    <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/30 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button onClick={onClose} className="text-sm text-gray-600">Close</button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-200px)]">
          {items.length === 0 ? (
            <p className="text-sm text-gray-600">Your cart is empty.</p>
          ) : (
            items.map((it, idx) => (
              <div key={idx} className="flex gap-3 border rounded-lg p-3">
                <img src={it.image} alt={it.title} className="h-20 w-20 object-cover rounded" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{it.title}</p>
                  <p className="text-xs text-gray-500">{[it.color, it.size].filter(Boolean).join(' • ')}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <input type="number" className="w-16 border rounded px-2 py-1 text-sm" value={it.quantity} min={1} onChange={(e)=>updateQty(idx, parseInt(e.target.value||'1'))} />
                    <button onClick={()=>removeItem(idx)} className="text-sm text-red-600">Remove</button>
                  </div>
                </div>
                <div className="text-sm font-medium">${(it.price*it.quantity).toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="text-lg font-semibold">${total.toFixed(2)}</span>
          </div>
          <CheckoutButton onSuccess={clear} />
        </div>
      </div>
    </div>
  )
}

function CheckoutButton({ onSuccess }) {
  const { items, total, clear } = useCart()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const submitOrder = async () => {
    if (items.length === 0) return
    setLoading(true)
    setStatus('')
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      const order = {
        items: items.map(it => ({
          product_id: it.id,
          title: it.title,
          price: it.price,
          quantity: it.quantity,
          size: it.size,
          color: it.color,
          image: it.image,
        })),
        total,
        customer: {
          name: 'Guest',
          email: 'guest@example.com',
          address: 'N/A'
        }
      }
      const res = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      })
      if (!res.ok) throw new Error('Checkout failed')
      const data = await res.json()
      setStatus('Order placed! #' + data.id)
      onSuccess?.()
    } catch (e) {
      setStatus('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={submitOrder} disabled={loading || items.length===0} className="w-full rounded-md bg-gray-900 text-white px-4 py-2 text-sm disabled:opacity-50">
        {loading ? 'Processing...' : `Checkout ($${total.toFixed(2)})`}
      </button>
      {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-50 to-gray-100" />
      <div className="max-w-6xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">Elevate your everyday</h1>
          <p className="mt-4 text-gray-600">Minimal silhouettes, premium materials, and a neutral palette curated for the modern wardrobe.</p>
          <a href="#catalog" className="inline-block mt-6 rounded-md bg-gray-900 text-white px-5 py-3 text-sm">Shop the collection</a>
        </div>
        <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
          <img className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1600&auto=format&fit=crop" alt="Hero" />
        </div>
      </div>
    </section>
  )
}

function Catalog({ onAdd }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
        const params = new URLSearchParams()
        if (query) params.set('q', query)
        if (category) params.set('category', category)
        const res = await fetch(`${baseUrl}/products?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to load products')
        const data = await res.json()
        setProducts(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [query, category])

  return (
    <section id="catalog" className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold">New Arrivals</h2>
        <div className="flex items-center gap-3">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search" className="border rounded px-3 py-2 text-sm w-48" />
          <select value={category} onChange={e=>setCategory(e.target.value)} className="border rounded px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="tops">Tops</option>
            <option value="outerwear">Outerwear</option>
            <option value="bottoms">Bottoms</option>
            <option value="footwear">Footwear</option>
          </select>
        </div>
      </div>
      {loading ? (
        <p className="text-gray-600">Loading products...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <ProductCard key={p.id} product={p} onAdd={onAdd} />
          ))}
        </div>
      )}
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Aesthetic Menswear. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-gray-900">Shipping</a>
          <a href="#" className="hover:text-gray-900">Returns</a>
          <a href="/test" className="hover:text-gray-900">System check</a>
        </div>
      </div>
    </footer>
  )
}

function AppInner() {
  const { addItem } = useCart()
  const [open, setOpen] = useState(false)

  const onAdd = (product, options) => {
    addItem(product, { ...options, quantity: 1 })
    setOpen(true)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar onOpenCart={() => setOpen(true)} />
      <Hero />
      <Catalog onAdd={onAdd} />
      <CartDrawer open={open} onClose={() => setOpen(false)} />
      <Footer />
    </div>
  )
}

function App() {
  return (
    <CartProvider>
      <AppInner />
    </CartProvider>
  )
}

export default App
