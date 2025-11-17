import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const addItem = (product, options = {}) => {
    const { size = null, color = null, quantity = 1 } = options
    setItems(prev => {
      const idx = prev.findIndex(
        it => it.id === product.id && it.size === size && it.color === color
      )
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity }
        return updated
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.images?.[0] || '',
          size,
          color,
          quantity,
        },
      ]
    })
  }

  const removeItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateQty = (index, qty) => {
    setItems(prev => prev.map((it, i) => (i === index ? { ...it, quantity: Math.max(1, qty) } : it)))
  }

  const clear = () => setItems([])

  const total = useMemo(() => items.reduce((sum, it) => sum + it.price * it.quantity, 0), [items])

  const value = { items, addItem, removeItem, updateQty, clear, total }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
