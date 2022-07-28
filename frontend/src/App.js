// This frontend is loosely based off the frontend developed in this tutorial
// https://dev.to/ghoulkingr/create-a-dapp-with-reactjs-ethers-and-solidity-512n

import { useState } from "react";
import { ethers } from "ethers";
import { Buffer } from "buffer/";
import { Container, Row, Col, Button } from 'react-bootstrap';

import MainForm from './components/MainForm.js';

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

  let { ethereum } = window;

  const onHomeSubmit = (e) => {
    e.preventDefault();
    if (ethereum) {
      let provider = new ethers.providers.Web3Provider(ethereum);
      let signer = provider.getSigner();
      setContract(new ethers.Contract(address, abi, signer));
    }
  }

  return (
    <Container className="d-flex vh-100 w-100">
      <Row className="m-auto align-self-center justify-content-center w-100">
        <Col md={8} xs={12}>

          {!contract && <MainForm label="Auction Address" submitLabel="Submit" onSubmit={onHomeSubmit} onChange={e => setAddress(e.currentTarget.value)} value={address}/>}

          {!connected && contract &&
            <Button variant="dark" onClick={() => {
              ethereum.request({ method: 'eth_requestAccounts'})
                  .then(accounts => {
                      setConnected(true);
                  })
            }}>Connect wallet</Button>
          }

          {!hasBid && connected && contract &&
            <MainForm onSubmit={(e) => {
              e.preventDefault();
              if (contract && connected && !hasBid) {
                const nonce = parseInt(12345, 10).toString(16).padStart(64, '0')
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
            }}
            onChange={e => setFormBid(e.currentTarget.value)}
            label="Wei Amount to Bid"
            submitLabel="Bid"/>
          }

          {!revealed && hasBid && connected && contract &&
            <Button variant="dark" onClick={() => {
              if (contract && connected && hasBid && !revealed) {
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
            }}>Reveal</Button>
          }

        </Col>
      </Row>
    </Container>
  );
}

export default App;
