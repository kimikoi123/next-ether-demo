import Character from "../component/Character"
import Coin from "../component/Coin"
import { useGameAuth } from "../contexts/GameContext"
import { useState, useEffect } from "react"
import { signMessage } from "../utils/sign"

const PLAYER_COLORS = ["blue", "red", "orange", "yellow", "green", "purple"]

const Index = () => {
  const [haveMetamask, setHaveMetamask] = useState(true)
  const [client, setClient] = useState({
    isConnected: false,
  })

  const {
    characters,
    userId,
    handleChangeName,
    handleChangeColor,
    coins,
    currentName,
    handleStartGame,
    handleStopGame,
    handleSetWalletAccount,
  } = useGameAuth()

  const checkConnection = async () => {
    const { ethereum } = window
    if (ethereum) {
      ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length < 1) {
          window.location.reload()
        }
      })
      setHaveMetamask(true)
      const accounts = await ethereum.request({ method: "eth_accounts" })
      if (accounts.length > 0) {
        setClient({
          isConnected: true,
          address: accounts[0],
        })
        handleSetWalletAccount(accounts[0])
      } else {
        setClient({
          isConnected: false,
        })
      }
    } else {
      setHaveMetamask(false)
    }
  }

  const connectWeb3 = async () => {
    try {
      const { ethereum } = window
      if (!ethereum) {
        console.log("Metamask not detected")
        return
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      })
      setClient({
        isConnected: true,
        address: accounts[0],
      })
      handleSetWalletAccount(accounts[0])
    } catch (error) {
      console.log("Error connecting to metamask", error)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <div>
      <div className="game-container">
        {characters.map((char, index) => {
          const isYou = char.id === userId
          return <Character key={index} {...char} isYou={isYou} />
        })}
        {coins.map((coin, index) => {
          return <Coin key={index} {...coin} />
        })}
      </div>
      {client.isConnected && (
        <div className="player-info">
          <div>
            <label htmlFor="player-name">Your Name</label>
            <input
              onChange={(e) => handleChangeName(e.target.value)}
              id="player-name"
              maxLength="10"
              type="text"
              value={currentName}
            />
          </div>
          <div>
            <button onClick={handleChangeColor} id="player-color">
              Change Color
            </button>
          </div>
        </div>
      )}

      {/* <div className="absolute bottom-28 right-1/2 translate-x-1/2 flex gap-5">
        <button onClick={handleStartGame} className="bg-yellow-400">
          Drop Coins
        </button>
        <button onClick={handleStopGame} className="bg-red-400">
          Stop
        </button>
      </div> */}
      <div className="absolute right-10 top-10 flex items-center gap-2">
        <button onClick={connectWeb3} className="bg-yellow-400">
          {client.isConnected
            ? `${client.address.slice(0, 4)}...${client.address.slice(38, 42)}`
            : "Connect Wallet"}
        </button>
        {/* <button className="bg-red-400">
            Log Out
        </button> */}
      </div>

      <div className="absolute right-1/2 translate-x-1/2 top-10 text-3xl font-bold">
        {client.isConnected ? (
          <div className="flex items-center gap-5">
            <img className="w-8 h-8" src="/check-icon.svg" alt="" />{" "}
            <div>'You are connected'</div>
          </div>
        ) : (
          <div className="flex items-center gap-5">
            <img className="w-8 h-8" src="/close-icon.svg" alt="" />{" "}
            <div>'You are not connected'</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Index
