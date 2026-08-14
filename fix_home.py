import re

with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("target.includes('women') || target.includes('মহিলা')", "target.includes('women')")
content = content.replace("c.includes('women') || c.includes('girl') || c.includes('মহিলা') || c.includes('মেয়ে') || c.includes('শাড়ি') || c.includes('থ্রি পিস')", "c.includes('women') || c.includes('girl')")
content = content.replace("(target.includes('men') || target.includes('পুরুষ'))", "target.includes('men')")
content = content.replace("(c.includes('men') && !c.includes('women')) || c.includes('boy') || c.includes('পুরুষ') || c.includes('ছেলে') || c.includes('পাঞ্জাবি')", "(c.includes('men') && !c.includes('women')) || c.includes('boy')")
content = content.replace("target.includes('baby') || target.includes('kid') || target.includes('বাচ্চা')", "target.includes('baby') || target.includes('kid')")
content = content.replace("c.includes('baby') || c.includes('kid') || c.includes('বাচ্চা') || c.includes('শিশু') || c.includes('ইনফ্যান্ট')", "c.includes('baby') || c.includes('kid')")
content = content.replace("target.includes('foot') || target.includes('shoe') || target.includes('জুতা')", "target.includes('foot') || target.includes('shoe')")
content = content.replace("c.includes('foot') || c.includes('shoe') || c.includes('sneaker') || c.includes('জুতা') || c.includes('স্যান্ডেল') || c.includes('জুতো')", "c.includes('foot') || c.includes('shoe') || c.includes('sneaker')")

with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
