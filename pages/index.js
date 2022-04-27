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

const { TX_LIMIT } = txConstants;

function Feature({
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

function Card({ title, value, ...rest }) {
  return (
    <Box gap={5} p={5} shadow="md" borderWidth="1px" {...rest}>
      <Text fontSize="l" mb={2}>{title}</Text>
      <Heading fontSize="xl">{value}</Heading>
    </Box>
  );
}

function ListView({
  txHistory,
  compareGas,
  showNum,
}) {
  return (
    <div>
      {txHistory
        .sort(compareGas)
        .slice(0, showNum)
        .map((ele, idx) => (
          <div key={idx}>
            {ele && (
              <Feature
                mb={4}
                title={ele.hash}
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
  // const parallax = useRef(null);

  const [blockSubscription, setBlockSubscription] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [address, setAddress] = useState('');
  const [lastTx, setLastTx] = useState();
  const [lastBlock, setLastBlock] = useState();
  const [txHistory, setTxHistory] = useState([]);

  const [customPercent, setCustomPercent] = useState();
  const [showNum, setShowNum] = useState(10);

  const isNotSameNonce = (tx) => {
    if (!tx) {
      return false;
    }

    if (!lastTx) {
      return true;
    }

    return !(tx.from === lastTx.from && tx.nonce === lastTx.nonce);
  };

  useEffect(() => {
    // replace same nonce
    setTxHistory(
      (prev) => prev?.filter(isNotSameNonce).concat(lastTx)
    );
  }, [lastTx]);

  useEffect(() => {
    if (txHistory.length > TX_LIMIT) {
      setTxHistory(
        (prev) => prev.slice(-1 * showNum)
      );
    }
  }, [txHistory]);

  const subBlock = () => {
    const web3 = createAlchemyWeb3(`wss://eth-mainnet.alchemyapi.io/v2/${apiKey}`);
    const newBlockSubscription = web3.eth.subscribe('newBlockHeaders', async (err, result) => {
      // use block hash to find transaction
      if (!err) {
        const blockDetail = await web3.eth.getBlock(result.hash);

        setLastBlock(blockDetail);

        const isNotInBlockDetail = (tx) => !blockDetail.transactions.includes(tx?.hash);

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
        <Box justifyContent="center">
          <Stack spacing={5} direction="row" textAlign="center" justifyContent="center" mb={5}>
            {/* <Card title="LOWER Q" value={quartile(txHistory?.map((ele) => ele?.maxPriorityFeePerGas), 0.25)} w="200px" /> */}
            <Card title="Median" value={quartile(txHistory?.map((ele) => ele?.maxPriorityFeePerGas), 0.5)} w="200px" />
            <Card title="UPPER Q" value={quartile(txHistory?.map((ele) => ele?.maxPriorityFeePerGas), 0.75)} w="200px" />

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
          <ListView
            txHistory={txHistory}
            compareGas={compareGas}
            showNum={showNum}
          />
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
