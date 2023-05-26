import React from "react"

export default function Coin({ x, y }) {

  const left = 16 * x
  const top = 16 * y - 4

  return (
    <div
      className="Coin grid-cell"
      style={{ transform: `translate3d(${left}px, ${top}px, 0)` }}
    >
      <div className="Coin_shadow grid-cell"></div>
      <div className="Coin_sprite grid-cell"></div>
    </div>
  )
}
