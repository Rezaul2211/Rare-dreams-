import re

with open('src/pages/Login.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড প্রদান করুন। (Invalid Password)", "Incorrect password! Please provide the correct password.")
content = content.replace('এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে। পাসওয়ার্ড ভুল হয়েছে, দয়া করে "Sign In" এ গিয়ে সঠিক পাসওয়ার্ড দিয়ে লগইন করুন।', 'Account already exists. Please go to "Sign In" and enter the correct password.')
content = content.replace("ইমেইল বা পাসওয়ার্ড ভুল হয়েছে। দয়া করে পরীক্ষা করে আবার চেষ্টা করুন।", "Incorrect email or password. Please check and try again.")
content = content.replace('এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে। "Sign In" এ গিয়ে পাসওয়ার্ড দিন।', 'Account already exists. Please go to "Sign In" and enter your password.')
content = content.replace('লগইন প্রক্রিয়ায় সমস্যা হয়েছে। অনুগ্রহ করে "Sign In" বা "Create Account" দিয়ে আবার চেষ্টা করুন।', 'Login error. Please try again with "Sign In" or "Create Account".')
content = content.replace("<strong>💡 ইমেইল খুঁজে পাচ্ছেন না?</strong>", "<strong>💡 Can't find the email?</strong>")
content = content.replace("<li>আপনার জিমেইলের <strong>Spam / Junk / Promotions</strong> ফোল্ডার চেক করুন।</li>", "<li>Check your <strong>Spam / Junk / Promotions</strong> folders.</li>")
content = content.replace("<li>অথবা পাসওয়ার্ড ভুলে গিয়ে থাকলে নিচে নতুন পাসওয়ার্ড দিয়ে রিসেট করুন।</li>", "<li>Or reset your password below if you forgot it.</li>")

with open('src/pages/Login.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
