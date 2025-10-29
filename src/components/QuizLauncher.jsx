import React,{useState} from 'react'
import MenuTree from './MenuTree.jsx'
import Breadcrumbs from './Breadcrumbs.jsx'
import Quiz from './Quiz.jsx'
export default function QuizLauncher(){const [topic,setTopic]=useState(null);return(<div className='flex' style={{minHeight:'100vh'}}><aside className='sidebar'><MenuTree onSelect={setTopic}/></aside><main className='grow'><div className='container'><Breadcrumbs trail={topic?.trail}/>{!topic?<p>Select a quiz from the menu.</p>:(<Quiz filePath={`/src/data/economics/sem1/game_theory/${topic.file}`} titleForEmail={`Economics – Game Theory – ${topic.name}`}/>)}</div></main></div>)}
