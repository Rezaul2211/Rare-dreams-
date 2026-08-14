import re

with open('src/components/ProductReviews.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace setShowForm(!showForm)
old_btn1 = """        <button
          onClick={() => {
            setShowForm(!showForm);
            setVerificationError(null);
          }}"""

new_btn1 = """        <button
          onClick={() => {
            if (!user) {
              alert('Please log in first to write a review.');
              return;
            }
            setShowForm(!showForm);
            setVerificationError(null);
          }}"""

content = content.replace(old_btn1, new_btn1)

# Replace setShowForm(true)
old_btn2 = """          <button
            onClick={() => setShowForm(true)}
            className="mt-4 inline-flex items-center space-x-2 bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
          >"""

new_btn2 = """          <button
            onClick={() => {
              if (!user) {
                alert('Please log in first to write a review.');
                return;
              }
              setShowForm(true);
            }}
            className="mt-4 inline-flex items-center space-x-2 bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
          >"""

content = content.replace(old_btn2, new_btn2)

with open('src/components/ProductReviews.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
