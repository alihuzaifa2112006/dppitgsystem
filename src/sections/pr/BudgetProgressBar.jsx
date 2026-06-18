import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import PropTypes from 'prop-types';

const BudgetProgressBar = ({ budgetAmount, selectedCurrency, TotalConsumed }) => {
  const { BudgetAmtinBDT, ConsumedAmt } = budgetAmount;

  // Calculate percentage (with safety check for division by zero)
  const percentage = BudgetAmtinBDT > 0 ? Math.min(100, (TotalConsumed / BudgetAmtinBDT) * 100) : 0;

  // Determine color based on percentage
  const getProgressColor = (percent) => {
    if (percent < 50) return 'success';
    if (percent < 75) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Budget Utilization
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {TotalConsumed.toLocaleString()} / {BudgetAmtinBDT.toLocaleString()} BDT (
          {percentage.toFixed(1)}%)
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={percentage}
        color={getProgressColor(percentage)}
        sx={{
          height: 10,
          borderRadius: 5,
          backgroundColor: '#e9ecef',
          '& .MuiLinearProgress-bar': {
            borderRadius: 5,
          },
        }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          ৳0
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ৳{BudgetAmtinBDT.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default BudgetProgressBar;

BudgetProgressBar.propTypes = {
  budgetAmount: PropTypes.object,
  selectedCurrency: PropTypes.string,
  TotalConsumed: PropTypes.number,
};
