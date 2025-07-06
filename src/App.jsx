// import { useState } from 'react'

import './App.css'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Home from './pages/Home'
import EditorPages from './pages/EditorPages'
import { Toaster } from 'react-hot-toast'
function App() {
  


  return (
    <>
    <div>
      <Toaster
        position="top-right"
        toastOptions={{
          success:{
            theme: {
              primary: '#4aed88',
            },
          },
        }}
      ></Toaster>
    </div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor/:roomId" element={<EditorPages />} />
           {/* <Route path="/editor" element={<Navigate to="/" />} />   */}
        </Routes>
      </BrowserRouter>
      
    </>
  )
}

export default App
