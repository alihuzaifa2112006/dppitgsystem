import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import ReactSignatureCanvas from 'react-signature-canvas';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Iconify from 'src/components/iconify';

export default function QASignDialog({ open, onClose, Ref, onSave, onClear }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ padding: '0px' }}>
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            bgcolor: 'background.neutral',
            p: (theme) => theme.spacing(1.5, 1, 1.5, 2),
          }}
        >
          <Typography variant="h5" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Signature Pad
          </Typography>

          <IconButton onClick={onClose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Grid container>
        <Grid xs={12} md={12}>
          <DialogContent>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(1, 1fr)',
                md: 'repeat(1, 1fr)',
              }}
              padding={3}
            >
              <div style={{ border: '2px solid #A4AFB9', borderRadius: '8px' }}>
                <ReactSignatureCanvas
                  canvasProps={{
                    style: { width: '100%', height: '380px' },
                    className: 'sigCanvas',
                  }}
                  ref={Ref}
                />
              </div>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={onClear} variant="outlined" color="inherit">
              Clear
            </Button>
            <Button onClick={onSave} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Grid>
      </Grid>
    </Dialog>
  );
}

QASignDialog.propTypes = {
  open: PropTypes.any,
  onClose: PropTypes.any,
  onSave: PropTypes.any,
  Ref: PropTypes.any,
  onClear: PropTypes.any,
};
