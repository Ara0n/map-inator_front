import { createRoot } from "react-dom/client"
import "./index.scss"
import { Map } from "./map"
import { Provider } from "react-redux"
import { store } from "./store/store"

function App() {
	return (
		<Provider store={store}>
			<Map map="Khorvaire.jpg" />
		</Provider>
	)
}

createRoot(document.querySelector("#app")!).render(<App />)
