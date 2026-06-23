// src/components/dashboard/FeedTabs.tsx
import React from 'react';
import { Box, Tab, Tabs } from '@mui/material';

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export default function FeedTabs({ value, onChange }: Props) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={value}
        onChange={(_, val: number) => onChange(val)}
        aria-label="feed filter layout"
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        <Tab
          label="All Posts"
          sx={{ textTransform: 'none', fontWeight: 600 }}
        />
        <Tab label="For You" sx={{ textTransform: 'none', fontWeight: 600 }} />
        <Tab
          label="Most Liked"
          sx={{ textTransform: 'none', fontWeight: 600 }}
        />
      </Tabs>
    </Box>
  );
}
