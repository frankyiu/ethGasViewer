import React from 'react';
import {
  Box,
  Text,
  Heading,
} from '@chakra-ui/react';

export default function Card({ title, value, ...rest }) {
  return (
    <Box gap={5} p={5} shadow="md" borderWidth="1px" {...rest}>
      <Text fontSize="l" mb={2}>{title}</Text>
      <Heading fontSize="xl">{value}</Heading>
    </Box>
  );
}
