import React, { useState, useEffect } from 'react';
import About from '../components/About';
import Login from '../components/Login';
import Register from '../components/Register';

export default function Home() {


    return (
        <>
        <About />

        <Login/>

        <Register/>
        </>
    )
}