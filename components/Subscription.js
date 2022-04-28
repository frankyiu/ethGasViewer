import React from 'react';
import {
  Stack,
  Button,
  Grid,
  GridItem,
  Input,
} from '@chakra-ui/react';

export default function Subscription({
  apiKey,
  address,
  setApiKey,
  setAddress,
  handleSubscribe,
  handleSubUnsubcribe,
}) {
  return (
    <Grid templateColumns="repeat(6, 1fr)" gap={6} mb={6}>
      <GridItem colSpan={4}>
        <Stack spacing={3}>
          <Input placeholder="Api Key" value={apiKey} onChange={(event) => setApiKey(event.target.value)} />
          <Input placeholder="Address" value={address} onChange={(event) => setAddress(event.target.value)} />
        </Stack>
      </GridItem>
      <GridItem display="flex" colSpan={2} alignItems="center">
        <Stack spacing={3} direction="row">
          <Button onClick={(event) => handleSubscribe(event)}>Subscribe</Button>
          <Button onClick={(event) => handleSubUnsubcribe(event)}>Unsubscribe</Button>
        </Stack>
      </GridItem>
    </Grid>
  );
}
