export const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(price);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(date));
};

export const formatOrderId = (id) => {
  if (!id) return '#------';
  return `#${id.toString().slice(-6).toUpperCase()}`;
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/300?text=الشطبي';
  if (imagePath.startsWith('http')) return imagePath;
  const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:10000';
  return `${baseURL}${imagePath}`;
};