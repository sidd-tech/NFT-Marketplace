
import './App.css';
import {
  BrowserRouter,
  //Routes,
  Switch,
  Route
} from "react-router-dom"
import Navigation from './Navbar'
import {useState} from 'react'
import { ethers } from "ethers"
import MarketplaceAbi from '/Users/siddharth/nft-marketplace/src/frontend/contractsData/Marketplace.json'
import MarketplaceAddress from '/Users/siddharth/nft-marketplace/src/frontend/contractsData/Marketplace-address.json'
import NFTAbi from '/Users/siddharth/nft-marketplace/src/frontend/contractsData/NFT.json'
import NFTAddress from '/Users/siddharth/nft-marketplace/src/frontend/contractsData/NFT-address.json'
import Home from './Home'
import Create from './Create'
import MyListedItems from './MyListedItem'
import MyPurchases from './MyPurchase'
import {Spinner } from 'react-bootstrap'

function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [nft,setNFT] = useState({})
  const [marketplace, setMarketplace]= useState({})
  //For connecting to metamask
  const web3Handler = async() => {
    const accounts = await window.ethereum.request({method : 'eth_requestAccounts'});
    setAccount(accounts[0])
    //getting provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // setting the signer
    const signer = provider.getSigner()
    loadContracts(signer)
  }
  const loadContracts = async (signer) => {
    // getting deployed copies of contracts
    const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer)
    setMarketplace(marketplace)
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer)
    setNFT(nft);
    setLoading(false)
  }
  
  return (
    <BrowserRouter>
    <div className= "App">
        <Navigation web3Handler={web3Handler} account={account} />
        {loading ? (
          <div style={{display: 'flex', justifyContent: 'center',alignItems: 'center' , minHeight: '80vh'}}>
            <Spinner animation= 'border' style={{display: 'flex' }} />
            <p className = 'mx-3 my-0'> Awaiting Metamask Connection...</p>
            </div>
        ) : (
       // <Routes>
          <Switch>
          <Route exact path="/" render={() =>
            <Home marketplace={marketplace} nft={nft} />
          } />
          <Route path="/create" render={() =>
            <Create marketplace={marketplace} nft={nft} />
          }  />
          <Route path="/my-listed-items" render={() =>
            <MyListedItems marketplace={marketplace} nft={nft} account={account} />
          } />
          <Route path="/my-purchases" render={() =>
            <MyPurchases marketplace={marketplace} nft={nft} account={account} />
          }/>
          </Switch>
       // </Routes>
        )}
      </div>
      </BrowserRouter>
  );
}

export default App;
