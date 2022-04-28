import React from 'react';
import {
  Stack,
  Box,
  Text,
  Heading,
  Input,
} from '@chakra-ui/react';

import Card from './Card';

import { quartile } from '../utils/math';

export default function StatisticPanel({
  customPercent,
  showNum,
  setCustomPercent,
  setShowNum,
  txHistory,
  lastBlock,
}) {
  return (
    <Stack spacing={5} direction="row" textAlign="center" justifyContent="center" mb={5}>

      <Card title="Median" value={quartile(txHistory?.map((ele) => ele?.maxPriorityFeePerGas), 0.5)} w="200px" />
      <Card title="Upper Q" value={quartile(txHistory?.map((ele) => ele?.maxPriorityFeePerGas), 0.75)} w="200px" />

      <Box gap={5} p={3} shadow="md" borderWidth="1px" w="220px">
        <Stack direction="row" justifyContent="center">
          <Text fontSize="l" display="flex" alignItems="center">Custom%</Text>
          <Input size="sm" placeholder="Percent" value={customPercent} onChange={(e) => setCustomPercent(e.target.value)} />
        </Stack>
        <Heading fontSize="xl">{quartile(txHistory?.map((ele) => ele?.maxPriorityFeePerGas), customPercent / 100)}</Heading>
      </Box>

      <Box gap={5} p={3} shadow="md" borderWidth="1px" w="350px" textAlign="left">
        <Text fontSize="l">Current Block</Text>
        <Text fontSize="l">{lastBlock?.hash}</Text>
      </Box>

      <Box gap={5} p={3} shadow="md" borderWidth="1px" w="200px">
        <Text fontSize="l">Number to Show</Text>
        <Input size="sm" placeholder="TOP#" value={showNum} onChange={(event) => setShowNum(event.target.value)} />
      </Box>
    </Stack>
  );
}
