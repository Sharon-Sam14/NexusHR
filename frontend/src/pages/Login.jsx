import { useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import {
    FaEnvelope,
    FaLock
} from "react-icons/fa";

/*
========================================
LOGIN PAGE
========================================
*/

function Login() {

    const navigate = useNavigate();

    /*
    ========================================
    HANDLE LOGIN
    ========================================
    */

    const handleLogin = (e) => {

        e.preventDefault();

        navigate("/dashboard");

    };

    return (

        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4">

            {/* BACKGROUND EFFECT */}

            <div className="absolute w-[400px] h-[400px] bg-cyan-500/20 blur-3xl rounded-full top-10 left-10"></div>

            <div className="absolute w-[400px] h-[400px] bg-blue-500/20 blur-3xl rounded-full bottom-10 right-10"></div>

            {/* LOGIN CARD */}

            <motion.div

                initial={{ opacity: 0, y: 50 }}

                animate={{ opacity: 1, y: 0 }}

                transition={{ duration: 0.5 }}

                className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl"
            >

                {/* TITLE */}

                <div className="text-center mb-8">

                    <h1 className="text-4xl font-bold text-cyan-400">

                        NexusHR

                    </h1>

                    <p className="text-slate-300 mt-2">

                        Smart HR Management System

                    </p>

                </div>

                {/* FORM */}

                <form
                    onSubmit={handleLogin}
                    className="space-y-6"
                >

                    {/* EMAIL */}

                    <div>

                        <label className="text-slate-300 text-sm">

                            Email

                        </label>

                        <div className="flex items-center bg-slate-800 rounded-2xl px-4 mt-2">

                            <FaEnvelope className="text-slate-400" />

                            <input
                                type="email"
                                placeholder="Enter email"
                                className="w-full bg-transparent outline-none px-3 py-4 text-white"
                            />

                        </div>

                    </div>

                    {/* PASSWORD */}

                    <div>

                        <label className="text-slate-300 text-sm">

                            Password

                        </label>

                        <div className="flex items-center bg-slate-800 rounded-2xl px-4 mt-2">

                            <FaLock className="text-slate-400" />

                            <input
                                type="password"
                                placeholder="Enter password"
                                className="w-full bg-transparent outline-none px-3 py-4 text-white"
                            />

                        </div>

                    </div>

                    {/* BUTTON */}

                    <motion.button

                        whileHover={{ scale: 1.03 }}

                        whileTap={{ scale: 0.97 }}

                        type="submit"

                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg"
                    >

                        Login

                    </motion.button>

                </form>

            </motion.div>

        </div>

    );

}

export default Login;