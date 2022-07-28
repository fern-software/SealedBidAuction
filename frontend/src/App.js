import { useState } from "react";
import { ethers } from "ethers";
import { Buffer } from "buffer/";
import { randomBytes } from "crypto-browserify";
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import useInterval from '@use-it/interval';

import MainForm from './components/MainForm.js';
import Top from './components/Top.js';

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
  let [address, setAddress] = useState("");
  let [contract, setContract] = useState(null);
  let [provider, setProvider] = useState(null);
  let [currentBlock, setCurrentBlock] = useState(0);
  let [revealBlock, setRevealBlock] = useState(0);
  let [endBlock, setEndBlock] = useState(0);
  let [phase, setPhase] = useState("Bidding Phase 🎰");

  let { ethereum } = window;

  const fetchCurrentBlock = async () => {
    const block = await provider.getBlockNumber();
    console.log('current block: %d', block)

    if(currentBlock >= revealBlock){
      setPhase('Reveal Phase 🃏');
    }

    if(currentBlock >= endBlock){
      setPhase('End Phase 🎆');
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
    if(ethereum){
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(address, abi, signer);

      console.log(contract)
      
      const fetchBlocks = async () => {
        const revealBlock = await contract.revealBlock();
        const endBlock = await contract.endBlock();
        setRevealBlock(revealBlock.toString());
        setEndBlock(endBlock.toString());
      }

      fetchBlocks();
      
      setProvider(provider);
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
          setNonce(nonce);
          setBid(bid);
          setHasBid(true);
        });
      }
  }

  const revealBid = () => {
    if(contract && connected && hasBid && !revealed){
      const bid_int = parseInt(bid, 16)
      const nonce_int = parseInt(nonce, 16)

      console.log('Attempting to reveal ...')
      console.log('Bid: 0x%s', bid)
      console.log('Nonce: 0x%s', nonce)
      console.log('Bid (base 10): %d', bid_int)
      console.log('Nonce (base 10): %d', nonce_int)

      contract.reveal(bid_int, nonce_int, {value: bid_int})
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
              onChange={e => setAddress(e.currentTarget.value)}
              value={address}
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
            <div>
              <Alert variant="dark">You bid {formBid} Wei</Alert>
              <Button variant="dark" onClick={revealBid}>Reveal</Button>
            </div>
          }

          {revealed && hasBid && connected && contract &&
            <Alert variant="dark">You revealed {formBid} Wei. Please wait to be contacted to see if you've won 🤞</Alert>
          }

        </Col>
      </Row>
    </Container>
  );
}

export default App;
