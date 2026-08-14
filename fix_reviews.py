import re

with open('src/components/ProductReviews.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove states
content = re.sub(r"const \[userName, setUserName\] = useState\(''\);\n", "", content)
content = re.sub(r"const \[userPhone, setUserPhone\] = useState\(''\);\n", "", content)
content = re.sub(r"const \[userEmail, setUserEmail\] = useState\(''\);\n", "", content)
content = re.sub(r"const \[orderId, setOrderId\] = useState\(''\);\n", "", content)

# 2. Modify checkVerifiedCustomer
old_check_verified = """  const checkVerifiedCustomer = async (): Promise<boolean> => {
    try {
      // Store Admin is always allowed
      if (user?.email === 'xmrezaul.karim998@gmail.com' || user?.role === 'admin') return true;

      const cleanPhone = userPhone.trim().replace(/\D/g, '');
      const cleanEmail = userEmail.trim().toLowerCase();
      const cleanOrder = orderId.trim().toUpperCase();

      const ordersRef = collection(db, 'orders');
      const snap = await getDocs(ordersRef);

      let found = false;
      snap.forEach((docSnap) => {
        const o = docSnap.data();
        const oPhone = (o.phone || '').replace(/\D/g, '');
        const oEmail = (o.email || '').toLowerCase();
        const oId = docSnap.id.toUpperCase();
        const oUserId = o.userId;

        // Check if customer matches this order
        const isCustomerMatch = 
          (user?.uid && oUserId === user.uid) ||
          (cleanOrder && cleanOrder.length >= 3 && oId.includes(cleanOrder)) ||
          (cleanPhone && cleanPhone.length >= 8 && oPhone.includes(cleanPhone)) ||
          (cleanEmail && oEmail && oEmail === cleanEmail);

        if (isCustomerMatch) {
          // Check if this order contains the item
          const orderProducts = o.products || o.items || [];
          const containsItem = orderProducts.some((item: any) => 
            item.id === productId || 
            item.productId === productId ||
            (item.name && item.name.toLowerCase().includes(productName.toLowerCase()))
          );

          if (containsItem) {
            found = true;
          }
        }
      });
      return found;
    } catch (err) {
      console.warn("Verified buyer check failed:", err);
      return false;
    }
  };"""

new_check_verified = """  const checkVerifiedCustomer = async (): Promise<boolean> => {
    try {
      if (!user) return false;
      // Store Admin is always allowed
      if (user?.email === 'xmrezaul.karim998@gmail.com' || user?.role === 'admin') return true;

      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('userId', '==', user.uid));
      const snap = await getDocs(q);

      let found = false;
      snap.forEach((docSnap) => {
        const o = docSnap.data();
        const orderProducts = o.products || o.items || [];
        const containsItem = orderProducts.some((item: any) => 
          item.id === productId || 
          item.productId === productId ||
          (item.name && item.name.toLowerCase().includes(productName.toLowerCase()))
        );
        if (containsItem) found = true;
      });
      
      // Fallback: Check if they bought as guest with same email
      if (!found && user.email) {
        const snap2 = await getDocs(collection(db, 'orders'));
        snap2.forEach((docSnap) => {
           const o = docSnap.data();
           if (o.email && o.email.toLowerCase() === user.email.toLowerCase()) {
              const orderProducts = o.products || o.items || [];
              const containsItem = orderProducts.some((item: any) => 
                item.id === productId || 
                item.productId === productId ||
                (item.name && item.name.toLowerCase().includes(productName.toLowerCase()))
              );
              if (containsItem) found = true;
           }
        });
      }

      return found;
    } catch (err) {
      console.warn("Verified buyer check failed:", err);
      return false;
    }
  };"""

content = content.replace(old_check_verified, new_check_verified)

# 3. Modify handleSubmitReview
old_handle_submit = """  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);

    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!comment.trim()) {
      alert('Please enter your comment');
      return;
    }

    setSubmitting(true);
    try {
      const isVerified = await checkVerifiedCustomer();

      if (!isVerified) {
        const msg = 'Sorry! Only verified customers who purchased this product can leave a review. Please enter the phone number or Order ID used during purchase.';
        setVerificationError(msg);
        setSubmitting(false);
        return;
      }

      const newReviewData = {
        productId,
        userId: user?.uid || null,
        userName: userName.trim(),
        userPhone: userPhone.trim() ? `${userPhone.slice(0, 3)}****${userPhone.slice(-4)}` : '',
        userEmail: userEmail.trim(),
        rating,
        comment: comment.trim(),
        images: reviewImage ? [reviewImage] : [],
        isVerifiedPurchase: true,
        helpfulCount: 0,
        createdAt: new Date().toISOString()
      };"""

new_handle_submit = """  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);

    if (!user) {
      alert('Please log in to submit a review.');
      return;
    }

    if (!comment.trim()) {
      alert('Please enter your comment');
      return;
    }

    setSubmitting(true);
    try {
      const isVerified = await checkVerifiedCustomer();

      if (!isVerified) {
        const msg = 'Sorry! Only verified customers who purchased this product can leave a review.';
        setVerificationError(msg);
        setSubmitting(false);
        return;
      }

      const newReviewData = {
        productId,
        userId: user.uid,
        userName: user.displayName || user.email.split('@')[0] || 'Verified Customer',
        userPhone: user.phoneNumber || '',
        userEmail: user.email || '',
        rating,
        comment: comment.trim(),
        images: reviewImage ? [reviewImage] : [],
        isVerifiedPurchase: true,
        helpfulCount: 0,
        createdAt: new Date().toISOString()
      };"""

content = content.replace(old_handle_submit, new_handle_submit)

# 4. Remove inputs grid
inputs_grid_regex = r"\{/\* Inputs Grid \*/\}(.*?)\{/\* Comment Textarea \*/\}"
content = re.sub(inputs_grid_regex, "{/* Comment Textarea */}", content, flags=re.DOTALL)

with open('src/components/ProductReviews.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
