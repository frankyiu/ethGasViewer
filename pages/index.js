import Head from 'next/head';
import React, { useState, useEffect } from 'react';

import {
  Stack,
  Button,
  Box,
  Text,
  Heading,
  Grid,
  GridItem,
  Input,
  // SimpleGrid,
  // ButtonGroup,
  // HStack,
  // VStack,
} from '@chakra-ui/react';
import { createAlchemyWeb3 } from '@alch/alchemy-web3';

import txConstants from '../constants';
import styles from '../styles/Home.module.css';
import { quartile, toGwei } from '../utils/math';

// import { Parallax, ParallaxLayer, IParallax } from '@react-spring/parallax';
// import GraphView from './graph';

const { TX_SHOW, TX_LIMIT } = txConstants;

function Feature({
  title,
  gas,
  gasPrice,
  maxFee,
  maxPriorityFee,
  time,
  ...rest
}) {
  return (
    <Box display="flex" gap={5} p={5} shadow="md" borderWidth="1px" {...rest}>
      <Heading fontSize="xl" w="480px">{title}</Heading>
      <Text w="120px">Gas: {gas}</Text>
      <Text w="150px">GasPrice: {gasPrice}</Text>
      <Text w="180px">MaxFee: {maxFee}</Text>
      <Text w="180px">MaxPriorFee: {maxPriorityFee}</Text>
      <Text w="150px">Time: {time}</Text>
    </Box>
  );
}

function Card({ title, value, ...rest }) {
  return (
    <Box gap={5} p={5} shadow="md" borderWidth="1px" {...rest}>
      <Text fontSize="l" mb={2}>{title}</Text>
      <Heading fontSize="xl">{value}</Heading>
    </Box>
  );
}

function ListView({ txHistory, compareGas }) {
  return (
    <div>
      <Stack spacing={5} direction="row" textAlign="center" justifyContent="center" mb={5}>
        <Card title="MIN" value={quartile(txHistory.map((ele) => ele?.maxPriorityFeePerGas), 0)} w="200px" />
        <Card title="LOWER Q" value={quartile(txHistory?.map((ele) => ele?.maxPriorityFeePerGas), 0.25)} w="200px" />
        <Card title="Median" value={quartile(txHistory?.map((ele) => ele?.maxPriorityFeePerGas), 0.5)} w="200px" />
        <Card title="UPPER Q" value={quartile(txHistory?.map((ele) => ele?.maxPriorityFeePerGas), 0.75)} w="200px" />
        <Card title="MAX" value={quartile(txHistory?.map((ele) => ele?.maxPriorityFeePerGas), 1)} w="200px" />
        {/* Summary */}
      </Stack>
      {/* {lastTx &&
      <Feature
        mb={10}
        title={lastTx.from}
        gas={lastTx.gas}
        gasPrice={lastTx.gasPrice}
        maxFee={lastTx.maxFeePerGas}
        maxPriorityFee={lastTx.maxPriorityFeePerGas}
        time={lastTx.timestamp}
      />} */}
      {txHistory
        .sort(compareGas)
        .slice(0, TX_SHOW)
        .map((ele, idx) => (
          <div key={idx}>
            {ele && (
              <Feature
                mb={4}
                title={ele.from}
                gas={ele.gas}
                gasPrice={ele.gasPrice}
                maxFee={ele.maxFeePerGas}
                maxPriorityFee={ele.maxPriorityFeePerGas}
                time={ele.timestamp}
              />
            )}
          </div>
        ))}
    </div>
  );
}

export default function Home() {
  // const [web3, setWeb3] = useState(null);
  // const [lastBlock, setLastBlock] = useState();
  // const parallax = useRef(null);

  const [blockSubscription, setBlockSubscription] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [address, setAddress] = useState('');
  const [lastTx, setLastTx] = useState();
  const [txHistory, setTxHistory] = useState([]);

  useEffect(() => {
    setTxHistory(
      (prev) => prev.concat(lastTx)
    );
  }, [lastTx]);

  useEffect(() => {
    if (txHistory.length > TX_LIMIT) {
      setTxHistory(
        (prev) => prev.slice(-1 * TX_SHOW)
      );
    }
  }, [txHistory]);

  const subBlock = () => {
    const web3 = createAlchemyWeb3(`wss://eth-mainnet.alchemyapi.io/v2/${apiKey}`);
    const newBlockSubscription = web3.eth.subscribe('newBlockHeaders', async (err, result) => {
      // use block hash to find transaction
      if (!err) {
        const blockDetail = await web3.eth.getBlock(result.hash);
        const isNotInBlockDetail = (tx) => !blockDetail.transactions.includes(tx.hash);

        // update tx History
        setTxHistory((txlist) => txlist.filter(isNotInBlockDetail));
      }
    });

    setBlockSubscription(newBlockSubscription);
  };

  const subscribe = async () => {
    // console.log('g1')
    if (!apiKey) {
      return;
    }

    const web3 = createAlchemyWeb3(`wss://eth-mainnet.alchemyapi.io/v2/${apiKey}`);

    // subscribe logic
    setTxHistory([]);
    setLastTx();
    setTxHistory([]);

    // subBlock
    subBlock();

    const subCallback = (err, result) => {
      if (!err) {
        const tx = {
          from: result.from,
          hash: result.hash,
          nonce: result.nonce,
          gas: Number(result.gas),
          gasPrice: toGwei(result.gasPrice),
          maxFeePerGas: toGwei(result.maxFeePerGas),
          maxPriorityFeePerGas: toGwei(result.maxPriorityFeePerGas),
          timestamp: (new Date()).toLocaleTimeString('en-US'),
        };

        if (tx.maxPriorityFeePerGas) {
          setLastTx(tx);
        }
      }
    };

    // var blockSubscription  = web3.eth.subscribe("newBlockHeaders")
    let pendingTxSubscription = null;

    if (!address) {
      // for blank
      pendingTxSubscription = web3.eth.subscribe(
        'alchemy_fullPendingTransactions',
        subCallback
      );
    } else {
      pendingTxSubscription = web3.eth.subscribe(
        'alchemy_filteredFullPendingTransactions',
        { address },
        subCallback
      );
    }

    setSubscription(pendingTxSubscription);
  };

  const unSubscribe = (event = null) => {
    if (event) {
      event.preventDefault();
    }

    if (subscription) {
      // unsubscribe
      subscription.unsubscribe((error, success) => {
        if (success) {
          console.log('MemPool Successfully unsubscribed!');
          setSubscription(null);
        }
      });
    }

    if (blockSubscription) {
      blockSubscription.unsubscribe((error, success) => {
        if (success) {
          console.log('Block Successfully unsubscribed!');
          setBlockSubscription(null);
        }
      });
    }
  };

  const handleSub = (event) => {
    event.preventDefault();

    unSubscribe();
    subscribe();
  };

  const compareGas = (a, b) => b.maxPriorityFeePerGas - a.maxPriorityFeePerGas;

  // const scroll = (to) => {
  //   console.log(parallax.current);
  //   if (parallax.current) {
  //     parallax.current.scrollTo(to);
  //   }
  // };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Heading mb={6} size="3xl">
          Etheruem Gas Viewer
        </Heading>
        <Grid templateColumns="repeat(6, 1fr)" gap={6} mb={6}>
          <GridItem colSpan={4}>
            <Stack spacing={3}>
              <Input placeholder="Api Key" value={apiKey} onChange={(event) => setApiKey(event.target.value)} />
              <Input placeholder="Address" value={address} onChange={(event) => setAddress(event.target.value)} />
            </Stack>
          </GridItem>
          <GridItem display="flex" colSpan={2} alignItems="center">
            <Stack spacing={3} direction="row">
              <Button onClick={(e) => handleSub(e)}>Subscribe</Button>
              <Button onClick={(e) => unSubscribe(e)}>Unsubscribe</Button>
            </Stack>
          </GridItem>
        </Grid>
        {/* Parallax */}
        <Box display="flex" justifyContent="center">
          <ListView txHistory={txHistory} compareGas={compareGas} />

          {/* <Parallax pages={2} horizontal ref={parallax} >
            <ParallaxLayer
              onClick={()=>scroll(1)}
              offset={0}
              speed={5}
              style={{ display: 'flex', justifyContent: 'center' }}>
                <ListView />
            </ParallaxLayer>
            <ParallaxLayer
              onClick={()=>scroll(0)}
              offset={1}
              sped={5}
              style={{ display: 'flex', justifyContent: 'center' }}>
                <GraphView />
            </ParallaxLayer>
          </Parallax> */}
        </Box>
      </main>
    </div>
  );
}
