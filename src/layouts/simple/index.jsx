
import PropTypes from 'prop-types';

import { Box } from '@mui/material';
import Header from '../common/header-simple';

// ----------------------------------------------------------------------

export default function SimpleLayout({ children }) {
  return (
    <>
      <Header />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 12, md: 10 }
        }}
      >
        {children}
      </Box>
    </>
  );
}

SimpleLayout.propTypes = {
  children: PropTypes.node,
};
