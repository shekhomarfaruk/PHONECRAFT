import { useState, useEffect, useRef } from "react";
import Icons from "../Icons.jsx";
import { I18N } from "../i18n.js";

function TeamChatScreen({user, lang}) {
  const t = I18N[lang] || I18N.en;
  const [messages,setMessages]=useState([
    {id:1,from:'Rahim B.',  text:'Anyone need help getting started?',       mine:false,time:'10:20'},
    {id:2,from:'Sonia K.',  text:'I just manufactured my 5th device today!', mine:false,time:'10:24'},
    {id:3,from:t.you,       text:'Great job! Keep it up!',                   mine:true, time:'10:25'},
    {id:4,from:'Jamal T.',  text:'What plan should I upgrade to?',           mine:false,time:'10:30'},
  ]);
  const [msg,setMsg]=useState(''); const bottomRef=useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[messages]);
  const send=()=>{
    if(!msg.trim())return;
    setMessages(p=>[...p,{id:Date.now(),from:t.you,text:msg,mine:true,time:new Date().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})}]);
    setMsg('');
  };
  return (
    <>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14,flexWrap:'wrap'}}>
        <div className="screen-title" style={{marginBottom:0}}><Icons.Chat size={18}/> {t.team_chat}</div>
        <span className="badge badge-green">{(user.teamMembers?.length||0)+1} {t.members_suffix}</span>
      </div>
      <div className="card" style={{minHeight:280,display:'flex',flexDirection:'column',marginBottom:14}}>
        <div className="chat-messages" style={{flex:1}}>
          {messages.map(m=>(
            <div key={m.id} className={`chat-msg ${m.mine?'mine':''}`}>
              {!m.mine&&<div className="chat-av">{m.from[0]}</div>}
              <div>
                {!m.mine&&<div style={{fontSize:10,color:'var(--text2)',marginBottom:3}}>{m.from}</div>}
                <div className={`chat-bubble ${m.mine?'mine':'other'}`}>{m.text}</div>
                <div style={{fontSize:10,color:'var(--text2)',marginTop:2,textAlign:m.mine?'right':'left'}}>{m.time}</div>
              </div>
            </div>
          ))}
          <div ref={bottomRef}/>
        </div>
      </div>
      <div className="chat-input-row">
        <input className="inp" style={{flex:1}} placeholder={t.type_msg} value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}/>
        <button className="btn btn-primary" onClick={send} style={{padding:'10px 16px'}}><Icons.Send size={18}/></button>
      </div>
    </>
  );
}

export default TeamChatScreen;
