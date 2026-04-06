import {createSlice} from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        userData: null,
        isLoading: true,   
    },

    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
            state.isLoading = false;   
        },
    }
})

export const {setUserData} = userSlice.actions;

export default userSlice.reducer;

