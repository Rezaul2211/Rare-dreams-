import re

with open('src/pages/Checkout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace shipping methods
content = content.replace("labelBn: 'ঢাকা সিটির ভেতরে'", "labelBn: 'Inside Dhaka City'")
content = content.replace("subLabelBn: 'হোম ডেলিভারি (১-২ দিন)'", "subLabelBn: 'Home Delivery (1-2 Days)'")
content = content.replace("labelBn: 'ঢাকা সিটির বাহিরে / সাব-ঢাকা'", "labelBn: 'Sub-Dhaka Area'")
content = content.replace("subLabelBn: 'সাভার, গাজীপুর, কেরানীগঞ্জ, ইত্যাদি (২-৩ দিন)'", "subLabelBn: 'Savar, Gazipur, Keraniganj, etc. (2-3 Days)'")
content = content.replace("labelBn: 'ঢাকা জেলার বাহিরে / সারা বাংলাদেশ'", "labelBn: 'Outside Dhaka / Nationwide'")
content = content.replace("subLabelBn: 'কুরিয়ার হোম ডেলিভারি (২-৪ দিন)'", "subLabelBn: 'Courier Delivery (2-4 Days)'")

# Replace payment methods texts
content = content.replace("formData.paymentMethod === 'bKash' ? 'bK' : 'নগদ'", "formData.paymentMethod === 'bKash' ? 'bK' : 'Nagad'")
content = content.replace("১. আপনার {formData.paymentMethod === 'bKash' ? 'বিকাশ' : 'নগদ'} অ্যাপ খুলে উপরের নম্বরে", "1. Open your {formData.paymentMethod === 'bKash' ? 'bKash' : 'Nagad'} app and")
content = content.replace("২. টাকা পাঠানোর পর নিচের ঘরে আপনার নম্বর ও TrxID লিখে সাবমিট করুন।", "2. Enter your account number and TrxID below after sending.")
content = content.replace("আপনার {formData.paymentMethod === 'bKash' ? 'বিকাশ' : 'নগদ'} মোবাইল নম্বর *", "Your {formData.paymentMethod === 'bKash' ? 'bKash' : 'Nagad'} Number *")

# bkash and nagad labels
content = content.replace("bKash (বিকাশ)", "bKash")
content = content.replace("Nagad (নগদ)", "Nagad")

# Other ternaries - language === 'bn' ? ...
content = re.sub(r"language === 'bn'\s*\?\s*'[^']*'\s*:\s*('[^']*')", r"\1", content)
content = re.sub(r"language === 'bn'\s*\?\s*`[^`]*`\s*:\s*(`[^`]*`)", r"\1", content)

with open('src/pages/Checkout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
