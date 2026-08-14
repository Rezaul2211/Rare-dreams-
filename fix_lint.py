import re

with open('src/components/ProductReviews.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

use_effect_to_remove = """  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      if (user.displayName && !userName) setUserName(user.displayName);
      if (user.phoneNumber && !userPhone) setUserPhone(user.phoneNumber);
      if (user.email && !userEmail) setUserEmail(user.email);
    }
  }, [user]);"""

content = content.replace(use_effect_to_remove, "")
content = content.replace("setOrderId('');\n", "")

with open('src/components/ProductReviews.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
