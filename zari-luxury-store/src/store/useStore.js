import { create } from 'zustand';

export const useStore = create((set) => ({
  cart: [],
  wishlist: [],
  isCartOpen: false,
  isMobileMenuOpen: false,
  
  addToCart: (product) => set((state) => {
    const existingItem = state.cart.find(item => item.id === product.id);
    if (existingItem) {
      return {
        cart: state.cart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      };
    }
    return { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),
  
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter(item => item.id !== productId)
  })),
  
  updateQuantity: (productId, quantity) => set((state) => ({
    cart: state.cart.map(item =>
      item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
    ).filter(item => item.quantity > 0)
  })),
  
  toggleWishlist: (product) => set((state) => {
    const isInWishlist = state.wishlist.find(item => item.id === product.id);
    if (isInWishlist) {
      return { wishlist: state.wishlist.filter(item => item.id !== product.id) };
    }
    return { wishlist: [...state.wishlist, product] };
  }),
  
  setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
  setIsMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  
  getCartTotal: () => {
    const state = useStore.getState();
    return state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
  
  getCartCount: () => {
    const state = useStore.getState();
    return state.cart.reduce((count, item) => count + item.quantity, 0);
  },
}));
