import React,{useState,useEffect} from 'react'

export default function Sidebar(){

    return(
        <>
        <div className="w-64 h-screen bg-blue-800 text-white flex flex-col">
            <button>About</button>
            <button>Login</button>
            <button>Register</button>

        </div>
        
        </>
    )
}