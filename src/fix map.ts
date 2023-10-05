import L from "leaflet"
import "leaflet/dist/leaflet.css"

// https://github.com/PaulLeCam/react-leaflet/issues/453
//@ts-expect-error it exists
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
	iconRetinaUrl: "/asset/marker-icon-2x.png",
	iconUrl: "/asset/marker-icon.png",
	shadowUrl: "/asset/marker-shadow.png",
})
