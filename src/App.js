import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("")
  const [allWaves, setAllWaves] = useState([])
  const [totalWave, setTotalWave] = useState("")
  const [message, setMessage] = useState("")
  const contractAddress = "0x8CD318988A3EbCE81894463F11E1249E235aB7eb"
  const contractABI = abi.abi;

  const getAllWaves = async () => {
    try {
      const {ethereum} = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        const waves = await wavePortalContract.getAllWaves();
        const waveCount = await wavePortalContract.getTotalWaves();
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push(
            {
              address: wave.waver,
              timestamp: new Date(wave.timestamp*1000),
              message: wave.message
            }
          )
        })
        console.log(wavesCleaned)
        setAllWaves(wavesCleaned)
        setTotalWave(waveCount.toNumber())
      }else {
        console.log("Ethereum object doesn't exist")
      }
    } catch(error) {
     console.log(error) 
    }
  }
  
  
  const checkIfWalletIsConnected = async () => {
    try{
       const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have connect to metamask")
      }else {
        console.log("We have ethereum object ", ethereum)
      }
  
      const accounts = await ethereum.request({method: "eth_accounts"})
      console.log(accounts)
      if (accounts.length !== 0){
        const account = accounts[0]
        setCurrentAccount(account)
        await getAllWaves()
      }else {
        console.log("no authenticated account found!")
      }
    }catch(error){
      console.log(error)
    }
   
  }

  const connectWallet = async () => {
    try{
       const { ethereum } = window
       if (!ethereum) {
         alert("Get Metamask");
         return
       }

      const accounts = await ethereum.request({method: "eth_requestAccounts"})
      console.log("Connected account ", accounts[0])
      setCurrentAccount(accounts[0])
    }catch(error) {
      console.log(error)
    }
  }
  
  const wave = async () => {
    try{
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer)
        
        let count = await wavePortalContract.getTotalWaves()
        let msg = "This is a message"
        if (message) {
          msg = message
          setMessage("")
        }
        const waveTxn = await wavePortalContract.wave(msg, { gasLimit: 300000 });
        console.log("Mining ...", waveTxn.hash)

        await waveTxn.wait();
        console.log("Mined--", waveTxn.hash)

        count = await wavePortalContract.getTotalWaves()
        setTotalWave(count.toNumber())
      }else {
        console.log("Ethereum object doesn't exist!")
      }
    }catch(error){
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message)
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp*1000),
          message: message
        }
      ])
    }

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave)
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave)
      }
    }
  }, [])
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Hey there! This is my first site of web3 that I built
        </div>

        <div className="bio">
        I am Duong. Connect your Ethereum wallet and wave at me! I will transfer to you a litter Ether
        </div>
        <div>
          <h4>Total waves: {totalWave}</h4>
        </div>
      <br/>
        <input type="text" placeholder="Send message to me" onChange={e => {setMessage(e.target.value)}} value={message}/>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {
          !currentAccount && (
            <button className="waveButton" onClick={connectWallet}>
              Connect wallet
            </button>
          )
        }

        {
          allWaves.map((wave, index)=> {
            return (
             <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
          })
        }
      </div>
    </div>
  );
}
