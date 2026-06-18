import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import Iconify from '../iconify';

// ----------------------------------------------------------------------

export default function UploadBox({ placeholder, error, disabled, files, sx, ...other }) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    disabled,
    ...other,
  });

  const hasError = isDragReject || error;

  const renderPreview = () => {
    const file = Array.isArray(files) ? files[0] : files;
    if (!file) return null;

    const isStringUrl = typeof file === 'string';
    const fileObj = isStringUrl ? null : file;

    const isImage =
      fileObj?.type?.startsWith('image/') ||
      (isStringUrl && file.toLowerCase().match(/\.(jpg|jpeg|png)$/));

    const isPdf =
      fileObj?.type === 'application/pdf' || (isStringUrl && file.toLowerCase().endsWith('.pdf'));

    if (isImage) {
      return (
        <Box
          component="img"
          src={isStringUrl ? file : file.preview || URL.createObjectURL(fileObj)}
          alt="preview"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 1,
          }}
        />
      );
    }

    if (isPdf) {
      return <Iconify icon="mdi:file-pdf-box" width={32} color="error.main" />;
    }

    return (
      <Typography variant="caption" noWrap sx={{ px: 0.5 }}>
        {fileObj?.name || file}
      </Typography>
    );
  };

  return (
    <Box
      {...getRootProps()}
      sx={{
        m: 0.5,
        width: 82,
        height: 54,
        flexShrink: 0,
        display: 'flex',
        borderRadius: 1,
        cursor: 'pointer',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
        border: (theme) => `dashed 1px ${alpha(theme.palette.primary.main, 0.16)}`,
        overflow: 'hidden',
        position: 'relative',
        ...(isDragActive && {
          opacity: 0.72,
        }),
        ...(disabled && {
          opacity: 0.48,
          pointerEvents: 'none',
        }),
        ...(hasError && {
          color: 'error.main',
          borderColor: 'error.main',
          bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
        }),
        '&:hover': {
          opacity: 0.72,
        },
        ...sx,
      }}
    >
      <input {...getInputProps()} />
      {files
        ? renderPreview()
        : placeholder || <Iconify icon="eva:cloud-upload-fill" width={28} color="primary.main" />}
    </Box>
  );
}

UploadBox.propTypes = {
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  files: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  placeholder: PropTypes.object,
  sx: PropTypes.object,
};
