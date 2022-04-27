import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { useState, useEffect, useRef } from 'react';

import { Box, Text,Heading, Grid, GridItem, Input, SimpleGrid } from '@chakra-ui/react'
import { Stack, HStack, VStack } from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'
import { Parallax, ParallaxLayer, IParallax } from '@react-spring/parallax'
import { quartile, toGwei } from '../utils/math';

import GraphView from './graph';




export default function Home() {

  const TX_LIMIT = 10000
  // const wsWeb3 = createAlchemyWeb3('wss://eth-mainnet.alchemyapi.io/v2/gCJRKmBsQwI8cu_7kr7Ng9VIvsRB_yop');

  const [blockSubscription, setBlockSubscription] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [apiKey, setApiKey] = useState('')
  const [address, setAddress] = useState('')
  const [lastTx, setLastTx] = useState()
  const [lastBlock, setLastBlock] = useState()
  const [txHistory, setTxHistory] = useState([])

  const [customPercent, setCustomPercent] = useState()
  const [showNum, setShowNum] = useState(10)

  const parallax = useRef(null)

  useEffect(() => {
      //replace same nonce
      setTxHistory(prev => prev?.filter(tx=> !(tx?.from == lastTx?.from && tx?.nonce == lastTx?.nonce)).concat(lastTx))
  }, [lastTx])
  

  useEffect(() => {
    if(txHistory.length > TX_LIMIT)
      setTxHistory(prev => prev.slice(-1*TX_SHOW))
}, [txHistory])



  const subscribe = async () =>{
    // console.log('g1')
    if(apiKey === null || apiKey === '')
      return 
    const web3 = createAlchemyWeb3(`wss://eth-mainnet.alchemyapi.io/v2/${apiKey}`)
    //subscribe logic
    setLastTx();
    setTxHistory([]);

  //subBlock
    subBlock();
    // var blockSubscription  = web3.eth.subscribe("newBlockHeaders")
    if(address ===null || address === ""){
      //for blank 
      var subscription = web3.eth.subscribe("alchemy_fullPendingTransactions", subCallback);
      setSubscription(subscription)
    }else {
      var subscription = web3.eth.subscribe("alchemy_filteredFullPendingTransactions", {"address": address}, subCallback);
      setSubscription(subscription)
    }
    
  }

  const subBlock =()=> {
    const web3 = createAlchemyWeb3(`wss://eth-mainnet.alchemyapi.io/v2/${apiKey}`)
    var blockSubscription  = web3.eth.subscribe("newBlockHeaders", async (err, result) => {
      //use block hash to find transaction
      if(!err ){
        const blockDetail = await web3.eth.getBlock(result.hash)
        setLastBlock(blockDetail)
        //update tx History
        setTxHistory(txlist => txlist.filter(tx => !blockDetail.transactions.includes(tx?.hash) ))        
      }
    })
    setBlockSubscription(blockSubscription)
  }
  



  const subCallback = (err, result)=>{
    if (!err){
      const temp = {
          from: result.from,
          hash: result.hash,
          nonce: result.nonce,
          gas: Number(result.gas),
          gasPrice: toGwei(result.gasPrice),
          maxFeePerGas: toGwei(result.maxFeePerGas),
          maxPriorityFeePerGas: toGwei(result.maxPriorityFeePerGas),
          timestamp: (new Date()).toLocaleTimeString("en-US")
      }
      if(temp.maxPriorityFeePerGas!=undefined && temp.maxPriorityFeePerGas !== null){
        setLastTx(temp)
      }
    }
  }

  
  const unSubscribe =() =>{
    if(subscription !==null){
      //unSubscribe
      subscription.unsubscribe((error, success)=>{
        if(success){
          console.log('MemPool Successfully unsubscribed!');
          setSubscription(null);
        }
      })
    }
    if(blockSubscription !==null){
      blockSubscription.unsubscribe((error, success)=>{
        if(success){
          console.log('Block Successfully unsubscribed!');
          setBlockSubscription(null);
        }
      })
    }
  }

  const handleSub =() =>{
    unSubscribe();
    subscribe();
  }

  const compareGas = (a,b) =>{
    return b.maxPriorityFeePerGas - a.maxPriorityFeePerGas;
  }

  const scroll = (to) =>{
    console.log(parallax.current)
    if(parallax.current){
      parallax.current.scrollTo(to)
    }
  }

  function Feature({ title, gas, gasPrice, maxFee, maxPriorityFee, time, ...rest }) {
    return (
      <Box display="flex" gap={5} p={5} shadow='md' borderWidth='1px' {...rest}>
        <Heading fontSize='l' w="600px">{title}</Heading>
        <Text w="120px">Gas: {gas}</Text>
        {/* <Text w="150px">GasPrice: {gasPrice}</Text> */}
        <Text w="180px">MaxFee: {maxFee}</Text>
        <Text w="180px">MaxPriorFee: {maxPriorityFee}</Text>
        <Text w="150px">Time: {time}</Text>
      </Box>
    )
  }

  function Card( {title ,value ,...rest}) {
    return (
      <Box gap={5} p={5} shadow='md' borderWidth='1px' {...rest} >
          <Text fontSize='l' mb={2}>{title}</Text>
          <Heading fontSize='xl'>{value}</Heading>
      </Box>
    )
  }


  function ListView({txHistory}) {
  
    return (
        <div>
          {txHistory
          .sort(compareGas)
          .slice(0, showNum)
          .map((ele, idx) => 
            <div key={idx}>
            {ele &&
              <Feature
                mb={4}
                title={ele.hash}
                gas={ele.gas}
                gasPrice={ele.gasPrice}
                maxFee={ele.maxFeePerGas}
                maxPriorityFee={ele.maxPriorityFeePerGas}
                time={ele.timestamp}
              />}
            </div>)}
        </div>
    )
  }


  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
          <Heading mb={6} size='3xl'>
            Etheruem Gas Viewer
          </Heading>
          <Grid templateColumns='repeat(6, 1fr)' gap={6} mb={6}>
            <GridItem  colSpan={4} >
              <Stack spacing={3}>
                <Input placeholder='Api Key'  value={apiKey} onChange={(event)=>setApiKey(event.target.value)} />
                <Input placeholder='Address'  value={address} onChange={(event)=>setAddress(event.target.value)} />
              </Stack>
            </GridItem>
            <GridItem display="flex" colSpan={2}  alignItems="center" >
              <Stack spacing={3} direction='row' >
                <Button onClick={(e)=>handleSub()}>Subscribe</Button>
                <Button onClick={(e)=>unSubscribe()}>Unsubscribe</Button>
              </Stack>
            </GridItem>
          </Grid >
        {/* Parallax  */}
          <Box justifyContent="center">
            <Stack spacing={5} direction='row' textAlign={"center"} justifyContent="center" mb={5}>
                  {/* <Card title="LOWER Q" value={quartile(txHistory?.map(ele  => ele?.maxPriorityFeePerGas), .25)} w="200px"/> */}
                  <Card title="Median" value={quartile(txHistory?.map(ele => ele?.maxPriorityFeePerGas), .5)} w="200px"/>
                  <Card title="UPPER Q" value={quartile(txHistory?.map(ele  => ele?.maxPriorityFeePerGas), .75)} w="200px"/>
                  <Box gap={5} p={3} shadow='md' borderWidth='1px' w="220px">
                    <Stack direction='row' justifyContent="center">
                      <Text fontSize='l' display="flex" alignItems="center">Custom%</Text> 
                      <Input size='sm' placeholder='Percent'  value={customPercent} onChange={(e) => setCustomPercent(e.target.value)} />
                    </Stack>
                    <Heading fontSize='xl'>{quartile(txHistory?.map(ele  => ele?.maxPriorityFeePerGas), customPercent/100)}</Heading>
                  </Box>
                  <Box gap={5} p={3} shadow='md' borderWidth='1px' w="350px" textAlign={"left"}>
                    <Text fontSize='l'>Current Block</Text>
                    <Text fontSize='l'>{lastBlock?.hash}</Text>
                  </Box>
                  <Box gap={5} p={3} shadow='md' borderWidth='1px' w="200px">
                    <Text fontSize='l'>Number to Show</Text>
                    <Input size='sm' placeholder='TOP#'  value={showNum} onChange={(e) => setShowNum(e.target.value)} />
                  </Box>
            </Stack>
            <ListView txHistory={txHistory}/>

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
  )
}
