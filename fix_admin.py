import re

def process_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

replacements_system = [
    ("`পারমিশন সফলভাবে দেওয়া হয়েছে! ${cleanEmail} অ্যাকাউন্টটিতে ${role.toUpperCase()} পারমিশন যোগ করা হলো। ইউজার এখন সাইন-ইন করলে সরাসরি অ্যাডমিন প্যানেল পাবে।`", "`Permission granted successfully! ${role.toUpperCase()} access given to ${cleanEmail}. The user will directly access the admin panel upon login.`"),
    ("সমস্ত এআই এপিআই এবং সিস্টেম ডাটা সফলভাবে সিঙ্ক সম্পন্ন হয়েছে!", "All AI APIs and system data synced successfully!"),
    ("ডাটা সিঙ্ক করার সময় সাময়িক ত্রুটি ঘটেছে।", "Temporary error occurred during data sync."),
    ("তথ্য সিঙ্ক করা হচ্ছে...", "Syncing data..."),
    ("উভয় এআই কি একইসাথে সেট করতে পারবেন। গ্রাহকদের সাথে চ্যাটের জন্য Groq ব্যবহার হয় এবং ছবি দেখে অটো ফিল করার জন্য Gemini Vision ব্যবহার হয়।", "Both AI keys can be set simultaneously. Groq is used for customer chat, and Gemini Vision for image-based auto-fill."),
    ("✅ সমস্ত ছবি হাই-কমপ্রেশন এলগরিদমে জমা হচ্ছে তাই ফ্রী টায়ারেই কয়েক হাজার প্রোডাক্টের ছবি আপলোড করা যাবে।", "✅ All images are saved using high-compression algorithms, allowing thousands of product uploads on the free tier."),
    ("পাস্ট টেস্ট অর্ডার এবং ট্রানজ্যাকশন ডাটা মুছে ফেলার জন্য এই অপশনটি কাজ করে। কাস্টমার এবং প্রোডাক্ট তথ্য ঠিক থাকবে।", "This option deletes past test orders and transaction data. Customer and product data will remain intact.")
]

replacements_settings = [
    (" (গুগল সার্চ ও এসইও সেটিংস)", " (Google Search & SEO Settings)"),
    (" (সার্চ ইঞ্জিন র‍্যাঙ্কিং)", " (Search Engine Ranking)"),
    (" (গুগলে যেভাবে শো করবে)", " (Google Search Preview)"),
    (" (সাইটের মূল শিরোনাম)", " (Main Site Title)"),
    (" (মূল ডোমেইন)", " (Main Domain)"),
    (" (গুগল ভেরিফিকেশন কোড)", " (Google Verification Code)"),
    ("Google Search Console থেকে পাওয়া HTML tag-এর content কোড", "Content code from HTML tag provided by Google Search Console"),
    (" (সার্চ রেজাল্ট ডেসক্রিপশন)", " (Search Result Description)"),
    (" (বাংলা ও ইংরেজি কি-ওয়ার্ড)", " (Target Keywords)"),
    ("Rare Dreams, বাচ্চাদের ড্রেস, ছেলেদের পাঞ্জাবি, লেহেঙ্গা, baby clothes Bangladesh, footwear Dhaka, online shopping BD, cash on delivery", "Rare Dreams, baby clothes Bangladesh, boys punjabi, girls dress, footwear Dhaka, online shopping BD, cash on delivery"),
    (" (গুগল বট ইন্ডেক্সিং লিংক)", " (Google Bot Indexing Links)")
]

replacements_product_form = [
    ("title: `🔥 মূল্য হ্রাস! ${payload.name}`,", "title: `🔥 Price Drop! ${payload.name}`,"),
    ("message: `আপনার পছন্দের \"${payload.name}\" এর দাম ৳${initialProductPrice} থেকে কমে এখন মাত্র ৳${newPriceNum} (-${dropPercentage}% ছাড়)! স্টক শেষ হওয়ার আগেই অর্ডার করুন।`,", "message: `The price of \"${payload.name}\" has dropped from ৳${initialProductPrice} to just ৳${newPriceNum} (-${dropPercentage}% off)! Order before stock runs out.`,",),
    ("placeholder=\"e.g. ছেলেদের প্রিমিয়াম কটন কাপ্তান সেট\"", "placeholder=\"e.g. Premium Cotton Kaftan Set for Boys\""),
    (" (প্রোডাক্ট এর ছবিসমূহ)", ""),
    ("মেইন ছবি সহ আরো ৩-৫টি ছবি আপলোড করুন। প্রথম ছবিটি কভার/মেইন ছবি হিসেবে দেখাবে।", "Upload 3-5 images including the main image. The first one will be used as the cover/main image."),
    ("টি ছবি যুক্ত হয়েছে", " images added"),
    ("ডিভাইস থেকে একাধিক ছবি একসাথে সিলেক্ট করুন", "Select multiple images from your device"),
    ("অথবা ওয়েব ইউআরএল (Image URL) দিন:", "Or provide a Web URL (Image URL):"),
    (" (প্রোডাক্ট ভিডিও)", ""),
    ("ইউটিউব (YouTube Link / Shorts), ফেসবুক ভিডিও লিঙ্ক অথবা সরাসরি ভিডিও ফাইল আপলোড করুন।", "Upload a YouTube Link, Facebook Video Link, or upload a video file directly.")
]

process_file('src/pages/admin/AdminSystem.tsx', replacements_system)
process_file('src/pages/admin/AdminSettings.tsx', replacements_settings)
process_file('src/pages/admin/ProductForm.tsx', replacements_product_form)

