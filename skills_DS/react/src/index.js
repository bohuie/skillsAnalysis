import React from "react"
import ReactDOM from "react-dom"
import {BrowserRouter, Routes, Route} from "react-router-dom"
import App from "./components/App"
import Questions from "./components/Questions"
import GetSkills from "./components/admin/GetSkills"
import BrowseSkills from "./components/admin/BrowseSkills"
import Upload from "./components/Upload"
import Profile from "./components/Profile"

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin/skills" element={<GetSkills />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/admin/browse-skills" element={<BrowseSkills />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile_new" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
