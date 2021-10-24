import { getPhantomWallet } from "@solana/wallet-adapter-wallets";
import {
  WalletProvider,
  ConnectionProvider,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { Routes } from "./routes";
import { BrowserRouter } from "react-router-dom";
import { Web3Provider } from "./components";

const wallets = [
  // view list of available wallets at https://github.com/solana-labs/wallet-adapter#wallets
  getPhantomWallet(),
];

export default function App() {
  return (
    <BrowserRouter>
      <Web3Provider>
        <Routes />
      </Web3Provider>
    </BrowserRouter>
  );
  // return (
  //   <BrowserRouter>
  //     <ConnectionProvider endpoint={clusterApiUrl("devnet")}>
  //       <WalletProvider wallets={wallets} autoConnect>
  //         <WalletModalProvider logo="/logo512.png">
  //           <Routes />
  //         </WalletModalProvider>
  //       </WalletProvider>
  //     </ConnectionProvider>
  //   </BrowserRouter>
  // );
}
