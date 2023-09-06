import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Stream from './views/Stream'
import "./App.scss";
import "sweetalert2/src/sweetalert2.scss";
import Login from './views/Login';
import PageNotFound from './views/PageNotFound';
import Register from './views/Register';
import Startup from './views/Startup';
import Room from './views/Room';
import Layout from './views/Layout';

const App = () => {
  return (
    <>

      <Routes>
        <Route path="/" element={<Login />} />
        {/* <Route path="/register" element={<Register />} /> */}
        <Route path="*" element={<PageNotFound />} />

        {/* <Route path="/" element={<Layout />}> */}
          <Route path="/stream" element={<Stream />} />
          <Route path="/room" element={<Room />} />
        {/* </Route> */}
      </Routes>
    </>
  )
}

export default App