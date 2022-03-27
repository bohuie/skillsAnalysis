import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Questions from "./pages/Questions"
import Upload from "./pages/Upload"
import Profile from "./pages/Profile"
import GetSkills from "./pages/admin/GetSkills"
import BrowseSkills from "./pages/admin/BrowseSkills"
import SkillsGender from "./pages/admin/SkillsGender"
import SkillsYear from "./pages/admin/SkillsYear"

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/questions" element={<Questions />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/skills" element={<GetSkills />} />
        <Route path="/admin/browse-skills" element={<BrowseSkills />} />
        <Route path="/admin/skills-gender" element={<SkillsGender />} />
        <Route path="/admin/skills-year" element={<SkillsYear />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
