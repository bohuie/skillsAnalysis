import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Questions from "./pages/Questions"
import Upload from "./pages/Upload"
import Profile from "./pages/Profile"
import GetSkills from "./pages/admin/GetSkills"
import BrowseSkills from "./pages/admin/BrowseSkills"
import WordCloud from "./pages/WordCloud"
import ViewSkills from "./pages/ViewSkills"
import MatchJobs from "./pages/MatchJobs"

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/questions" element={<Questions />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/word-cloud" element={<WordCloud/>} />
        <Route path="/admin/skills" element={<GetSkills />} />
        <Route path="/admin/browse-skills" element={<BrowseSkills />} />
        <Route path="/view-skills" element={<ViewSkills/>} />
        <Route path="/match-jobs" element={<MatchJobs />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
