import { createSlice } from "@reduxjs/toolkit"

export interface AddCityState {
	value: boolean
}

const initialState: AddCityState = {
	value: false,
}

export const addCitySlice = createSlice({
	name: "addCity",
	initialState,
	reducers: {
		toggle: state => {
			state.value = !state.value
			console.log(state.value)
		},
	},
})

export const { toggle } = addCitySlice.actions
export default addCitySlice.reducer
