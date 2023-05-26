import { GameContextProvider } from "../contexts/GameContext"
import "../styles/globals.css"
import Head from "next/head"


function MyApp({ Component, pageProps }) {
  return (
    <GameContextProvider>
        <Head>
          <title>Multiplayer Demo</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Head>
        <Component {...pageProps} />
    </GameContextProvider>
  )
}

export default MyApp
