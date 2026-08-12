import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'bn' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
}

export const translations: Record<Language, Record<string, string>> = {
  bn: {
    // Header & Nav
    'nav.home': 'হোম',
    'nav.shop_all': 'সব পোশাক',
    'nav.cart': 'কার্ট',
    'nav.account': 'অ্যাকাউন্ট',
    'nav.admin': 'এডমিন প্যানেল',
    'nav.login': 'লগইন',
    'nav.logout': 'লগআউট',
    'nav.search_placeholder': 'পোশাক, সাইজ বা ক্যাটাগরি খুঁজুন...',
    'nav.search_results': 'অনুসন্ধানের ফলাফল',
    'nav.no_results': 'কোন পোশাক পাওয়া যায়নি',
    'nav.view_all_results': 'সব ফলাফল দেখুন',
    'nav.wishlist': 'উইশলিস্ট',

    // Home Page
    'home.hero_tagline': 'বাচ্চাদের ও পরিবারের প্রিমিয়াম রয়েল কালেকশন',
    'home.hero_title': 'রাজকীয় সাজে সাজুক আপনার সোনামণি',
    'home.hero_subtitle': '১-১৪ বছরের বাচ্চাদের পার্টি ড্রেস, পাঞ্জাবি, জুতো এবং এক্সক্লুসিভ কালেকশন',
    'home.shop_now': 'এখনই শপ করুন',
    'home.explore_categories': 'ক্যাটাগরি সমূহ',
    'home.view_all': 'সবগুলো দেখুন',
    'home.featured_products': 'স্পেশাল কালেকশন',
    'home.new_arrivals': 'নতুন কালেকশন',
    'home.best_sellers': 'জনপ্রিয় পোশাক',
    'home.flash_sale': 'ধামাকা অফার / ফ্ল্যাশ সেল',
    'home.why_choose_us': 'কেন রেয়ার ড্রিমস থেকে কেনাকাটা করবেন?',
    'home.free_shipping_title': 'ফ্রি ডেলিভারি অফার',
    'home.free_shipping_desc': '২০০০ টাকার বেশি অর্ডারে পুরো বাংলাদেশে ফ্রি ডেলিভারি',
    'home.easy_return_title': '৭ দিনের সহজ পরিবর্তন',
    'home.easy_return_desc': 'পছন্দ না হলে বা সাইজ না মিললে সহজে রিপ্লেসমেন্ট গ্যারান্টি',
    'home.cash_on_delivery_title': 'ক্যাশ অন ডেলিভারি',
    'home.cash_on_delivery_desc': 'পণ্য হাতে পেয়ে দেখে টাকা পরিশোধের সুযোগ',
    'home.premium_quality_title': '১০০% প্রিমিয়াম কোয়ালিটি',
    'home.premium_quality_desc': 'বাচ্চাদের জন্য আরামদায়ক ও স্কিন ফ্রেন্ডলি প্রিমিয়াম ফেব্রিক',

    // Categories translation map
    'cat.foot_wear': 'জুতো ও স্যান্ডেল',
    'cat.mens_items': 'মেনস কালেকশন',
    'cat.baby_items': 'বেবি কালেকশন',
    'cat.womens_items': 'উইমেনস কালেকশন',
    'cat.kids': 'কিশোর কালেকশন',

    // Product Card & Actions
    'product.add_to_cart': 'কার্টে যোগ করুন',
    'product.buy_now': 'সরাসরি অর্ডার করুন',
    'product.order_now': 'সরাসরি অর্ডার করুন',
    'product.out_of_stock': 'স্টক শেষ',
    'product.quick_view': 'এক নজর দেখুন',
    'product.discount': 'ছাড়',
    'product.bdt': '৳',
    'product.price': 'মূল্য',
    'product.size': 'সাইজ',
    'product.color': 'কালার',
    'product.select_size': 'সাইজ সিলেক্ট করুন',
    'product.select_color': 'কালার সিলেক্ট করুন',
    'product.description': 'পণ্যের বিবরণ',
    'product.size_guide': 'সাইজ গাইড',
    'product.ai_size_recommender': 'এআই সাইজ সাজেস্টর',
    'product.ai_size_btn': 'বাচ্চার বয়স ও ওজন অনুযায়ী সঠিক সাইজ জানুন',
    'product.guarantee_title': 'আমাদের বিশেষ প্রতিশ্রুতি:',
    'product.delivery_info': 'ঢাকার ভেতরে ১-২ দিন (৳৬০) | ঢাকার বাইরে ২-৪ দিন (৳১২০)',

    // Shop / Filter
    'shop.title': 'সকল পোশাক ও কালেকশন',
    'shop.filter_by_category': 'ক্যাটাগরি ফিল্টার',
    'shop.all_categories': 'সব ক্যাটাগরি',
    'shop.price_range': 'মূল্যের সীমা',
    'shop.sort_by': 'সাজান',
    'shop.sort_newest': 'নতুন আগমন',
    'shop.sort_price_low': 'দাম: কম থেকে বেশি',
    'shop.sort_price_high': 'দাম: বেশি থেকে কম',
    'shop.clear_filters': 'ফিল্টার রিমুভ করুন',
    'shop.showing_products': 'টি পোশাক দেখানো হচ্ছে',

    // Cart Page
    'cart.title': 'আপনার শপিং কার্ট',
    'cart.empty_title': 'আপনার কার্টটি একদম খালি!',
    'cart.empty_subtitle': 'পছন্দের পোশাকগুলো বেছে নিতে শপ পেজে যান',
    'cart.continue_shopping': 'কেনাকাটা চালু রাখুন',
    'cart.item_total': 'পণ্য সমূহের মোট দাম',
    'cart.shipping_charge': 'ডেলিভারি চার্জ',
    'cart.grand_total': 'সর্বমোট মূল্য',
    'cart.proceed_to_checkout': 'অর্ডার সাবমিট করুন (চেকআউট)',
    'cart.free_shipping_unlocked': 'অভিনন্দন! আপনি ফ্রি ডেলিভারি পাচ্ছেন! 🎉',
    'cart.free_shipping_needed': 'ফ্রি ডেলিভারি পেতে আরও ৳{amount} টাকার কেনাকাটা করুন',
    'cart.remove_item': 'মুছে ফেলুন',

    // Checkout Page
    'checkout.title': 'অর্ডার ডেলিভারি ইনফরমেশন',
    'checkout.customer_info': '১. আপনার নাম ও মোবাইল নম্বর',
    'checkout.full_name': 'আপনার পুরো নাম',
    'checkout.phone_number': '১১ ডিজিটের মোবাইল নম্বর',
    'checkout.shipping_address': '২. ডেলিভারি ঠিকানা',
    'checkout.full_address': 'বাসা নম্বর, রোড, এলাকা/গ্রামের নাম',
    'checkout.district': 'জেলা সিলেক্ট করুন',
    'checkout.upazila': 'উপজেলা / এলাকা',
    'checkout.payment_method': '৩. পেমেন্ট পদ্ধতি সিলেক্ট করুন',
    'checkout.cod': 'ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে টাকা দিন)',
    'checkout.bkash': 'বিকাশ (bKash)',
    'checkout.nagad': 'নগদ (Nagad)',
    'checkout.trx_id': 'ট্রানজেকশন আইডি (TrxID)',
    'checkout.sender_number': 'যে নম্বর থেকে টাকা পাঠিয়েছেন',
    'checkout.order_summary': 'অর্ডারের বিবরণ',
    'checkout.place_order': 'অর্ডার কনফার্ম করুন',
    'checkout.submitting': 'অর্ডার প্রসেস হচ্ছে...',
    'checkout.delivery_inside_dhaka': 'ঢাকা সিটির ভেতরে (৳৬০)',
    'checkout.delivery_outside_dhaka': 'ঢাকার বাইরে (৳১২০)',
    'checkout.free_delivery_label': 'ফ্রি ডেলিভারি (৳০)',

    // Order Success
    'order_success.title': 'আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে! 🎉',
    'order_success.subtitle': 'আমাদের প্রতিনিধি খুব শীঘ্রই কল দিয়ে আপনার অর্ডারটি কনফার্ম করবেন।',
    'order_success.order_id': 'অর্ডার আইডি:',
    'order_success.total_paid': 'মোট পরিশোধযোগ্য:',
    'order_success.estimated_delivery': 'সম্ভাব্য ডেলিভারি সময়: ১-৩ কার্যদিবস',
    'order_success.support_message': 'যেকোনো প্রয়োজনে আমাদের সাথে যোগাযোগ করুন:',
    'order_success.back_to_home': 'হোম পেজে ফিরে যান',

    // Footer & Policies
    'footer.company_desc': 'রেয়ার ড্রিমস (Rare Dreams) - ১-১৪ বছরের শিশুদের ও পরিবারের এক্সক্লুসিভ রয়্যাল পোশাকের বিশ্বস্ত প্রতিষ্ঠান।',
    'footer.quick_links': 'দ্রুত লিংক',
    'footer.customer_service': 'গ্রাহক সেবা',
    'footer.contact_us': 'যোগাযোগ ও শোরুম',
    'footer.policies': 'পলিসি সমূহ',
    'footer.privacy_policy': 'প্রাইভেসি পলিসি',
    'footer.terms_conditions': 'টার্মস ও কন্ডিশনস',
    'footer.return_policy': 'রিটার্ন ও রিপ্লেসমেন্ট পলিসি',
    'footer.showroom_address': 'লেভেল ৪, ব্লক বি, যমুনা ফিউচার পার্ক, ঢাকা',
    'footer.trade_license': 'ট্রেড লাইসেন্স নং:',
    'footer.tin': 'টিআইএন (TIN):',
    'footer.all_rights_reserved': 'সর্বস্বত্ব সংরক্ষিত © ২০২৬ রেয়ার ড্রিমস',

    // Support Chat Widget
    'chat.title': 'রেয়ার ড্রিমস এআই এসিস্ট্যান্ট',
    'chat.online_status': 'অনলাইন | তাৎক্ষণিক সাপোর্ট',
    'chat.welcome_msg': 'হ্যালো! রেয়ার ড্রিমস-এ আপনাকে স্বাগতম! 🌸 সাইজ, দাম বা অর্ডার সংক্রান্ত যেকোনো প্রশ্ন করুন।',
    'chat.input_placeholder': 'আপনার প্রশ্নটি লিখুন...',
    'chat.send': 'পাঠান',
    'chat.quick_q1': 'ডেলিভারি চার্জ কত?',
    'chat.quick_q2': '৭ দিনের রিটার্ন পলিসি',
    'chat.quick_q3': 'শোরুমের ঠিকানা',

    // Common / UI
    'common.loading': 'লোড হচ্ছে...',
    'common.save': 'সংরক্ষণ করুন',
    'common.cancel': 'বাতিল',
    'common.edit': 'এডিট',
    'common.delete': 'মুছুন',
    'common.close': 'বন্ধ করুন',
    'common.lang_toggle': 'English',
  },
  en: {
    // Header & Nav
    'nav.home': 'Home',
    'nav.shop_all': 'Shop All',
    'nav.cart': 'Cart',
    'nav.account': 'Account',
    'nav.admin': 'Admin Panel',
    'nav.login': 'Sign In',
    'nav.logout': 'Sign Out',
    'nav.search_placeholder': 'Search dresses, sizes or categories...',
    'nav.search_results': 'Search Results',
    'nav.no_results': 'No dresses found',
    'nav.view_all_results': 'View all results',
    'nav.wishlist': 'Wishlist',

    // Home Page
    'home.hero_tagline': 'Premium Royal Kids & Family Collection',
    'home.hero_title': 'Dress Your Little Angels in Royal Elegance',
    'home.hero_subtitle': 'Exclusive party wear, Panjabi, shoes and accessories for kids aged 1-14',
    'home.shop_now': 'Shop Now',
    'home.explore_categories': 'Explore Categories',
    'home.view_all': 'View All',
    'home.featured_products': 'Featured Collection',
    'home.new_arrivals': 'New Arrivals',
    'home.best_sellers': 'Best Sellers',
    'home.flash_sale': 'Flash Sale Deals',
    'home.why_choose_us': 'Why Shop With Rare Dreams?',
    'home.free_shipping_title': 'Free Shipping Offer',
    'home.free_shipping_desc': 'Free delivery all over Bangladesh on orders over ৳2000',
    'home.easy_return_title': '7 Days Easy Exchange',
    'home.easy_return_desc': 'Hassle-free replacement if size does not match or you change your mind',
    'home.cash_on_delivery_title': 'Cash on Delivery',
    'home.cash_on_delivery_desc': 'Check your package upon delivery before paying',
    'home.premium_quality_title': '100% Premium Quality',
    'home.premium_quality_desc': 'Skin-friendly, comfortable luxury fabrics designed for children',

    // Categories translation map
    'cat.foot_wear': 'Foot wear',
    'cat.mens_items': "Men's items",
    'cat.baby_items': 'Baby items',
    'cat.womens_items': "Women's items",
    'cat.kids': 'Kids Collection',

    // Product Card & Actions
    'product.add_to_cart': 'Add to Cart',
    'product.buy_now': 'Buy Now',
    'product.order_now': 'Order Now',
    'product.out_of_stock': 'Out of Stock',
    'product.quick_view': 'Quick View',
    'product.discount': 'OFF',
    'product.bdt': '৳',
    'product.price': 'Price',
    'product.size': 'Size',
    'product.color': 'Color',
    'product.select_size': 'Select Size',
    'product.select_color': 'Select Color',
    'product.description': 'Product Description',
    'product.size_guide': 'Size Guide',
    'product.ai_size_recommender': 'AI Size Recommender',
    'product.ai_size_btn': 'Find perfect size by child age & weight',
    'product.guarantee_title': 'Our Quality Guarantee:',
    'product.delivery_info': 'Inside Dhaka 1-2 days (৳60) | Outside Dhaka 2-4 days (৳120)',

    // Shop / Filter
    'shop.title': 'All Dresses & Collections',
    'shop.filter_by_category': 'Filter by Category',
    'shop.all_categories': 'All Categories',
    'shop.price_range': 'Price Range',
    'shop.sort_by': 'Sort By',
    'shop.sort_newest': 'Newest First',
    'shop.sort_price_low': 'Price: Low to High',
    'shop.sort_price_high': 'Price: High to Low',
    'shop.clear_filters': 'Clear Filters',
    'shop.showing_products': 'products shown',

    // Cart Page
    'cart.title': 'Your Shopping Cart',
    'cart.empty_title': 'Your cart is empty!',
    'cart.empty_subtitle': 'Explore our store to pick your favorite dresses',
    'cart.continue_shopping': 'Continue Shopping',
    'cart.item_total': 'Items Total',
    'cart.shipping_charge': 'Shipping Fee',
    'cart.grand_total': 'Grand Total',
    'cart.proceed_to_checkout': 'Proceed to Checkout',
    'cart.free_shipping_unlocked': 'Congratulations! You unlocked Free Shipping! 🎉',
    'cart.free_shipping_needed': 'Add ৳{amount} more to get Free Shipping',
    'cart.remove_item': 'Remove',

    // Checkout Page
    'checkout.title': 'Checkout Delivery Details',
    'checkout.customer_info': '1. Customer Name & Phone',
    'checkout.full_name': 'Full Name',
    'checkout.phone_number': '11-Digit Mobile Number',
    'checkout.shipping_address': '2. Delivery Address',
    'checkout.full_address': 'House No, Road, Village/Area Name',
    'checkout.district': 'Select District',
    'checkout.upazila': 'Upazila / Area',
    'checkout.payment_method': '3. Select Payment Method',
    'checkout.cod': 'Cash on Delivery (Pay after receiving)',
    'checkout.bkash': 'bKash',
    'checkout.nagad': 'Nagad',
    'checkout.trx_id': 'Transaction ID (TrxID)',
    'checkout.sender_number': 'Sender bKash/Nagad Number',
    'checkout.order_summary': 'Order Summary',
    'checkout.place_order': 'Confirm Order',
    'checkout.submitting': 'Processing Order...',
    'checkout.delivery_inside_dhaka': 'Inside Dhaka City (৳60)',
    'checkout.delivery_outside_dhaka': 'Outside Dhaka (৳120)',
    'checkout.free_delivery_label': 'Free Shipping (৳0)',

    // Order Success
    'order_success.title': 'Your Order Has Been Placed! 🎉',
    'order_success.subtitle': 'Our representative will call you shortly to confirm your order.',
    'order_success.order_id': 'Order ID:',
    'order_success.total_paid': 'Total Payable:',
    'order_success.estimated_delivery': 'Estimated Delivery: 1-3 Business Days',
    'order_success.support_message': 'If you need any assistance, reach out to us:',
    'order_success.back_to_home': 'Return to Home',

    // Footer & Policies
    'footer.company_desc': 'Rare Dreams - Your trusted brand for exclusive royal children & family clothing in Bangladesh.',
    'footer.quick_links': 'Quick Links',
    'footer.customer_service': 'Customer Service',
    'footer.contact_us': 'Contact & Showroom',
    'footer.policies': 'Store Policies',
    'footer.privacy_policy': 'Privacy Policy',
    'footer.terms_conditions': 'Terms & Conditions',
    'footer.return_policy': 'Return & Replacement Policy',
    'footer.showroom_address': 'Level 4, Block B, Jamuna Future Park, Dhaka',
    'footer.trade_license': 'Trade License No:',
    'footer.tin': 'TIN:',
    'footer.all_rights_reserved': 'All Rights Reserved © 2026 Rare Dreams',

    // Support Chat Widget
    'chat.title': 'Rare Dreams AI Assistant',
    'chat.online_status': 'Online | Instant Support',
    'chat.welcome_msg': 'Hello! Welcome to Rare Dreams! 🌸 Ask any question about size, price, or ordering.',
    'chat.input_placeholder': 'Type your question...',
    'chat.send': 'Send',
    'chat.quick_q1': 'What is delivery charge?',
    'chat.quick_q2': '7 Days Return Policy',
    'chat.quick_q3': 'Showroom Location',

    // Common / UI
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.close': 'Close',
    'common.lang_toggle': 'বাংলা',
  }
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'bn', // Defaulting to Bengali (বাংলা) as requested by user
      setLanguage: (lang: Language) => set({ language: lang }),
      toggleLanguage: () => set((state) => ({ language: state.language === 'bn' ? 'en' : 'bn' })),
      t: (key: string, defaultText?: string) => {
        const lang = get().language;
        const dict = translations[lang] || translations.bn;
        return dict[key] || defaultText || translations.en[key] || key;
      }
    }),
    {
      name: 'raredreams-language-storage'
    }
  )
);

// Helper to convert category titles smoothly according to active language
export function translateCategory(title: string, language: Language): string {
  if (language === 'en') return title;
  const lower = title.toLowerCase().trim();
  if (lower.includes('foot') || lower.includes('shoe') || lower.includes('জুতো')) return 'জুতো ও স্যান্ডেল';
  if (lower.includes('men') || lower.includes('ছেলে') || lower.includes('পাঞ্জাবি')) return 'মেনস কালেকশন';
  if (lower.includes('baby') || lower.includes('বাচ্চা') || lower.includes('শিশুর')) return 'বেবি কালেকশন';
  if (lower.includes('women') || lower.includes('মেয়ে') || lower.includes('নারী')) return 'উইমেনস কালেকশন';
  if (lower.includes('kid')) return 'কিশোর কালেকশন';
  return title;
}
