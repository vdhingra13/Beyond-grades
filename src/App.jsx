import React,{useState} from 'react'
import LandingPage from './components/LandingPage.jsx'
import QuizLauncher from './components/QuizLauncher.jsx'
export default function App(){const [started,setStarted]=useState(false);return (<div>{!started?<LandingPage onStart={()=>setStarted(true)}/>:<QuizLauncher/>}</div>)}
