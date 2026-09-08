import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Menu, X, Search, Star, ChevronLeft, Plus, Minus, Trash2 } from 'lucide-react';
import { products, categories, formatPrice } from './data/products';
import { useStore } from './store/useStore';

// Header Component
function Header() {
  const { setIsCartOpen, setIsMobileMenuOpen, getCartCount } = useStore();
  const cartCount = getCartCount();

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-800" />
          </button>

          {/* Logo */}
          <div className="text-3xl font-bold text-gray-900 tracking-wider">
            زری
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">صفحه اصلی</a>
            <a href="#shop" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">فروشگاه</a>
            <a href="#collections" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">کالکشن‌ها</a>
            <a href="#about" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">درباره ما</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
              <Search className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
              <Heart className="w-5 h-5 text-gray-700" />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ShoppingBag className="w-5 h-5 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

// Mobile Menu Component
function MobileMenu() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useStore();

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-white z-50 lg:hidden shadow-2xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="text-2xl font-bold text-gray-900">زری</div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-700" />
                </button>
              </div>
              <nav className="space-y-4">
                <a href="#" className="block py-3 text-gray-700 hover:text-gray-900 transition-colors font-medium border-b border-gray-100">صفحه اصلی</a>
                <a href="#shop" className="block py-3 text-gray-700 hover:text-gray-900 transition-colors font-medium border-b border-gray-100">فروشگاه</a>
                <a href="#collections" className="block py-3 text-gray-700 hover:text-gray-900 transition-colors font-medium border-b border-gray-100">کالکشن‌ها</a>
                <a href="#about" className="block py-3 text-gray-700 hover:text-gray-900 transition-colors font-medium border-b border-gray-100">درباره ما</a>
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Cart Drawer Component
function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cart, removeFromCart, updateQuantity, getCartTotal } = useStore();
  const total = getCartTotal();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">سبد خرید</h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-700" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">سبد خرید شما خالی است</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-20 h-24 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{formatPrice(item.price)}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 hover:bg-red-100 rounded transition-colors mr-auto text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">جمع کل:</span>
                  <span className="text-xl font-bold text-gray-900">{formatPrice(total)}</span>
                </div>
                <button className="w-full py-4 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors">
                  ادامه فرآیند خرید
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hero Section Component
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-amber-50/30">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gray-900 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-900 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-right"
          >
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-6"
            >
              کالکشن جدید ۱۴۰۵
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6"
            >
              زیبایی در هر
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-gray-900 via-gray-700 to-gray-900">
                جزئیات
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 mb-8 leading-relaxed"
            >
              مجموعه‌ای بی‌نظیر از لباس‌های زنانه با طراحی مدرن و کیفیت لوکس
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4"
            >
              <a 
                href="#shop"
                className="px-8 py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition-all hover:shadow-lg hover:scale-105"
              >
                مشاهده فروشگاه
              </a>
              <a 
                href="#collections"
                className="px-8 py-4 border-2 border-gray-900 text-gray-900 rounded-full font-bold hover:bg-gray-900 hover:text-white transition-all"
              >
                کالکشن‌ها
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&h=1000&fit=crop"
                alt="Hero"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            
            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -right-6 w-32 h-32 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">+۲۰۰</div>
                <div className="text-sm text-gray-600">محصول جدید</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -bottom-6 -left-6 w-40 h-40 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-sm text-gray-600">رضایت مشتریان</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Product Card Component
function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const isInWishlist = wishlist.find(item => item.id === product.id);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
        <img 
          src={isHovered && product.imageHover ? product.imageHover : product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-full">
              جدید
            </span>
          )}
          {product.isSale && (
            <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
              {product.discount}% تخفیف
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={() => toggleWishlist(product)}
          className={`absolute top-3 left-3 p-2 rounded-full transition-all ${
            isInWishlist 
              ? 'bg-red-500 text-white' 
              : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
          }`}
        >
          <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add to Cart */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: isHovered ? 0 : 100 }}
          className="absolute bottom-0 left-0 right-0 p-4"
        >
          <button 
            onClick={() => addToCart(product)}
            className="w-full py-3 bg-white/95 backdrop-blur-sm text-gray-900 rounded-lg font-bold hover:bg-gray-900 hover:text-white transition-all"
          >
            افزودن به سبد
          </button>
        </motion.div>
      </div>

      <div className="mt-4 text-right">
        <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
        <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
        <div className="flex items-center gap-2">
          {product.oldPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Shop Section Component
function ShopSection() {
  const [activeCategory, setActiveCategory] = useState('همه');
  const allCategories = ['همه', ...categories.map(c => c.name)];
  
  const filteredProducts = activeCategory === 'همه' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <section id="shop" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">محصولات منتخب</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            مجموعه‌ای از بهترین محصولات با کیفیت بالا و طراحی منحصر به فرد
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeCategory === category
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Categories Section Component
function CategoriesSection() {
  return (
    <section id="collections" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">دسته‌بندی‌ها</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            محصولات خود را بر اساس دسته‌بندی مورد نظر پیدا کنید
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl cursor-pointer"
            >
              <img 
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                <div className="mt-2 flex items-center gap-2 text-white/90">
                  <span>مشاهده محصولات</span>
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features Section Component
function FeaturesSection() {
  const features = [
    {
      icon: "🚚",
      title: "ارسال سریع",
      description: "تحویل ۲ تا ۵ روز کاری در سراسر ایران"
    },
    {
      icon: "💎",
      title: "کیفیت تضمینی",
      description: "ضمانت بازگشت کالا تا ۷ روز"
    },
    {
      icon: "🔒",
      title: "پرداخت امن",
      description: "درگاه پرداخت ایمن و مطمئن"
    },
    {
      icon: "📞",
      title: "پشتیبانی ۲۴/۷",
      description: "پاسخگویی در تمام روزهای هفته"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="text-3xl font-bold mb-6">زری</div>
            <p className="text-gray-400 leading-relaxed">
              فروشگاه اینترنتی زری، ارائه‌دهنده لباس‌های زنانه با طراحی مدرن و کیفیت لوکس
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">دسترسی سریع</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">صفحه اصلی</a></li>
              <li><a href="#shop" className="text-gray-400 hover:text-white transition-colors">فروشگاه</a></li>
              <li><a href="#collections" className="text-gray-400 hover:text-white transition-colors">کالکشن‌ها</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">درباره ما</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">خدمات مشتریان</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">راهنمای خرید</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">رویه بازگرداندن کالا</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">پیگیری سفارش</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">تماس با ما</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">عضویت در خبرنامه</h4>
            <p className="text-gray-400 mb-4">برای اطلاع از آخرین محصولات و تخفیف‌ها عضو شوید</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="ایمیل شما"
                className="flex-1 px-4 py-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button className="px-6 py-3 bg-amber-500 text-gray-900 font-bold rounded-lg hover:bg-amber-400 transition-colors">
                عضویت
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>© ۱۴۰۵ زری. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}

// Main App Component
function App() {
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Header />
      <MobileMenu />
      <CartDrawer />
      
      <main>
        <HeroSection />
        <ShopSection />
        <CategoriesSection />
        <FeaturesSection />
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
