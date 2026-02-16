"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "./header.css";

const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><rect width="100%" height="100%" rx="18" fill="%23e6eef7"/><text x="50%" y="52%" font-size="16" text-anchor="middle" fill="%2394a3b8" font-family="Arial" dy=".35em">?</text></svg>'

type HeaderUser = {
  avatar?: string | null
}

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState<HeaderUser | null>(null);

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Esc") setShowMenu(false)
    }
    window.addEventListener("keydown", onKeydown)
    return () => window.removeEventListener("keydown", onKeydown)
  }, [])

  function toggleMenu() {
    setShowMenu((s) => !s)
  }

  async function signInWithDiscord() {
    try {
      window.location.href = '/signin'
    } catch (e) {
      console.error(e)
    }
  }

  async function signOut() {
    setUser(null)
    window.location.href = '/'
  }

  const userAvatar = user?.avatar || DEFAULT_AVATAR

  return (
    <header className="app-header">
      <div className="left">
        <Image alt="Logo" className="logo" src="/favicon.ico" width={24} height={24} priority />
        <Link href="/">
          <h1 className="title">Wadam</h1>
        </Link>
        <Link href="/trips/expense/new" className="ml-4 px-3 py-1 bg-teal-500 text-white rounded-md hover:bg-teal-600 text-sm">
          支出を追加
        </Link>
      </div>

      <div className="right">
        <button
          className={`burger ${showMenu ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Open navigation"
          aria-expanded={showMenu}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

        {showMenu && <div className="mobile-backdrop" onClick={toggleMenu} />}

        {showMenu && (
          <div className="mobile-menu" role="menu" onClick={(e) => e.stopPropagation()}>
            <Link href="/" className="mobile-link" role="menuitem" onClick={toggleMenu}>ホーム</Link>
            {user ? (
              <button className="signout" onClick={signOut} role="menuitem">Sign Out</button>
            ) : (
              <button className="signout" onClick={signInWithDiscord} role="menuitem">Sign In</button>
            )}
          </div>
        )}

        <div className="user-wrap">
          {user ? (
            <Link href="/dashboard">
              <Image
                src={userAvatar}
                alt="User Avatar"
                className="avatar"
                width={36}
                height={36}
                unoptimized
              />
            </Link>
          ) : (
            <button className="avatar-btn" onClick={signInWithDiscord} aria-label="Sign in">
              <Image
                src={userAvatar}
                alt="User Avatar"
                className="avatar"
                width={36}
                height={36}
                unoptimized
              />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
