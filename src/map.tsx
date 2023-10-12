import L, { LatLng } from "leaflet"
import {
	MapContainer,
	useMap,
	ImageOverlay,
	FeatureGroup,
	useMapEvent,
	Marker,
	Popup,
	LayersControl,
} from "react-leaflet"
import "./fix map.ts"
import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "./store/store.ts"
import { toggle } from "./store/addSlice.ts"

export const mapScale = 10
const mapBounds: [number, number][] = [
	[-46 / 4.1 / mapScale, -46 / 4.1 / mapScale],
	[(9674 - 46) / 4.1 / mapScale, (15360 - 46) / 4.1 / mapScale],
]

function AutoZoom() {
	const map = useMap()
	useEffect(() => {
		map.fitBounds(mapBounds)
		map.setZoom(3)
		map.setMinZoom(2)
		map.setMaxZoom(7)
	}, [map])
	return null
}

function Cities() {
	return <FeatureGroup></FeatureGroup>
}

function City() {
	// return a marker either in view or edit mode
	return null
}

function AddCity() {
	const [cityName, setCityName] = useState("")
	const [hasTree, setHasTree] = useState(false)
	const [hasCircle, setHasCircle] = useState(false)
	const [coords, setCoords] = useState<LatLng>(new LatLng(-1, -1))
	useMapEvent("click", event => {
		console.log(event)

		setCoords(event.latlng)
	})

	const formRef = useRef<HTMLFormElement>(null)

	async function submit() {
		const lat = coords.lat
		const lng = coords.lng
		const data = { cityName, lat, lng, hasTree, hasCircle }

		console.log(data)
		const res = await fetch(
			`/api/city/${encodeURIComponent(data.cityName)}`,
			{
				method: "PUT",
				body: JSON.stringify(data),
				headers: { "Content-Type": "application/json" },
			},
		)
		if (!res.ok) console.error(res.status, res.statusText, await res.text())
	}

	return (
		<Popup>
			<form
				ref={formRef}
				className="addForm"
				onSubmitCapture={e => {
					e.stopPropagation()
					e.preventDefault()
					void submit()
				}}>
				<div className="formContent">
					<label htmlFor="cityName">City name</label>
					<input
						type="text"
						name="cityName"
						id="cityName"
						value={cityName}
						onChange={e => setCityName(e.target.value)}
					/>
					<label htmlFor="latitude">Latitude</label>
					<input
						type="text"
						name="latitude"
						id="latitude"
						value={coords.lat * mapScale}
						readOnly
					/>
					<label htmlFor="longitude">Longitude</label>
					<input
						type="text"
						name="longitude"
						id="longitude"
						value={coords.lng * mapScale}
						readOnly
					/>
					<label htmlFor="hasTree">Large Tree</label>
					<input
						type="checkbox"
						name="hasTree"
						id="hasTree"
						checked={hasTree}
						onChange={e => setHasTree(e.target.checked)}
					/>
					<label htmlFor="hasCircle">Teleportation Circle</label>
					<input
						type="checkbox"
						name="hasCircle"
						id="hasCircle"
						checked={hasCircle}
						onChange={e => setHasCircle(e.target.checked)}
					/>
				</div>
				<hr />
				<div className="formButtons">
					<button type="submit">Add</button>
				</div>
			</form>
		</Popup>
	)
}

function Mediums() {
	return <FeatureGroup></FeatureGroup>
}

function AddCityControl() {
	const cityMode = useSelector((state: RootState) => state.addCity.value)
	const dispatch = useDispatch()

	return (
		<div className="leaflet-bottom leaflet-right">
			<button
				className="leaflet-control-layers leaflet-control"
				style={{ marginBottom: "2em" }}
				onDoubleClickCapture={e => {
					e.stopPropagation()
					e.preventDefault()
				}}
				onClickCapture={e => {
					e.stopPropagation()
					e.preventDefault()
					dispatch(toggle())
				}}>
				{cityMode ? "Add " : "View/Edit "} city
			</button>
		</div>
	)
}

function Attributions() {
	const map = useMap()
	useEffect(() => {
		map.attributionControl.addAttribution(
			"Map © <a href='https://www.reddit.com/user/Tolemynn/' target='_blank' rel='noreferer noopener'>Tolemynn</a>",
		)
		map.attributionControl.addAttribution(
			"Eberron © <a href='https://dnd.wizards.com/' target='_blank' rel='noreferer noopener'>Wizards of the Coast</a> and <a href='https://keith-baker.com/' target='_blank' rel='noreferer noopener'>Keith Baker</a>",
		)
	}, [map])
	return null
}

function MapClick() {
	const cityMode = useSelector((state: RootState) => state.addCity.value)

	const [coords, setCoords] = useState<LatLng>()
	useMapEvent("click", event => {
		if (!cityMode) return null
		console.log(event)

		setCoords(event.latlng)
	})

	console.log("current mode is: " + cityMode)

	if (!coords) return null

	return (
		<Marker position={coords}>
			<AddCity />
			{/* <Popup autoClose={false}>
				coords are {coords.lat * mapScale} lat {coords.lng * mapScale}
			</Popup> */}
		</Marker>
	)
}

export function Map({ map }: { map: string }) {
	return (
		<>
			{
				<MapContainer crs={L.CRS.Simple} id="khorvaire">
					<AutoZoom />
					<Attributions />
					<MapClick />
					<ImageOverlay
						zIndex={-1}
						url={"/asset/" + map}
						bounds={mapBounds}
					/>
					<LayersControl>
						<LayersControl.Overlay name="city">
							<Cities />
						</LayersControl.Overlay>
						<LayersControl.Overlay name="medium">
							<Mediums />
						</LayersControl.Overlay>
					</LayersControl>
					<AddCityControl />
					<Marker position={[0, 0]}>
						<Popup closeOnClick={false} closeButton={false}>
							Lorem ipsum dolor sit amet consectetur adipisicing
							elit. Iure magni quod mollitia odio harum dolor ad
							architecto veniam? Accusantium neque, beatae ut
							delectus hic fuga eius odio nesciunt iste pariatur.
						</Popup>
					</Marker>
				</MapContainer>
			}
		</>
	)
}
