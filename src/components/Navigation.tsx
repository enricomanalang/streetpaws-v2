'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart, UserCircle2, LogOut, Bell, Mail } from 'lucide-react';
import { database } from '@/lib/firebase';
import { ref, onValue, off, update } from 'firebase/database';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user, profile, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const donateUrl = process.env.NEXT_PUBLIC_DONATE_URL || '/donate';

  const navItems = useMemo(
    () => [
      { href: '/', label: 'Home' },
      { href: '/adopt', label: 'Our Animals' },
      { href: '/join-us', label: 'Join Us' },
      { href: '/about', label: 'About Us' },
      { href: '/contact', label: 'Contact Us' },
    ],
    []
  );

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Live notifications listener (sightings)
  useEffect(() => {
    if (!user || !database) return;
    const notifsRef = ref(database, `notifications/${user.uid}`);
    const unsub = onValue(notifsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        const list = Object.keys(data).map((k) => ({ id: k, ...data[k] }));
        // Sort newest first
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(list);
      } else {
        setNotifications([]);
      }
    });
    return () => {
      off(notifsRef, 'value', unsub as any);
    };
  }, [user]);

  const unreadCount = notifications.filter((n) => n.read === false).length;

  const markNotifAsRead = async (notifId: string) => {
    if (!user) return;
    try {
      await update(ref(database, `notifications/${user.uid}/${notifId}`), { read: true });
    } catch (e) {
      console.error('Failed to mark notification as read', e);
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">StreetPaws</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold tracking-wide ${
                  isActive(item.href)
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Donate CTA */}
            <Link href={donateUrl} target={donateUrl.startsWith('http') ? '_blank' : undefined}>
              <Button size="sm" className="font-semibold">
                DONATE
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center gap-3 ml-2">
                {profile?.role === 'admin' ? (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">Admin</Button>
                  </Link>
                ) : (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">Dashboard</Button>
                  </Link>
                )}
                <div className="relative">
                  <button
                    className="ml-1 inline-flex items-center justify-center"
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={isUserMenuOpen}
                  >
                    <UserCircle2 className="w-8 h-8 text-gray-800" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-orange-300 shadow-lg rounded-md p-4 z-50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="rounded-full border-2 border-orange-400 p-1">
                          <UserCircle2 className="w-7 h-7 text-gray-800" />
                        </div>
                        <div className="font-semibold text-gray-800 truncate">{profile?.name || profile?.email || 'User'}</div>
                      </div>
                      <button 
                        className="w-full flex items-center justify-between bg-orange-100 hover:bg-orange-200 text-gray-900 rounded-md px-4 py-2 mb-3"
                        onClick={() => setIsNotifOpen((v) => !v)}
                      >
                        <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> Notification</span>
                        {unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">{unreadCount}</span>
                        )}
                      </button>
                      {isNotifOpen && (
                        <div className="max-h-64 overflow-auto -mx-1 px-1 mb-3 space-y-2">
                          {notifications.length === 0 ? (
                            <div className="text-sm text-gray-600">No notifications</div>
                          ) : (
                            notifications.map((n) => (
                              <div key={n.id} className={`p-3 border rounded-md ${n.read ? 'bg-white' : 'bg-yellow-50'}`}>
                                <div className="text-sm font-medium text-gray-900 mb-1">
                                  {n.type === 'sighting' ? 'New sighting reported' : 'Notification'}
                                </div>
                                {n.petName && <div className="text-sm text-gray-700">Pet: {n.petName}</div>}
                                {n.message && <div className="text-sm text-gray-600 mt-1 line-clamp-2">{n.message}</div>}
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</span>
                                  {!n.read && (
                                    <button className="text-xs text-blue-600 hover:underline" onClick={() => markNotifAsRead(n.id)}>Mark as read</button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md px-4 py-2"
                      >
                        LogOut
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link href="/login" className="inline-flex items-center gap-2 text-gray-800 hover:text-blue-600 text-sm font-semibold" aria-label="Sign in">
                  <UserCircle2 className="w-8 h-8" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 rounded-lg mt-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 text-sm font-semibold ${
                    isActive(item.href)
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <Link
                href={donateUrl}
                target={donateUrl.startsWith('http') ? '_blank' : undefined}
                className="block px-3 py-2"
                onClick={() => setIsOpen(false)}
              >
                <Button size="sm" className="font-semibold">DONATE</Button>
              </Link>
              
              {user ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-full border-2 border-orange-400 p-1">
                        <UserCircle2 className="w-7 h-7 text-gray-800" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {profile?.name || profile?.email || 'User'}
                        </p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {profile?.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Notification Button */}
                  <div className="px-3 py-2">
                    <button 
                      className="w-full flex items-center justify-between bg-orange-100 hover:bg-orange-200 text-gray-900 rounded-md px-4 py-2 mb-3"
                      onClick={() => setIsNotifOpen((v) => !v)}
                    >
                      <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> Notification</span>
                      {unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">{unreadCount}</span>
                      )}
                    </button>
                    
                    {/* Mobile Notification Dropdown */}
                    {isNotifOpen && (
                      <div className="max-h-64 overflow-auto -mx-1 px-1 mb-3 space-y-2">
                        {notifications.length === 0 ? (
                          <div className="text-sm text-gray-600">No notifications</div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className={`p-3 border rounded-md ${n.read ? 'bg-white' : 'bg-yellow-50'}`}>
                              <div className="text-sm font-medium text-gray-900 mb-1">
                                {n.type === 'sighting' ? 'New sighting reported' : 'Notification'}
                              </div>
                              {n.petName && <div className="text-sm text-gray-700">Pet: {n.petName}</div>}
                              {n.message && <div className="text-sm text-gray-600 mt-1 line-clamp-2">{n.message}</div>}
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</span>
                                {!n.read && (
                                  <button className="text-xs text-blue-600 hover:underline" onClick={() => markNotifAsRead(n.id)}>Mark as read</button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Dashboard/Admin Link */}
                  {profile?.role === 'admin' ? (
                    <Link
                      href="/admin"
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
