import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Image from '../image';
import Iconify from '../iconify';

export default function SingleFilePreview({ imgUrl = '' }) {
  // Check if file is a PDF
  const isPdf = imgUrl?.endsWith('.pdf');
  return (
    <Box
      sx={{
        p: 1,
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper',
        borderRadius: 1,
      }}
    >
      {isPdf ? (
        <Iconify icon="mdi:file-pdf-box" width={80} color="red" />
      ) : (
        <Image
          alt="file preview"
          src={imgUrl}
          objectFit="contain"
          sx={{
            width: 1,
            height: 1,
            borderRadius: 1,
          }}
        />
      )}
    </Box>
  );
}

SingleFilePreview.propTypes = {
  imgUrl: PropTypes.string,
};
