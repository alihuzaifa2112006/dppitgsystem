import React, { useState } from 'react';
import { Box, Paper, TextField, InputAdornment, Button, Stack } from '@mui/material';
import Iconify from 'src/components/iconify';

export default function BankSheetGrid() {
  const [searchText, setSearchText] = useState('');

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={0}
        sx={{ p: 2.5, mb: 0, borderRadius: '12px 12px 0 0', border: '1px solid', borderColor: 'divider' }}
      >
        <TextField
          fullWidth
          placeholder="Search Banks..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '12px', height: '48px', '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px' } }
          }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Iconify icon="eva:search-fill" width={22} sx={{ color: 'text.secondary' }} /></InputAdornment>,
          }}
        />
      </Paper>
    </Box>
  );
}
