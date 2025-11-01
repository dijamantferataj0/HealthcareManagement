import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary dark:bg-primary-dark text-white py-4 mt-12 transition-colors duration-200">
      <div className="container mx-auto text-center text-sm">
        &copy; {new Date().getFullYear()} Healthcare Appointments. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;


