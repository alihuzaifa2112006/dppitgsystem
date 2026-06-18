import PropTypes from 'prop-types';
import { m, AnimatePresence } from 'framer-motion';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';

import Iconify from '../iconify';
import { varFade } from '../animate';
import FileThumbnail, { fileData } from '../file-thumbnail';
import React from 'react';

// ----------------------------------------------------------------------

export default function MultiFilePreview({ thumbnail, files, onRemove, sx }) {
  const scrollRef = React.useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        maxWidth: '100%', // Constrain width to the parent container
      }}
    >
      {/* Left Arrow */}
      {files.length > 0 && (
        <IconButton
          size="small"
          onClick={() => handleScroll('left')}
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            bgcolor: (theme) => alpha(theme.palette.grey[900], 0.5),
            color: 'common.white',
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.7),
            },
          }}
        >
          <Iconify icon="mingcute:left-line" width={16} />
        </IconButton>
      )}

      {/* Scrollable Container */}
      <Box
        ref={scrollRef}
        sx={{
          display: 'flex',
          overflowX: 'auto', // Make it scrollable horizontally
          overflowY: 'hidden',
          scrollBehavior: 'smooth',
          maxWidth: '100%',
          px: 2,
          flexWrap: 'nowrap', // Prevent wrapping
          '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar
        }}
      >
        <AnimatePresence initial={false}>
          {files?.map((file) => {
            const { key, name = '', size = 0 } = fileData(file);
            const thumbnailSize = 80;

            return (
              <Stack
                key={key}
                component={m.div}
                {...varFade().inUp}
                alignItems="center"
                justifyContent="center"
                sx={{
                  flexShrink: 0,
                  m: 0.5,
                  width: thumbnailSize,
                  height: thumbnailSize,
                  borderRadius: 1.25,
                  overflow: 'hidden',
                  position: 'relative',
                  border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.16)}`,
                  ...sx,
                }}
              >
                <FileThumbnail
                  tooltip
                  imageView
                  file={file}
                  sx={{ position: 'absolute' }}
                  imgSx={{ position: 'absolute' }}
                />

                {onRemove && (
                  <IconButton
                    size="small"
                    onClick={() => onRemove(file)}
                    sx={{
                      p: 0.5,
                      top: 4,
                      right: 4,
                      position: 'absolute',
                      color: 'common.white',
                      bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                      },
                    }}
                  >
                    <Iconify icon="mingcute:close-line" width={14} />
                  </IconButton>
                )}
              </Stack>
            );
          })}
        </AnimatePresence>
      </Box>

      {/* Right Arrow */}
      {files.length > 0 && (
        <IconButton
          size="small"
          onClick={() => handleScroll('right')}
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            bgcolor: (theme) => alpha(theme.palette.grey[900], 0.5),
            color: 'common.white',
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.7),
            },
          }}
        >
          <Iconify icon="mingcute:right-line" width={16} />
        </IconButton>
      )}
    </Box>
  );
}

MultiFilePreview.propTypes = {
  files: PropTypes.array,
  onRemove: PropTypes.func,
  sx: PropTypes.object,
  thumbnail: PropTypes.bool,
};
