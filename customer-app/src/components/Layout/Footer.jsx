const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} الشطبي. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
};

export default Footer;