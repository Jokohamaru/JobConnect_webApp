'use client'

import { useState, useRef, useEffect } from "react";
import { Menu ,CircleUserRound, BriefcaseBusiness, FileText,  } from 'lucide-react';
import MenuList from "./MenuList";
interface UserMenuProps{
    avatarUserUrl: string,
    nameUser: string,
    stateUser: boolean,
    idUser: string,
    emailUser: string
}
export default function UserInfo( {avatarUserUrl, nameUser, stateUser, idUser, emailUser }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Close when click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
   
      <img
        src="https://i.pravatar.cc/40"
        alt="avatar"
        className="w-10 h-10 rounded-full cursor-pointer"
        onClick={() => setOpen(!open)}
      />


      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-lg z-100">
          {/* User Info */}
          <div className="flex items-center gap-3 p-4 pb-3">
            <img
              src="https://i.pravatar.cc/40"
              alt="avatar"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-semibold">{nameUser}</p>
              <p className="text-sm text-gray-500">{stateUser}</p>
              <p className="text-xs text-gray-400"> ID: {idUser}</p>
              <p className="text-xs text-gray-400">{emailUser}</p>
            </div>
          </div>

          <MenuList onClose={() => setOpen(false)}/>
        </div>
      )}
    </div>
  );
}
