import { FaArrowTurnUp, FaArrowTurnDown } from 'react-icons/fa6';
import { useEffect, useState } from 'react';

const Scroll = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 100) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

  if (!showButton) {
    return (
      <div className="fixed right-2 bottom-10 p-4 rounded-full bg-primary z-50 cursor-pointer" onClick={scrollToBottom}>
        <FaArrowTurnDown className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="fixed right-2 bottom-10 p-4 rounded-full bg-primary z-50 cursor-pointer" onClick={scrollToTop}>
      <FaArrowTurnUp className="h-4 w-4" />
    </div>
  );
};

export default Scroll;
