import Character from "../component/Character"
import Coin from "../component/Coin"
import { useGameAuth } from "../contexts/GameContext"

const PLAYER_COLORS = ["blue", "red", "orange", "yellow", "green", "purple"]

const Index = () => {
  const { characters, playerId, handleChangeName, handleChangeColor, coins } = useGameAuth()


  return (
    <>
      <div className="game-container">
        {characters.map((char, index) => {
          const isYou = char.id === playerId
          return (
          <Character key={index} {...char} isYou={isYou}/>
          )
        })}
        {coins.map((coin, index) => {
          return (
            <Coin key={index} {...coin} />
          )
        })}
      </div>
      <div className="player-info">
      <div>
        <label htmlFor="player-name">Your Name</label>
        <input onChange={e => handleChangeName(e.target.value)} id="player-name" maxLength="10" type="text" />
      </div>
      <div>
        <button onClick={handleChangeColor} id="player-color">Change Color</button>
      </div>
    </div> 
    </>
  )
}

export default Index
