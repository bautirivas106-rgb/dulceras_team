import { createContext, useContext, useReducer, type ReactNode } from 'react'

export interface CartItem {
  variantId: number
  productId: number
  productName: string
  variantName: string
  price: number
  quantity: number
  requiresAdvanceHours: number
}

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: 'ADD'; item: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE'; variantId: number }
  | { type: 'SET_QTY'; variantId: number; qty: number }
  | { type: 'CLEAR' }

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find((i) => i.variantId === action.item.variantId)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.variantId === action.item.variantId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        }
      }
      return { items: [...state.items, { ...action.item, quantity: 1 }] }
    }
    case 'REMOVE':
      return { items: state.items.filter((i) => i.variantId !== action.variantId) }
    case 'SET_QTY':
      if (action.qty <= 0) {
        return { items: state.items.filter((i) => i.variantId !== action.variantId) }
      }
      return {
        items: state.items.map((i) =>
          i.variantId === action.variantId ? { ...i, quantity: action.qty } : i
        ),
      }
    case 'CLEAR':
      return { items: [] }
    default:
      return state
  }
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  total: number
  maxAdvanceHours: number
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (variantId: number) => void
  setQty: (variantId: number, qty: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] })

  const itemCount = state.items.reduce((n, i) => n + i.quantity, 0)
  const total = state.items.reduce((n, i) => n + i.price * i.quantity, 0)
  const maxAdvanceHours = state.items.reduce(
    (max, i) => Math.max(max, i.requiresAdvanceHours),
    0
  )

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        itemCount,
        total,
        maxAdvanceHours,
        addItem: (item) => dispatch({ type: 'ADD', item }),
        removeItem: (variantId) => dispatch({ type: 'REMOVE', variantId }),
        setQty: (variantId, qty) => dispatch({ type: 'SET_QTY', variantId, qty }),
        clear: () => dispatch({ type: 'CLEAR' }),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
