'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Plus, ChevronRight, Coffee, Minus } from 'lucide-react';
import { restaurantService } from '@/services/restaurantService';
import { menuService } from '@/services/menuService';
import { useCartStore } from '@/stores/cartStore';
import { Watermark, WatermarkSpacer } from '@/components/Watermark';
import type { Restaurant, MenuItem, MenuCategory } from '@/types';

// Demo data
const DEMO_RESTAURANT: Restaurant = {
  id: 'demo',
  slug: 'demo',
  name: 'ZCOFFEE',
  cuisineType: 'Café & Restaurant',
  address: 'Oued Ellil, Tunis',
  phone: '+216 XX XXX XXX',
  email: 'hello@zcoffee.tn',
  status: 'ACTIVE',
  currency: 'TND',
  plan: 'free',
  slugType: 'free-random',
  watermarkEnabled: false,
  maxMenuItems: 50,
  createdAt: new Date(),
  updatedAt: new Date(),
};

interface MenuDisplayItem {
  id: string;
  category: string;
  categoryAr: string;
  nameFr: string;
  nameAr: string;
  price: string;
}

const DEMO_MENU_ITEMS: MenuDisplayItem[] = [
  { id: '1', category: 'Cafés', categoryAr: 'القهوة', nameFr: 'Express / Demi / Allongé', nameAr: 'إكسبريسو / دمي / ألونجي', price: '2.5' },
  { id: '2', category: 'Cafés', categoryAr: 'القهوة', nameFr: 'Cappuccino / Americano', nameAr: 'كابوتشينو / أمريكانو', price: '2.8' },
  { id: '3', category: 'Cafés', categoryAr: 'القهوة', nameFr: 'Direct', nameAr: 'قهوة ديريكت', price: '3.2' },
  { id: '4', category: 'Cafés', categoryAr: 'القهوة', nameFr: 'Spécial', nameAr: 'قهوة خاصة', price: '3.5' },
  { id: '5', category: 'Boissons Fraîches', categoryAr: 'مشروبات باردة', nameFr: 'Jus Frais', nameAr: 'عصير طازج', price: '4' },
  { id: '6', category: 'Boissons Fraîches', categoryAr: 'مشروبات باردة', nameFr: 'Citronnade', nameAr: 'ليموناضة', price: '3' },
  { id: '7', category: 'Boissons Fraîches', categoryAr: 'مشروبات باردة', nameFr: 'Citronnade Amande', nameAr: 'ليموناضة باللوز', price: '5' },
  { id: '8', category: 'Boissons Fraîches', categoryAr: 'مشروبات باردة', nameFr: 'Mojito', nameAr: 'موهيتو', price: '6' },
  { id: '9', category: 'Viennoiseries', categoryAr: 'مخبوزات', nameFr: 'Snoopy / Croissant', nameAr: 'سنوبي / كرواسون', price: '2.5' },
  { id: '10', category: 'Viennoiseries', categoryAr: 'مخبوزات', nameFr: 'Pâté', nameAr: 'باتي', price: '2' },
  { id: '11', category: 'Thé', categoryAr: 'الشاي', nameFr: 'Thé', nameAr: 'شاي', price: '2' },
  { id: '12', category: 'Thé', categoryAr: 'الشاي', nameFr: 'Thé Amande', nameAr: 'شاي باللوز', price: '4' },
  { id: '13', category: 'Chicha & Girac', categoryAr: 'شيشة وجيراك', nameFr: 'Chicha Menthe', nameAr: 'شيشة نعناع', price: '4' },
  { id: '14', category: 'Chicha & Girac', categoryAr: 'شيشة وجيراك', nameFr: 'Chicha Cocktail', nameAr: 'شيشة كوكتيل', price: '4.5' },
  { id: '15', category: 'Chicha & Girac', categoryAr: 'شيشة وجيراك', nameFr: 'Chicha Vide', nameAr: 'شيشة فارغة', price: '3' },
  { id: '16', category: 'Chicha & Girac', categoryAr: 'شيشة وجيراك', nameFr: 'Girac (M)', nameAr: 'جيراك (M)', price: '3.5' },
  { id: '17', category: 'Chicha & Girac', categoryAr: 'شيشة وجيراك', nameFr: 'Girac (XL)', nameAr: 'جيراك (XL)', price: '4.5' },
  { id: '18', category: 'Chicha & Girac', categoryAr: 'شيشة وجيراك', nameFr: 'Girac (XXL)', nameAr: 'جيراك (XXL)', price: '5.5' },
  { id: '19', category: 'Eaux & Soft', categoryAr: 'مياه ومشروبات غازية', nameFr: 'Eau 1.5 L', nameAr: 'ماء 1.5 ل', price: '2' },
  { id: '20', category: 'Eaux & Soft', categoryAr: 'مياه ومشروبات غازية', nameFr: 'Eau 0.5 L', nameAr: 'ماء 0.5 ل', price: '1' },
  { id: '21', category: 'Eaux & Soft', categoryAr: 'مياه ومشروبات غازية', nameFr: 'Canette', nameAr: 'كانات', price: '2.5' },
];

const uiStrings = {
  fr: { tag: 'The Experience', footer: 'Merci de votre visite', toggle: 'عربي', viewOrder: 'Commande' },
  ar: { tag: 'التجربة الفريدة', footer: 'شكراً لزيارتكم', toggle: 'Français', viewOrder: 'الطلب' }
};

export default function PublicMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState<'fr' | 'ar'>('fr');
  
  const { items, addItem, removeItem, getTotalItems, getTotalPrice, getItemByItemId } = useCartStore();
  const cartItemCount = getTotalItems();
  const cartTotal = getTotalPrice();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        if (resolvedParams.slug === 'demo') {
          setRestaurant(DEMO_RESTAURANT);
          setMenuItems(DEMO_MENU_ITEMS);
          setLoading(false);
          return;
        }
        
        const restaurantData = await restaurantService.getBySlug(resolvedParams.slug);
        if (restaurantData) {
          setRestaurant(restaurantData);
          const [categoriesData, itemsData] = await Promise.all([
            menuService.getCategories(restaurantData.id),
            menuService.getMenuItems(restaurantData.id),
          ]);
          
          const displayItems: MenuDisplayItem[] = itemsData.map((item) => {
            const category = categoriesData.find(c => c.id === item.categoryId);
            return {
              id: item.id,
              category: category?.name || 'Autre',
              categoryAr: (category as any)?.nameAr || category?.name || 'آخر',
              nameFr: item.name,
              nameAr: (item as any).nameAr || item.name,
              price: item.price.toFixed(1),
            };
          });
          setMenuItems(displayItems.length > 0 ? displayItems : DEMO_MENU_ITEMS);
        } else {
          setRestaurant(DEMO_RESTAURANT);
          setMenuItems(DEMO_MENU_ITEMS);
        }
      } catch {
        setRestaurant(DEMO_RESTAURANT);
        setMenuItems(DEMO_MENU_ITEMS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [resolvedParams.slug]);

  const categories = [...new Set(menuItems.map(item => currentLang === 'fr' ? item.category : (item.categoryAr || item.category)))];
  
  const handleAdd = (item: MenuDisplayItem) => {
    addItem({ itemId: item.id, name: currentLang === 'fr' ? item.nameFr : item.nameAr, price: parseFloat(item.price), quantity: 1 });
  };

  const handleRemove = (itemId: string) => {
    removeItem(itemId);
  };

  const currency = currentLang === 'fr' ? 'DT' : 'د.ت';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6]" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
        <nav className="sticky top-0 z-50 bg-[#faf9f6]/95 backdrop-blur-md px-5 py-4 flex justify-center border-b border-black/5">
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 bg-[#2d2a26] rounded-xl flex items-center justify-center mb-1">
              <Coffee className="w-5 h-5 text-[#b48c68]" />
            </div>
            <h1 className="font-serif text-lg font-bold text-[#2d2a26]">ZCOFFEE</h1>
          </div>
        </nav>
        <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
              <div className="h-4 w-24 bg-gray-100 rounded mb-4" />
              <div className="space-y-3">
                {[1,2,3].map(j => <div key={j} className="h-3 w-full bg-gray-50 rounded" />)}
              </div>
            </div>
          ))}
        </main>
      </div>
    );
  }

  const showWatermark = restaurant?.plan === 'free' || restaurant?.watermarkEnabled === true;

  return (
    <WatermarkSpacer showWatermark={showWatermark}>
      <div className="min-h-screen bg-[#faf9f6] pb-24" dir={currentLang === 'ar' ? 'rtl' : 'ltr'} lang={currentLang}>
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-[#faf9f6]/95 backdrop-blur-md px-5 py-4 flex justify-center items-center border-b border-black/5">
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 bg-[#2d2a26] rounded-xl flex items-center justify-center mb-1">
              <Coffee className="w-5 h-5 text-[#b48c68]" />
            </div>
            <h1 className="font-serif text-lg font-bold text-[#2d2a26]">{restaurant?.name || 'ZCOFFEE'}</h1>
            <p className="text-[6px] uppercase tracking-[0.3em] text-[#b48c68] font-semibold">{uiStrings[currentLang].tag}</p>
          </div>
          <button
            onClick={() => setCurrentLang(currentLang === 'fr' ? 'ar' : 'fr')}
            className="absolute right-4 bg-white text-[#b48c68] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#b48c68]/20"
          >
            {uiStrings[currentLang].toggle}
          </button>
        </nav>

        {/* Menu */}
        <main className="max-w-lg mx-auto px-4 py-5 space-y-5">
          {categories.map((cat) => {
            const catItems = menuItems.filter(item => 
              (currentLang === 'fr' ? item.category : (item.categoryAr || item.category)) === cat
            );
            
            return (
              <div key={cat} className="bg-white rounded-2xl p-5 shadow-sm">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="font-serif italic text-[#b48c68] font-bold">{cat}</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#b48c68]/20 to-transparent" />
                </div>
                
                {/* Items */}
                <div className="divide-y divide-black/[0.04]">
                  {catItems.map((item) => {
                    const name = currentLang === 'fr' ? item.nameFr : item.nameAr;
                    const cartItem = getItemByItemId(item.id);
                    const qty = cartItem?.quantity || 0;
                    
                    return (
                      <div key={item.id} className="flex items-center justify-between py-3 gap-3">
                        <span className="font-medium text-[#2d2a26] text-[15px] flex-1">{name}</span>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[#b48c68] font-bold text-[15px]">{item.price} {currency}</span>
                          
                          {qty > 0 ? (
                            <div className="flex items-center gap-1 bg-[#faf9f6] rounded-full p-1">
                              <button
                                onClick={() => handleRemove(item.id)}
                                className="w-7 h-7 rounded-full bg-white text-[#2d2a26] flex items-center justify-center text-sm font-bold shadow-sm active:scale-95 transition"
                              >
                                −
                              </button>
                              <span className="w-6 text-center font-bold text-sm text-[#2d2a26]">{qty}</span>
                              <button
                                onClick={() => handleAdd(item)}
                                className="w-7 h-7 rounded-full bg-[#b48c68] text-white flex items-center justify-center text-sm font-bold shadow-sm active:scale-95 transition"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAdd(item)}
                              className="w-8 h-8 rounded-full bg-[#2d2a26] text-white flex items-center justify-center shadow-sm active:scale-95 transition"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </main>

        {/* Footer */}
        <footer className="text-center py-6 opacity-40">
          <p className="font-serif italic text-sm text-[#2d2a26]">{uiStrings[currentLang].footer}</p>
          <p className="text-[8px] uppercase tracking-[0.4em] text-[#71717a] mt-1">Oued Ellil • Tunis</p>
        </footer>

        {/* Cart Bar */}
        {cartItemCount > 0 && (
          <Link
            href={`/r/${restaurant?.slug || 'demo'}/t/order`}
            className="fixed bottom-4 left-4 right-4 z-50 max-w-lg mx-auto"
          >
            <div className="bg-[#2d2a26] text-white h-14 rounded-2xl shadow-lg flex items-center justify-between px-5 active:scale-[0.98] transition">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#b48c68] flex items-center justify-center font-bold text-sm">
                  {cartItemCount}
                </div>
                <span className="font-bold uppercase tracking-wider text-sm">{uiStrings[currentLang].viewOrder}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{cartTotal.toFixed(2)} {currency}</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        )}

        {/* Fonts */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@200..800&family=Noto+Sans+Arabic:wght@300..700&display=swap');
          body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-tap-highlight-color: transparent; }
          html[lang="ar"] body { font-family: 'Noto Sans Arabic', sans-serif; }
          .font-serif { font-family: 'Playfair Display', serif; }
        `}</style>
      </div>
      <Watermark show={showWatermark} />
    </WatermarkSpacer>
  );
}
