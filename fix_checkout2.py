import re
with open('src/pages/Checkout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("language === 'bn' ? opt.labelBn : opt.labelEn", "opt.labelEn")
content = content.replace("language === 'bn' ? opt.subLabelBn : opt.subLabelEn", "opt.subLabelEn")
content = content.replace("language === 'bn' ? selectedDeliveryOption.labelBn : selectedDeliveryOption.labelEn", "selectedDeliveryOption.labelEn")

with open('src/pages/Checkout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
