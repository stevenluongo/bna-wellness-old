import { Session } from "next-auth";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ReactElement, ReactNode } from "react";
import { api } from "~/utils/api";

interface NavbarLinkProps {
  href: string;
  children: ReactNode;
  pathname?: string;
  admin?: boolean;
  isAdmin?: boolean;
}

interface NavbarGroupProps {
  children: ReactElement[];
  session: Session | null;
}

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav
      className="mx-auto h-[60px] w-full max-w-[85rem] px-4 sm:flex sm:items-center sm:justify-between"
      aria-label="Global"
    >
      <Link
        href="/"
        className="flex-none cursor-pointer text-xl font-semibold dark:text-white"
      >
        <Image
          width={60}
          height={60}
          alt="bnanwellness logo"
          src="/bna_black.png"
        />
      </Link>
      {session?.user && (
        <NavbarGroup session={session}>
          <NavbarLink href="/">Dashboard</NavbarLink>
          <NavbarLink href="/clients">Clients</NavbarLink>
          <NavbarLink href="/messages">Messages</NavbarLink>
          <NavbarLink href="/terminal">Terminal</NavbarLink>
          <NavbarEventsLink href="/events">Events</NavbarEventsLink>
          <NavbarLink admin href="/admin/memberships">
            Memberships
          </NavbarLink>
          <NavbarLink admin href="/admin/rooms">
            Rooms
          </NavbarLink>
          <NavbarLink admin href="/admin/users">
            Users
          </NavbarLink>
        </NavbarGroup>
      )}
      <button
        onClick={session ? () => void signOut() : () => void signIn()}
        className="text-sm"
      >
        {session ? "Sign Out" : "Sign In"}
      </button>
    </nav>
  );
}

export function NavbarGroup(props: NavbarGroupProps) {
  const { session, children } = props;
  const router = useRouter();
  return (
    <div className="mt-5 flex flex-row items-center gap-5 overflow-x-auto pb-2 sm:mt-0 sm:justify-end sm:overflow-x-visible sm:pb-0 sm:pl-5">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          pathname: router.pathname,
          isAdmin: session?.user.role === "ADMIN",
        })
      )}
    </div>
  );
}

export function NavbarLink(props: NavbarLinkProps) {
  const { href, children, pathname, admin, isAdmin } = props;
  if (admin && !isAdmin) {
    return null;
  }
  const classes =
    pathname === href
      ? "text-blue-500 hover:text-blue-300"
      : "text-gray-600 hover:text-gray-400";
  return (
    <Link className={`text-sm ${classes}`} href={href}>
      {children}
    </Link>
  );
}

export function NavbarEventsLink(props: NavbarLinkProps) {
  const { href, children, pathname, admin, isAdmin } = props;
  const router = useRouter();
  const utils = api.useContext();
  if (admin && !isAdmin) {
    return null;
  }
  const classes =
    pathname === href
      ? "text-blue-500 hover:text-blue-300"
      : "text-gray-600 hover:text-gray-400";
  return (
    <a
      className={`text-sm ${classes} cursor-pointer`}
      onClick={async () => {
        const defaultEvent = JSON.parse(
          localStorage.getItem("defaultEvent") || "{}"
        );
        if (!defaultEvent.value) {
          const rooms = await utils.rooms.ids.fetch();
          localStorage.setItem(
            "defaultEvent",
            JSON.stringify({ value: rooms[0]?.id })
          );
          return router.push(`${href}/${rooms[0]?.id}`);
        }
        router.push(`${href}/${defaultEvent.value}`);
      }}
    >
      {children}
    </a>
  );
}
