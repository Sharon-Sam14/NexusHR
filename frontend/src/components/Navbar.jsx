import { FaBell, FaSearch, FaUserCircle } from "react-icons/fa";

/*
========================================
NAVBAR COMPONENT
========================================
*/

function Navbar() {

    return (

        <div className="h-[90px] bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">

            {/* SEARCH */}

            <div className="flex items-center bg-slate-800 px-4 py-3 rounded-2xl w-[350px]">

                <FaSearch className="text-slate-400" />

                <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent outline-none text-white px-3 w-full"
                />

            </div>

            {/* RIGHT */}

            <div className="flex items-center gap-6">

                <button className="relative text-2xl text-slate-300 hover:text-white">

                    <FaBell />

                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>

                </button>

                <div className="flex items-center gap-3">

                    <FaUserCircle className="text-4xl text-cyan-400" />

                    <div>

                        <h3 className="text-white font-semibold">

                            Admin User

                        </h3>

                        <p className="text-slate-400 text-sm">

                            HR Manager

                        </p>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default Navbar;