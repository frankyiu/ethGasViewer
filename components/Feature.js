import React from 'react';
import {
  Box,
  Text,
  Heading,
} from '@chakra-ui/react';

export default function Feature({
  title,
  gas,
  maxFee,
  maxPriorityFee,
  time,
  ...rest
}) {
  return (
    <Box display="flex" gap={5} p={5} shadow="md" borderWidth="1px" {...rest}>
      <Heading fontSize="l" w="600px">{title}</Heading>
      <Text w="120px">Gas: {gas}</Text>
      {/* <Text w="150px">GasPrice: {gasPrice}</Text> */}
      <Text w="180px">MaxFee: {maxFee}</Text>
      <Text w="180px">MaxPriorFee: {maxPriorityFee}</Text>
      <Text w="150px">Time: {time}</Text>
    </Box>
  );
}
