import { Program, Provider, web3 } from "@project-serum/anchor";
import {
  AnchorWallet,
  useAnchorWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import {
  WalletMultiButton,
  WalletDisconnectButton,
  useWalletModal,
} from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { CreateCashflowModal, CashflowTable } from "src/components";
import { abbreviate } from "src/utils";
import idl from "../idl.json";

const programID = new PublicKey(idl.metadata.address);

const opts: web3.ConfirmOptions = {
  preflightCommitment: "processed",
};

enum Tab {
  Incoming = "incoming",
  Outgoing = "outgoing",
}

const tabs = [Tab.Incoming, Tab.Outgoing];

function getTabName(tab: Tab) {
  switch (tab) {
    case Tab.Incoming:
      return "Incoming";
    case Tab.Outgoing:
      return "Outgoing";
    default:
      return "";
  }
}

// const tabs = [{ name: "Incoming" }, { name: "Outgoing" }];

interface Cashflows {
  incoming: any[];
  outgoing: any[];
}

export function HomeView() {
  // Web3
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const provider = useMemo(
    () => new Provider(connection, wallet, opts),
    [connection, wallet, opts]
  );
  const program = useMemo(
    () => new Program(idl as any, programID, provider),
    [idl, programID, provider]
  );

  // Page state
  const [currentTab, setCurrentTab] = useState(Tab.Incoming);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateCashflowModalOpen, setIsCreateCashflowModalOpen] =
    useState(false);

  // Cached data
  const [cashflows, setCashflows] = useState<Cashflows>({
    incoming: [],
    outgoing: [],
  });
  const visibleCashflows = useMemo(
    () => cashflows[currentTab.toString()],
    [cashflows, currentTab]
  );

  // Refresh page on load
  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setIsRefreshing(true);
    const cashflows: any = await program.account.cashflow.all();
    setCashflows({
      incoming: cashflows.filter(
        (inv: any) =>
          inv.account.receiver.toString() === wallet.publicKey.toString()
      ),
      outgoing: cashflows.filter(
        (inv: any) =>
          inv.account.sender.toString() === wallet.publicKey.toString()
      ),
    });
    setIsRefreshing(false);
  }

  return (
    <div className="flex flex-1 h-screen overflow-auto overflow-hidden bg-gray-100 focus:outline-none">
      <main className="z-0 flex-1 max-w-4xl py-8 mx-auto space-y-8">
        <Header />
        <div className="space-y-4">
          {wallet && (
            <Toolbar
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              isRefreshing={isRefreshing}
              refresh={refresh}
              setIsCreateCashflowModalOpen={setIsCreateCashflowModalOpen}
            />
          )}
          <CashflowTable
            cashflows={visibleCashflows}
            currentTab={currentTab}
            program={program}
            refresh={refresh}
          />
        </div>
      </main>
      {wallet && (
        <CreateCashflowModal
          open={isCreateCashflowModalOpen}
          setOpen={setIsCreateCashflowModalOpen}
          program={program}
          refresh={refresh}
          provider={provider}
        />
      )}
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-row justify-between py-0">
      <HomeButton />
      <WalletButton />
    </div>
  );
}

function HomeButton() {
  return (
    <a href="/" className="flex h-12 px-2 my-auto transform hover:opacity-75">
      <img className="h-6 my-auto" src="/wordmark-orange-black.svg" />
    </a>
  );
}

function WalletButton() {
  const wallet = useAnchorWallet();

  const { visible, setVisible: setWalletModalVisible } = useWalletModal();

  function onClickConnectWallet(e: any) {
    e.preventDefault();
    setWalletModalVisible(true);
  }

  function onClickWallet(e: any) {
    e.preventDefault();
    // TODO
  }

  if (wallet)
    return (
      <button
        className="px-6 py-3 my-auto text-lg font-semibold text-gray-900 transition duration-200 rounded-full hover:bg-gray-200"
        onClick={onClickWallet}
      >
        {abbreviate(wallet.publicKey)}
      </button>
    );
  else
    return (
      <button
        className="px-6 py-3 my-auto text-lg font-semibold text-gray-900 transition duration-200 rounded-full hover:bg-gray-200"
        onClick={onClickConnectWallet}
      >
        Connect wallet
      </button>
    );
}

function Toolbar({
  currentTab,
  setCurrentTab,
  isRefreshing,
  refresh,
  setIsCreateCashflowModalOpen,
}) {
  return (
    <div className="flex items-center justify-between">
      {/* Left side */}
      <nav className="flex space-x-4" aria-label="Tabs">
        {tabs.map((tab) => (
          <div
            className={`flex border-b-2 transition duration-200 ${
              currentTab === tab ? "border-orange-500" : "border-none"
            }`}
          >
            <a
              onClick={() => setCurrentTab(tab.toString())}
              key={tab.toString()}
              className={`px-3 py-2 text hover:bg-gray-200 transition duration-200 rounded-md font-semibold cursor-pointer ${
                currentTab === tab ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {getTabName(tab)}
            </a>
          </div>
        ))}
      </nav>
      {/* Right side */}
      <div className="space-x-2">
        {/* <RefreshButton refresh={refresh} isRefreshing={isRefreshing} /> */}
        <CreateCashflowButton
          showModal={() => setIsCreateCashflowModalOpen(true)}
        />
      </div>
    </div>
  );
}

function CreateCashflowButton({ showModal }) {
  return (
    <button
      onClick={showModal}
      type="button"
      className="px-5 py-3 font-semibold text-white transition duration-200 bg-orange-500 shadow-sm rounded-tl-3xl rounded-br-3xl hover:bg-orange-400"
    >
      New Cashflow
    </button>
  );
}

function RefreshButton({ refresh, isRefreshing }) {
  return (
    <button
      onClick={refresh}
      disabled={isRefreshing}
      className="px-4 py-3 font-semibold text-gray-600 rounded-md hover:text-gray-900 hover:bg-gray-200"
    >
      {isRefreshing ? "Refreshing..." : "Refresh"}
    </button>
  );
}
