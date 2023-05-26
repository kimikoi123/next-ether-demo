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
  const [playerId, setPlayerId] = useState("")
  const [nameInput, setNameInput] = useState("")
  const [coins, setCoins] = useState([])
  const [coinElements, setCoinElements] = useState({})

  let tempCoins = {}
  let userId
  let playerRef
  let players = {}

  function placeCoin() {
    const { x, y } = getRandomSafeSpot()
    const coinRef = ref(database, `coins/${getKeyString(x, y)}`)
    set(coinRef, { x, y })
    setTimeout(() => {
      placeCoin()
    }, randomFromArray(COIN_TIMEOUTS))
  }

  function handleChangeName(value) {
    const newName = value || createName()
    playerRef = ref(database, `players/${playerId}`)
    update(playerRef, {
      name: newName,
    })
  }

  function handleChangeColor() {
    const player = characters.find((char) => char.id === playerId)
    const mySkinIndex = PLAYER_COLORS.indexOf(player.color)
    const nextColor = PLAYER_COLORS[mySkinIndex + 1] || PLAYER_COLORS[0]
    playerRef = ref(database, `players/${playerId}`)
    if (playerRef) {
      update(playerRef, {
        color: nextColor,
      })
    }

    console.log(coins)
  }

  useEffect(() => {
    function attemptGrabCoin(x, y) {
      const key = getKeyString(x, y)
      if (tempCoins[key]) {
        const coinRef = ref(database, `coins/${key}`)
        remove(coinRef)
        update(playerRef, {
          coins: players[userId].coins + 1,
        })
      }
    }

    function handleArrowPress(xChange = 0, yChange = 0) {
      const newX = players[userId].x + xChange
      const newY = players[userId].y + yChange
      if (!isSolid(newX, newY)) {
        players[userId].x = newX
        players[userId].y = newY
        if (xChange === 1) {
          players[userId].direction = "right"
        }
        if (xChange === -1) {
          players[userId].direction = "left"
        }
        set(playerRef, players[userId])
      }

      attemptGrabCoin(newX, newY)
    }

    function initGame() {
      const allPlayersRef = ref(database, "players")
      const allCoinsRef = ref(database, "coins")

      onValue(allPlayersRef, (snapshot) => {
        players = snapshot.val() || {}
        setCharacters(() => {
          return Object.keys(players).map((key) => players[key])
        })
      })

      onChildAdded(allPlayersRef, (snapshot) => {
        const addedPlayer = snapshot.val()
        if (addedPlayer) {
          setCharacters((prev) => {
            return [...prev, addedPlayer]
          })
        }
      })

      onChildAdded(allCoinsRef, (snapshot) => {
        const newCoin = snapshot.val()
        const key = getKeyString(newCoin.x, newCoin.y)
        setCoins((prev) => {
          return [...prev, { ...newCoin, key }]
        })
      })

      onValue(allCoinsRef, (snapshot) => {
        const coins = snapshot.val()
        if (coins) {
            tempCoins = coins
            setCoins(() => {
                return Object.keys(coins).map((key) => {
                  return { ...coins[key], key }
                })
              })
        } else {
            setCoins([])
        }
        
      })

    //   placeCoin()
    }

    onAuthStateChanged(auth, (user) => {
      if (user) {
        const { x, y } = getRandomSafeSpot()

        userId = user.uid
        playerRef = ref(database, `players/${userId}`)
        onValue(playerRef, (snapshot) => {
          const player = snapshot.val()
          if (player) {
            setCharacters((prev) => {
              return [
                ...prev,
                {
                  ...player[userId],
                },
              ]
            })
          }
        })
        set(playerRef, {
          id: userId,
          name: createName(),
          direction: "right",
          color: randomFromArray(PLAYER_COLORS),
          x,
          y,
          coins: 0,
        })
        setPlayerId(user.uid)

        onDisconnect(playerRef).remove()
      }
    })

    signInAnonymously(auth).catch((error) => {
      const errorMessage = error.message
      console.log(errorMessage)
    })

    initGame()

    new KeyPressListener("ArrowUp", () => handleArrowPress(0, -1))
    new KeyPressListener("ArrowDown", () => handleArrowPress(0, 1))
    new KeyPressListener("ArrowLeft", () => handleArrowPress(-1, 0))
    new KeyPressListener("ArrowRight", () => handleArrowPress(1, 0))
  }, [])

  const value = {
    characters,
    userId,
    handleChangeName,
    handleChangeColor,
    coins,
    playerId
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
