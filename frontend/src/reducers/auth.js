import {createSlice} from "@reduxjs/toolkit";

export const auth = createSlice({
    name: "auth",
    initialState:{
        users: JSON.parse(localStorage.getItem("user", {})),
    },

    reducers : {
        setAuth:(state, action)=>{
            localStorage.setItem("user", JSON.stringify(action.payload))
            state.users = action.payload
        }
    }

})
export const {setAuth} = auth.actions;
export default auth.reducer;