import React, { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Box } from '@mui/system';

const CustomLoader = () => {
  const [textIndex, setTextIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const loadingTexts = [
    'Taking your measurements...',
    'Crafting your perfect fit...',
    // "Styling your wardrobe...",
    // "Tailoring magic in progress...",
    'Just a few final touches...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // Start fade-out
      setTimeout(() => {
        setTextIndex((prevIndex) => (prevIndex + 1) % loadingTexts.length);
        setFade(true); // Start fade-in
      }, 800); // Sync with CSS transition duration
    }, 4300); // Change text every 4.3 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          padding: { xs: '80px', sm: '100px', md: '140px' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'radial-gradient(circle, rgb(255, 255, 255) 35%, rgba(255,255,255,0) 70%)',
          borderRadius: '10px',
          width: '650px',
          height: 'auto',
        }}
      >
        <DotLottieReact
          src="/animation.json"
          loop
          autoplay
          renderer="svg"
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid slice',
          }}
        />
        <p
          style={{
            fontFamily: 'inherit',
            marginTop: '0px',
            fontSize: '12px',

            opacity: fade ? 1 : 0,
            color: 'black',
            transition: 'opacity 0.8s ease-in-out', // Smooth fade effect
          }}
        >
          {loadingTexts[textIndex]}
        </p>
      </Box>
    </Box>
  );
};

export default CustomLoader;
