import React from "react"

export default function Character({
  isYou,
  name,
  coins,
  color,
  direction,
  x,
  y,
}) {
  const left = 16 * x
  const top = 16 * y - 4


  return (
    <div
      className={`${isYou && "you"} Character grid-cell`}
      style={{ transform: `translate3d(${left}px, ${top}px, 0)` }}
      data-color={color}
      data-direction={direction}
    >
      <div className="Character_shadow grid-cell"></div>
      <div className="Character_sprite grid-cell"></div>
      <div className="Character_name-container">
        <span className="Character_name">{name}</span>
        <span className="Character_coins">{coins}</span>
      </div>
      <div className="Character_you-arrow"></div>
    </div>
  )
}
