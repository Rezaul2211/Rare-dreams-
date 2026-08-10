import fs from 'fs';
let code = fs.readFileSync('src/pages/admin/AdminLayout.tsx', 'utf-8');

code = code.replace(
  "  const navItems = [\n    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },\n    { name: 'Products', path: '/admin/products', icon: Package },\n    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },\n    { name: 'Customers', path: '/admin/customers', icon: Users },\n    { name: 'Banners & Styling', path: '/admin/settings', icon: Image },\n    { name: 'System Setup', path: '/admin/system', icon: Settings },\n  ];",
  "  const navItems = [\n    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },\n    { name: 'Add Product', path: '/admin/products/new', icon: Package },\n    { name: 'Order History', path: '/admin/orders', icon: ShoppingCart },\n    { name: 'Products List', path: '/admin/products', icon: Package },\n    { name: 'Customers', path: '/admin/customers', icon: Users },\n    { name: 'Banners & Styling', path: '/admin/settings', icon: Image },\n    { name: 'System Setup', path: '/admin/system', icon: Settings },\n  ];"
);

fs.writeFileSync('src/pages/admin/AdminLayout.tsx', code);
console.log("AdminLayout Patch Success");
