import { useState } from "react";
import { ethers } from "ethers";
import { Buffer } from "buffer/";
import { randomBytes } from "crypto-browserify";
import { Container, Row, Col, Button } from 'react-bootstrap';
import useInterval from '@use-it/interval';

import MainForm from './components/MainForm.js';
import Top from './components/Top.js';
import Phases from './components/Phases.js';
import RevealPhase from "./components/RevealPhase.js";
import EndPhase from './components/EndPhase.js';

const createKeccakHash = require('keccak')
const abi = require('./config/abi.json')

// workaround for keccak package
window.Buffer = window.Buffer || Buffer;

function App() {
  let [formBid, setFormBid] = useState("");
  let [bid, setBid] = useState("");
  let [nonce, setNonce] = useState("");
  let [connected, setConnected] = useState(false);
  let [hasBid, setHasBid] = useState(false);
  let [revealed, setRevealed] = useState(false);
  let [providerAddress, setProviderAddress] = useState("");
  let [contract, setContract] = useState(null);
  let [currentBlock, setCurrentBlock] = useState(0);
  let [revealBlock, setRevealBlock] = useState(0);
  let [endBlock, setEndBlock] = useState(0);
  let [phase, setPhase] = useState(Phases.bidding);

  let { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(ethereum);

  const fetchCurrentBlock = async () => {
    const block = await provider.getBlockNumber();

    if(contract){
      if(block >= revealBlock){
        setPhase(Phases.reveal);
      }

      if(block >= endBlock){
        setPhase(Phases.end);
      }
    }

    setCurrentBlock(block);
  }

  useInterval(() => {
    if(provider){
      fetchCurrentBlock();
    }
  }, 1000);

  const connectToContract = (e) => {
    e.preventDefault();
    if(provider){
      const signer = provider.getSigner();
      const contract = new ethers.Contract(providerAddress, abi, signer);

      console.log(contract)
      
      const fetchBlocks = async () => {
        const revealBlock = await contract.revealBlock();
        const endBlock = await contract.endBlock();
        setRevealBlock(revealBlock.toString());
        setEndBlock(endBlock.toString());
      }

      fetchBlocks();
      
      setContract(contract);
    }
  }

  const connectWallet = () => {
    ethereum.request({ method: 'eth_requestAccounts'})
      .then(accounts => {
          setConnected(true);
      })
  }

  const bidOnContract = (e) => {
    e.preventDefault();
    if(contract && connected && !hasBid){
      const nonce = randomBytes(32).toString('hex').padStart(64, '0')
      const bid = parseInt(formBid, 10).toString(16).padStart(64, '0')
      const input = bid.concat(nonce)
      const commitment = '0x'.concat(createKeccakHash('keccak256').update(Buffer.from(input, 'hex')).digest('hex'))
      
      console.log('bid: 0x' + bid)
      console.log('nonce 0x' + nonce)
      console.log('input: 0x' + input)
      console.log('commitment: ' + commitment)

      contract.bid(commitment)
        .then(() => {
          console.log('bid successful')
          setNonce('0x'.concat(nonce));
          setBid('0x'.concat(bid));
          setHasBid(true);
        });
      }
  }

  const revealBid = () => {
    if(contract && connected && hasBid && !revealed){
      console.log('Attempting to reveal ...')
      console.log('Bid: %s', bid)
      console.log('Nonce: %s', nonce)

      contract.reveal(bid, nonce, {value: bid})
        .then(() => {
          console.log('reveal successful')
          setRevealed(true);
        });
    }
  }

  return (
    <Container className="d-flex vh-100 w-100">
      <Row className="m-auto align-self-center justify-content-center w-100">
        <Col md={8} xs={12}>
          
          <Top contract={contract} phase={phase} revealBlock={revealBlock} endBlock={endBlock} currentBlock={currentBlock}/>

          {!contract && 
            <MainForm
              label="Auction Address"
              submitLabel="Submit"
              onSubmit={connectToContract}
              onChange={e => setProviderAddress(e.currentTarget.value)}
              value={providerAddress}
              placeholder="0x..."
            />
          }

          {!connected && contract &&
            <Button variant="dark" onClick={connectWallet}>Connect wallet</Button>
          }

          {!hasBid && connected && contract &&
            <MainForm 
              onSubmit={bidOnContract}
              onChange={e => setFormBid(e.currentTarget.value)}
              label="Amount to Bid (Wei)"
              submitLabel="Bid"
              placeholder="0"
            />
          }

          {!revealed && hasBid && connected && contract &&
            <RevealPhase formBid={formBid} revealBid={revealBid} phase={phase}/>
          }

          {revealed && hasBid && connected && contract &&
            <EndPhase formBid={formBid} contract={contract} phase={phase}/>
          }

        </Col>
      </Row>
    </Container>
  );
}

export default App;
