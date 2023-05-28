import { createContext, useContext, useState, useEffect } from "react"
import { signInAnonymously, onAuthStateChanged } from "firebase/auth"
import {
  ref,
  set,
  onDisconnect,
  onValue,
  onChildAdded,
  update,
  remove,
} from "firebase/database"
import { auth, database } from "../utils/firebase"
import {
  createName,
  randomFromArray,
  isSolid,
  getRandomSafeSpot,
  getKeyString,
} from "../utils/helpers"
import KeyPressListener from "../utils/KeyPressListener"

const PLAYER_COLORS = ["blue", "red", "orange", "yellow", "green", "purple"]
const COIN_TIMEOUTS = [2000, 3000, 4000, 5000]

const GameContext = createContext()

export function useGameAuth() {
  return useContext(GameContext)
}

export function GameContextProvider({ children }) {
  const [characters, setCharacters] = useState([])
  const [coins, setCoins] = useState([])
  const [currentName, setCurrentName] = useState("")
  const [userId, setUserId] = useState("")
  const [isStart, setIsStart] = useState(false)
  const [walletAccount, setWalletAccount] = useState("")

  let tempCoins = {}
  let currentPlayer
  let playerId

  function handleSetWalletAccount(address) {
    setWalletAccount(address)
    console.log(walletAccount)
  }

  function handleStopGame() {
    setIsStart(false)
    console.log(isStart)
  }

  function handleStartGame() {
    setIsStart(true)
    console.log(isStart)
  }

  function handleChangeName(value) {
    const newName = value
    setCurrentName(newName)
    const playerRef = ref(database, `players/${userId}`)
    update(playerRef, {
      name: newName || createName(),
    })
  }

  function handleChangeColor() {
    const player = characters.find((char) => char.id === userId)
    const mySkinIndex = PLAYER_COLORS.indexOf(player.color)
    const nextColor = PLAYER_COLORS[mySkinIndex + 1] || PLAYER_COLORS[0]
    const playerRef = ref(database, `players/${userId}`)
    if (playerRef) {
      update(playerRef, {
        color: nextColor,
      })
    }
  }

  function handleArrowPress(xChange = 0, yChange = 0) {
    const playerRef = ref(database, `players/${playerId}`)
    if (currentPlayer) {
      const newX = currentPlayer.x + xChange
      const newY = currentPlayer.y + yChange
      if (!isSolid(newX, newY)) {
        currentPlayer.x = newX
        currentPlayer.y = newY
        if (xChange === 1) {
          currentPlayer.direction = "right"
        }
        if (xChange === -1) {
          currentPlayer.direction = "left"
        }
        set(playerRef, currentPlayer)
      }
    }
    attemptGrabCoin(newX, newY)
  }

  function attemptGrabCoin(x, y) {
    const key = getKeyString(x, y)
    if (tempCoins[key]) {
      const coinRef = ref(database, `coins/${key}`)
      const playerRef = ref(database, `players/${playerId}`)
      remove(coinRef)
      update(playerRef, {
        coins: currentPlayer.coins + 1,
      })
    }
  }

  function enableMovement() {
    new KeyPressListener("ArrowUp", () => handleArrowPress(0, -1))
    new KeyPressListener("ArrowDown", () => handleArrowPress(0, 1))
    new KeyPressListener("ArrowLeft", () => handleArrowPress(-1, 0))
    new KeyPressListener("ArrowRight", () => handleArrowPress(1, 0))
  }

  function initGame() {
    const allPlayersRef = ref(database, "players")
    const allCoinsRef = ref(database, "coins")

    onValue(allPlayersRef, (snapshot) => {
      const players = snapshot.val() || {}
      currentPlayer = players[playerId]
      setCharacters(() => {
        return Object.keys(players).map((key) => players[key])
      })
    })

    onChildAdded(allPlayersRef, (snapshot) => {
      const addedPlayer = snapshot.val()

      if (addedPlayer.id === playerId) {
        currentPlayer = addedPlayer
        setCurrentName(addedPlayer.name)
      }
      setCharacters((prev) => {
        return [...prev, addedPlayer]
      })
    })

    onChildAdded(allCoinsRef, (snapshot) => {
      const newCoin = snapshot.val()
      const key = getKeyString(newCoin.x, newCoin.y)
      setCoins((prev) => {
        return [...prev, { ...newCoin, key }]
      })
    })

    onValue(allCoinsRef, (snapshot) => {
      const xCoins = snapshot.val()
      if (xCoins) {
        tempCoins = xCoins
        setCoins(() => {
          return Object.keys(xCoins).map((key) => {
            return { ...coins[key], key }
          })
        })
      } else {
        setCoins([])
      }
    })

    enableMovement()
    // placeCoin()
  }

  function placeCoin() {
    const { x, y } = getRandomSafeSpot()
    const coinRef = ref(database, `coins/${getKeyString(x, y)}`)
    set(coinRef, { x, y })
    setTimeout(() => {
      placeCoin()
    }, randomFromArray(COIN_TIMEOUTS))
  }

  function startGame() {
    signInAnonymously(auth).catch((error) => {
      const errorMessage = error.message
      console.log(errorMessage)
    })

    onAuthStateChanged(auth, (user) => {
      if (user.uid) {
        playerId = user.uid
        const { x, y } = getRandomSafeSpot()
        setUserId(user.uid)
        const playerRef = ref(database, `players/${user.uid}`)
        set(playerRef, {
          id: playerId,
          name: createName(),
          direction: "right",
          color: randomFromArray(PLAYER_COLORS),
          walletAddress: walletAccount,
          x,
          y,
          coins: 0,
        })
        initGame()
        onDisconnect(playerRef).remove()
      }
    })
  }

  useEffect(() => {
    if (walletAccount !== "") {
      startGame()
      placeCoin()
    }
  }, [walletAccount])

  const value = {
    characters,
    handleChangeName,
    handleChangeColor,
    coins,
    userId,
    currentName,
    handleStartGame,
    handleStopGame,
    handleSetWalletAccount,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
